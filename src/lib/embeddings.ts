import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

// ---- Local TF-IDF-style embeddings (no API needed) ----

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

// Build a simple bag-of-words vector from a shared vocabulary
let vocabulary: string[] = [];
const vocabIndex = new Map<string, number>();

function ensureVocab(tokens: string[]) {
  for (const t of tokens) {
    if (!vocabIndex.has(t)) {
      vocabIndex.set(t, vocabulary.length);
      vocabulary.push(t);
    }
  }
}

function toVector(tokens: string[]): number[] {
  ensureVocab(tokens);
  const vec = new Array(vocabulary.length).fill(0);
  for (const t of tokens) {
    const idx = vocabIndex.get(t);
    if (idx !== undefined) vec[idx] += 1;
  }
  return vec;
}

export async function generateSingleEmbedding(text: string): Promise<number[]> {
  return toVector(tokenize(text));
}

export async function splitDocumentIntoChunks(
  text: string,
  chunkSize: number = 1000,
  chunkOverlap: number = 200
): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });

  const chunks = await splitter.splitText(text);
  return chunks;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (const text of texts) {
    results.push(await generateSingleEmbedding(text));
  }
  return results;
}

export function calculateCosineSimilarity(a: number[], b: number[]): number {
  // Pad shorter vector with zeros so lengths match
  const len = Math.max(a.length, b.length);
  const va = a.length < len ? [...a, ...new Array(len - a.length).fill(0)] : a;
  const vb = b.length < len ? [...b, ...new Array(len - b.length).fill(0)] : b;

  const dotProduct = va.reduce((sum, val, i) => sum + val * vb[i], 0);
  const magnitudeA = Math.sqrt(va.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vb.reduce((sum, val) => sum + val * val, 0));

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}
