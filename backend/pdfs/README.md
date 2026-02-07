# Backend PDFs Folder

Place your PDF files here. They will be automatically loaded by the chatbot on server startup.

## How It Works

1. **Drop PDFs here**: Add any PDF files (community guides, policies, rules, etc.) to this folder
2. **Server starts**: When you run `npm run dev`, the server automatically:
   - Scans this folder for all PDF files
   - Extracts text from each PDF
   - Creates embeddings for semantic search
   - Loads everything into memory
3. **Users chat**: Users can ask questions and the bot will reference information from your PDFs

## Example Files

- `community-guide.pdf` - Dorm community policies
- `resident-handbook.pdf` - Rules and regulations
- `emergency-procedures.pdf` - Safety and emergency info
- `amenities-guide.pdf` - Building facilities and services

## Notes

- Files are loaded on server startup
- Changes require server restart (next `npm run dev`)
- Supports multiple PDFs
- PDFs stay in memory during session
