const { PDFParse } = require('pdf-parse');
const fs = require('fs');

const pdfBuffer = fs.readFileSync('./backend/pdfs/community_guide (1).pdf');

const parser = new PDFParse({ data: pdfBuffer });
parser.getText().then(data => {
  console.log('Extracted', data.text.length, 'characters');
  const cache = {};
  cache['community_guide (1).pdf'] = {
    text: data.text,
    extractedAt: new Date().toISOString()
  };
  fs.writeFileSync('.pdf-cache.json', JSON.stringify(cache, null, 2));
  console.log('Saved to .pdf-cache.json');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
