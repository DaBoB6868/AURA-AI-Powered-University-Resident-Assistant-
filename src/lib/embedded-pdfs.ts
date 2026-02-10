// This file stores extracted PDF content at build time to ensure
// availability on Vercel and other serverless platforms

import fs from 'fs';
import path from 'path';
import { extractTextFromPDF } from './pdf-loader';

interface EmbeddedPDFCache {
  [filename: string]: {
    text: string;
    extractedAt: string;
  };
}

// Try to load pre-extracted PDFs from build cache
function loadEmbeddedPDFCache(): EmbeddedPDFCache | null {
  const cacheFile = path.join(process.cwd(), '.pdf-cache.json');
  if (fs.existsSync(cacheFile)) {
    try {
      const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
      console.log('📚 Loaded embedded PDF cache from build');
      return cache;
    } catch (err) {
      console.warn('Failed to load PDF cache:', err);
    }
  }
  return null;
}

let cachedPDFs: EmbeddedPDFCache | null = null;

export async function getEmbeddedPDFContent(filename: string): Promise<string | null> {
  // Try loading from cache first
  if (!cachedPDFs) {
    cachedPDFs = loadEmbeddedPDFCache();
  }

  if (cachedPDFs && cachedPDFs[filename]) {
    return cachedPDFs[filename].text;
  }

  return null;
}

export async function getAllEmbeddedPDFContent(): Promise<Array<{ filename: string; text: string }>> {
  if (!cachedPDFs) {
    cachedPDFs = loadEmbeddedPDFCache();
  }

  if (!cachedPDFs) {
    return [];
  }

  return Object.entries(cachedPDFs).map(([filename, data]) => ({
    filename,
    text: data.text,
  }));
}

// This function is called by the build script to extract PDFs
export async function extractAndCacheAllPDFs(): Promise<void> {
  const pdfsDir = path.join(process.cwd(), 'backend', 'pdfs');
  
  if (!fs.existsSync(pdfsDir)) {
    console.log('⚠️  No backend/pdfs folder found. Skipping PDF extraction.');
    return;
  }

  const files = fs.readdirSync(pdfsDir).filter((f) => f.toLowerCase().endsWith('.pdf'));
  
  if (files.length === 0) {
    console.log('⚠️  No PDFs found in backend/pdfs.');
    return;
  }

  const cache: EmbeddedPDFCache = {};

  console.log(`\n🔄 Extracting ${files.length} PDF(s)...`);

  for (const filename of files) {
    try {
      const filePath = path.join(pdfsDir, filename);
      const fileBuffer = fs.readFileSync(filePath);
      
      const file = typeof File !== 'undefined'
        ? new File([fileBuffer], filename, { type: 'application/pdf' })
        : ({
            name: filename,
            arrayBuffer: async () => fileBuffer,
          } as unknown as File);

      const text = await extractTextFromPDF(file);
      
      cache[filename] = {
        text,
        extractedAt: new Date().toISOString(),
      };

      console.log(`✅ Extracted: ${filename} (${text.length} chars)`);
    } catch (err) {
      console.error(`❌ Failed to extract ${filename}:`, err);
    }
  }

  // Save to cache file
  const cacheFile = path.join(process.cwd(), '.pdf-cache.json');
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
  console.log(`\n📦 PDF cache saved to .pdf-cache.json (${Object.keys(cache).length} files)\n`);
}
