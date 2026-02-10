import fs from 'fs';
import path from 'path';
import { extractTextFromPDF } from './pdf-loader';
import { splitDocumentIntoChunks } from './embeddings';
import { vectorStore } from './vector-store';
import { getAllEmbeddedPDFContent } from './embedded-pdfs';
import { v4 as uuidv4 } from 'uuid';

const BACKEND_PDFS_PATH = path.join(process.cwd(), 'backend', 'pdfs');

export async function initializeDocuments(): Promise<void> {
  try {
    if (vectorStore.getAllDocuments().length > 0) {
      console.log('📚 Vector store already initialized. Skipping PDF load.');
      return;
    }

    let pdfSources: Array<{ filename: string; text: string }> = [];

    // Try loading from live backend/pdfs first
    if (fs.existsSync(BACKEND_PDFS_PATH)) {
      const files = fs.readdirSync(BACKEND_PDFS_PATH);
      const pdfFiles = files.filter((file) => file.toLowerCase().endsWith('.pdf'));

      if (pdfFiles.length > 0) {
        console.log(`\n🚀 Loading ${pdfFiles.length} PDF(s) from backend/pdfs...`);

        for (const pdfFile of pdfFiles) {
          const filePath = path.join(BACKEND_PDFS_PATH, pdfFile);

          try {
            console.log(`📖 Processing: ${pdfFile}`);
            const fileBuffer = fs.readFileSync(filePath);
            const file = typeof File !== 'undefined'
              ? new File([fileBuffer], pdfFile, { type: 'application/pdf' })
              : ({
                  name: pdfFile,
                  arrayBuffer: async () => fileBuffer,
                } as unknown as File);

            const text = await extractTextFromPDF(file);
            pdfSources.push({ filename: pdfFile, text });
            console.log(`✅ ${pdfFile}: Extracted (${text.length} chars)`);
          } catch (error) {
            console.error(`❌ Error processing ${pdfFile}:`, error);
          }
        }
      }
    }

    // Fallback: Load from embedded cache if backend/pdfs not available
    if (pdfSources.length === 0) {
      console.log('📁 backend/pdfs not accessible. Loading from embedded PDF cache...');
      pdfSources = await getAllEmbeddedPDFContent();

      if (pdfSources.length === 0) {
        console.log('⚠️  No PDFs found anywhere. Vector store will be empty.');
        return;
      }

      console.log(`✅ Loaded ${pdfSources.length} PDF(s) from cache`);
    }

    // Process all PDF sources
    for (const { filename, text } of pdfSources) {
      try {
        const chunks = await splitDocumentIntoChunks(text);

        for (let i = 0; i < chunks.length; i++) {
          const chunkId = `${filename}_chunk_${i}_${uuidv4()}`;
          await vectorStore.addDocument(
            chunkId,
            chunks[i],
            filename,
            Math.floor(i / 3) + 1 // Rough estimate of page number
          );
        }

        console.log(`✅ ${filename}: ${chunks.length} chunks loaded`);
      } catch (error) {
        console.error(`❌ Error chunking ${filename}:`, error);
      }
    }

    const totalDocs = vectorStore.getAllDocuments().length;
    console.log(
      `\n✨ Initialization complete! Loaded ${totalDocs} total document chunks.\n`
    );
  } catch (error) {
    console.error('❌ Error during document initialization:', error);
  }
}
