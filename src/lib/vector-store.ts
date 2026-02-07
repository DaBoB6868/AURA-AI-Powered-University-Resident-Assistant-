import { generateSingleEmbedding, calculateCosineSimilarity } from './embeddings';

interface StoredDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    source: string;
    pageNumber?: number;
    uploadDate: Date;
  };
}

class VectorStore {
  private documents: StoredDocument[] = [];
  private documentIndex: Map<string, number> = new Map();

  async addDocument(
    id: string,
    content: string,
    source: string,
    pageNumber?: number
  ): Promise<void> {
    try {
      const embedding = await generateSingleEmbedding(content);

      const document: StoredDocument = {
        id,
        content,
        embedding,
        metadata: {
          source,
          pageNumber,
          uploadDate: new Date(),
        },
      };

      this.documentIndex.set(id, this.documents.length);
      this.documents.push(document);
    } catch (error) {
      console.error(`Error adding document ${id}:`, error);
      throw error;
    }
  }

  async search(query: string, topK: number = 5): Promise<StoredDocument[]> {
    try {
      const queryEmbedding = await generateSingleEmbedding(query);

      const scores = this.documents.map((doc) => ({
        doc,
        score: calculateCosineSimilarity(queryEmbedding, doc.embedding),
      }));

      return scores
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map((item) => item.doc);
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }

  getAllDocuments(): StoredDocument[] {
    return this.documents;
  }

  deleteDocument(id: string): boolean {
    const index = this.documentIndex.get(id);
    if (index !== undefined) {
      this.documents.splice(index, 1);
      this.documentIndex.delete(id);
      // Rebuild index
      this.rebuildIndex();
      return true;
    }
    return false;
  }

  private rebuildIndex(): void {
    this.documentIndex.clear();
    this.documents.forEach((doc, index) => {
      this.documentIndex.set(doc.id, index);
    });
  }

  clear(): void {
    this.documents = [];
    this.documentIndex.clear();
  }
}

export const vectorStore = new VectorStore();
export type { StoredDocument };
