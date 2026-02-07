import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/lib/pdf-loader';
import { splitDocumentIntoChunks } from '@/lib/embeddings';
import { vectorStore } from '@/lib/vector-store';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Extract text from PDF
    const text = await extractTextFromPDF(file);

    // Split into chunks
    const chunks = await splitDocumentIntoChunks(text);

    // Add chunks to vector store
    const documentIds: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunkId = `${file.name}_chunk_${i}_${uuidv4()}`;
      await vectorStore.addDocument(
        chunkId,
        chunks[i],
        file.name,
        Math.floor(i / 3) + 1 // Rough estimate of page number
      );
      documentIds.push(chunkId);
    }

    return NextResponse.json({
      success: true,
      filename: file.name,
      chunks: chunks.length,
      documentIds,
      message: `Successfully processed ${file.name} with ${chunks.length} chunks`,
    });
  } catch (error) {
    console.error('PDF upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const documents = vectorStore.getAllDocuments();
    const sources = [
      ...new Set(documents.map((doc) => doc.metadata.source)),
    ];

    return NextResponse.json({
      totalDocuments: documents.length,
      sources,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
