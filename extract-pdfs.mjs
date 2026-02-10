#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const PDFParse = require('pdf-parse');

async function extractTextFromPDF(buffer) {
  const data = await PDFParse(buffer);
  return data.text || '';
}

async function extractAndCacheAllPDFs() {
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

  const cache = {};

  console.log(`\n🔄 Extracting ${files.length} PDF(s)...`);

  for (const filename of files) {
    try {
      const filePath = path.join(pdfsDir, filename);
      const fileBuffer = fs.readFileSync(filePath);
      
      const text = await extractTextFromPDF(fileBuffer);
      
      cache[filename] = {
        text,
        extractedAt: new Date().toISOString(),
      };

      console.log(`✅ Extracted: ${filename} (${text.length} chars)`);
    } catch (err) {
      console.error(`❌ Failed to extract ${filename}:`, err);
    }
  }

  const cacheFile = path.join(process.cwd(), '.pdf-cache.json');
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
  console.log(`\n📦 PDF cache saved to .pdf-cache.json (${Object.keys(cache).length} files)\n`);
}

console.log('🚀 Running PDF extraction build step...\n');

extractAndCacheAllPDFs()
  .then(() => {
    console.log('✨ PDF extraction complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ PDF extraction failed:', err);
    process.exit(1);
  });
