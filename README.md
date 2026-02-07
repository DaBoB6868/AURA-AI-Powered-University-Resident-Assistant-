# Dorm RA Chatbot with RAG

A Next.js-based intelligent chatbot system designed for Resident Assistants (RAs) to efficiently answer questions about dorm policies, community guidelines, and residential life. The system uses Retrieval-Augmented Generation (RAG) with OpenAI embeddings to provide accurate, context-aware responses.

## Features

- **PDF Ingestion**: Upload and process community guides, policies, and residential information
- **Retrieval-Augmented Generation (RAG)**: Intelligent document retrieval with semantic search
- **Vector Embeddings**: OpenAI embeddings for high-quality semantic understanding
- **Chat Interface**: Modern, responsive web interface for real-time conversations
- **Source Attribution**: Chatbot responses include references to source documents
- **Conversation History**: Maintains context across multiple exchanges

## Quick Start

1. **Install dependencies**: `npm install`
2. **Set up `.env.local`**:
   ```env
   OPENAI_API_KEY=sk-your-api-key-here
   ```
3. **Run development server**: `npm run dev`
4. **Open** [http://localhost:3000](http://localhost:3000)

## Setup Instructions

### Prerequisites
- Node.js 18+
- OpenAI API Key ([Get one here](https://platform.openai.com/api-keys))

### Installation
```bash
npm install
```

### Configuration
Create `.env.local`:
```env
OPENAI_API_KEY=sk-your-api-key-here
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Running
```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## Usage

1. **Upload PDFs**: Use the sidebar to upload community guide PDFs
2. **Ask Questions**: Type in the chat interface
3. **View Sources**: Click "Show sources" to see referenced documents

## Project Structure

```
src/
├── app/api/
│   ├── chat/route.ts          # Chat endpoint
│   └── documents/route.ts     # PDF upload
├── components/
│   ├── ChatComponent.tsx      # Chat UI
│   └── PDFUploadComponent.tsx # Upload UI
└── lib/
    ├── embeddings.ts          # Vector embeddings
    ├── rag-service.ts         # RAG pipeline
    ├── pdf-loader.ts          # PDF processing
    └── vector-store.ts        # Vector storage
```

## How It Works

1. **Upload PDFs** → Text extracted and split into chunks
2. **Generate Embeddings** → Each chunk converted to vectors
3. **Store Vectors** → Embeddings saved in memory store 
4. **User Query** → Query embedded and compared to documents
5. **Retrieve Context** → Top matching chunks retrieved
6. **Generate Response** → LLM responds using retrieved context

## API Endpoints

### POST /api/documents
Upload a PDF file

### POST /api/chat
Send a message and get RAG response

### GET /api/documents
Get list of uploaded documents

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **AI**: LangChain, OpenAI
- **Styling**: Tailwind CSS
- **PDF**: pdf-parse, pdfjs-dist
- **Icons**: Lucide React

## Customization

### Change System Prompt
Edit `src/lib/rag-service.ts`

### Modify Appearance
Tailwind classes in component files

### Different LLM/Embeddings
Update `src/lib/rag-service.ts` and `src/lib/embeddings.ts`

## Troubleshooting

- **API Key Error**: Check `.env.local` and restart dev server
- **PDF Upload Fails**: Ensure valid PDF, check console for errors
- **Slow Responses**: First query slower due to embeddings
- **Build Error**: Run `npm install --legacy-peer-deps`

## Future Enhancements

- Persistent vector database (Pinecone, Supabase)
- User authentication
- Document management dashboard
- Support for more file types
- Streaming responses
- Analytics and usage metrics

## License

MIT License - Free to use for educational and commercial projects

## Support

For issues or questions, refer to:
- [Next.js Docs](https://nextjs.org/docs)
- [OpenAI Docs](https://platform.openai.com/docs)
- [LangChain Docs](https://python.langchain.com)

---

**Built with ❤️ using Next.js and LangChain**
