# Quick Start Guide for Dorm RA Chatbot

## Getting Started (5 minutes)

### Step 1: Verify Installation
```bash
npm install
```

### Step 2: Set Up OpenAI API
1. Get your API key from [platform.openai.com](https://platform.openai.com/api-keys)
2. Create `.env.local` file in project root:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Open in Browser
Navigate to `http://localhost:3000`

## Using the Chatbot

### Upload Documents
1. Look at the sidebar labeled "Upload Community Guides"
2. Drag & drop a PDF or click to browse
3. Select your community guide PDF
4. Wait for processing confirmation

### Ask Questions
1. Type your question in the chat box
2. Click Send or press Enter
3. Wait for the response
4. View sources by clicking "Show sources"

### Example Questions
- "What time is quiet hours?"
- "What is the guest policy?"
- "How do I report a maintenance issue?"
- "What are the parking regulations?"

## Testing with Sample PDF

### Create a Test PDF
1. Create a text file with dorm policies
2. Save as PDF (use your preferred tool)
3. Upload in the UI

### Sample Content
```
COMMUNITY LIVING GUIDELINES

Quiet Hours
- Weekday: 10 PM - 8 AM
- Weekend: Midnight - 9 AM
- Violation: Warning, then fine

Guest Policy
- Register guests 24 hours in advance
- Maximum 2 guests per room
- Guests must leave by 2 AM

Maintenance Requests
- Submit via resident portal
- Emergency maintenance: Call 555-0100
- Response time: 24-48 hours
```

## Troubleshooting

### "OPENAI_API_KEY is not set"
- Check that `.env.local` exists
- Verify the key is correct
- Restart dev server

### PDF Upload Fails
- Ensure it's a valid PDF file
- Check file size (< 25MB recommended)
- Check browser console for errors

### Build Errors
```bash
npm install --legacy-peer-deps
npm run build
```

## Project Capabilities

✅ Upload multiple PDFs
✅ Semantic search across documents
✅ Context-aware responses
✅ Source attribution
✅ Conversation history
✅ Modern responsive UI

## Next Steps

1. Upload your actual community guides
2. Test with various questions
3. Customize system prompt if needed
4. Deploy to Vercel or your hosting

## Deployment to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set `OPENAI_API_KEY` in Vercel environment variables.

## Support

- Check README.md for detailed docs
- See .github/copilot-instructions.md for technical details
- Review src/lib/ for customization options

---

Enjoy your Dorm RA Bot! 🤖
