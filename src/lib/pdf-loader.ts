export async function extractTextFromPDF(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  
  // For server-side: use dynamic import
  if (typeof window === 'undefined') {
    // Server-side: use pdf-parse
    try {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(Buffer.from(buffer));
      return data.text;
    } catch (error) {
      console.error('Error parsing PDF on server:', error);
      throw error;
    }
  } else {
    // Client-side: use pdfjs-dist
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      let fullText = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += `\n--- Page ${pageNum} ---\n${pageText}`;
      }

      return fullText;
    } catch (error) {
      console.error('Error parsing PDF on client:', error);
      throw error;
    }
  }
}

export async function extractPDFMetadata(file: File): Promise<{
  filename: string;
  pageCount: number;
  uploadDate: Date;
}> {
  const buffer = await file.arrayBuffer();

  // For server-side
  if (typeof window === 'undefined') {
    try {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(Buffer.from(buffer));
      return {
        filename: file.name,
        pageCount: data.numpages,
        uploadDate: new Date(),
      };
    } catch (error) {
      console.error('Error extracting PDF metadata on server:', error);
      throw error;
    }
  } else {
    // Client-side
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

      return {
        filename: file.name,
        pageCount: pdf.numPages,
        uploadDate: new Date(),
      };
    } catch (error) {
      console.error('Error extracting PDF metadata on client:', error);
      throw error;
    }
  }
}
