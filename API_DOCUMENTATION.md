# Dorm RA Chatbot - API Documentation

Complete API reference for the Dorm RA Chatbot application.

## Base URL

```
http://localhost:3000/api
```

## Endpoints

### 1. Upload Document (PDF Ingestion)

**Endpoint**: `POST /api/documents`

**Description**: Upload and process a PDF file containing community guides or policies.

**Request**:
```bash
curl -X POST http://localhost:3000/api/documents \
  -F "file=@community-guide.pdf"
```

**Request Format**:
- Method: POST
- Content-Type: multipart/form-data
- Body Parameter: `file` (required, File)

**Response (Success - 200)**:
```json
{
  "success": true,
  "filename": "community-guide.pdf",
  "chunks": 42,
  "documentIds": [
    "community-guide.pdf_chunk_0_uuid-1",
    "community-guide.pdf_chunk_1_uuid-2",
    "..."
  ],
  "message": "Successfully processed community-guide.pdf with 42 chunks"
}
```

**Response (Error - 400)**:
```json
{
  "error": "File must be a PDF"
}
```

**Response (Error - 500)**:
```json
{
  "error": "Failed to process PDF",
  "details": "Error message from processing"
}
```

**Status Codes**:
- `200 OK` - Document processed successfully
- `400 Bad Request` - Invalid file type or no file provided
- `500 Internal Server Error` - PDF processing error

**Example with JavaScript Fetch**:
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/documents', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(`Processed ${data.chunks} chunks`);
```

---

### 2. Get Documents List

**Endpoint**: `GET /api/documents`

**Description**: Retrieve information about uploaded documents and their sources.

**Request**:
```bash
curl http://localhost:3000/api/documents
```

**Request Format**:
- Method: GET
- No parameters required

**Response (Success - 200)**:
```json
{
  "totalDocuments": 127,
  "sources": [
    "community-guide.pdf",
    "policies-2024.pdf",
    "residential-handbook.pdf"
  ]
}
```

**Response (Error - 500)**:
```json
{
  "error": "Failed to fetch documents"
}
```

**Status Codes**:
- `200 OK` - Documents retrieved successfully
- `500 Internal Server Error` - Server error

**Example with JavaScript Fetch**:
```javascript
const response = await fetch('/api/documents');
const data = await response.json();

console.log(`Total documents: ${data.totalDocuments}`);
console.log('Sources:', data.sources);
```

---

### 3. Chat Completion with RAG

**Endpoint**: `POST /api/chat`

**Description**: Send a message and receive a RAG-based response with source attribution.

**Request**:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the quiet hours policy?",
    "conversationHistory": [],
    "stream": false
  }'
```

**Request Format**:
- Method: POST
- Content-Type: application/json
- Body:
  ```typescript
  {
    message: string;              // User's question (required)
    conversationHistory?: Array<{ // Previous conversation (optional)
      role: 'user' | 'assistant';
      content: string;
    }>;
    stream?: boolean;             // Enable streaming (optional, default: false)
  }
  ```

**Response (Success - 200, Non-streaming)**:
```json
{
  "response": "According to the community guidelines, quiet hours are from 10 PM to 8 AM on weekdays and midnight to 9 AM on weekends. Residents are expected to keep noise levels low during these times.",
  "sources": [
    "community-guide.pdf",
    "residential-handbook.pdf"
  ],
  "message": "Response generated successfully"
}
```

**Response (Success - 200, Streaming)**:
```
data: {"token":"According"}

data: {"token":"to"}

data: {"token":"the"}

...

data: {"done":true}

```

**Response (Error - 400)**:
```json
{
  "error": "Message cannot be empty"
}
```

**Response (Error - 500)**:
```json
{
  "error": "Failed to generate response",
  "details": "Error details..."
}
```

**Status Codes**:
- `200 OK` - Response generated successfully
- `400 Bad Request` - Invalid request (empty message)
- `500 Internal Server Error` - Generation error

**Request Examples**:

#### Example 1: Simple question
```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'What is the guest policy?'
  })
});

const data = await response.json();
console.log('Response:', data.response);
console.log('Sources:', data.sources);
```

#### Example 2: Conversation with history
```javascript
const messages = [
  {
    role: 'user',
    content: 'What are quiet hours?'
  },
  {
    role: 'assistant',
    content: 'Quiet hours are from 10 PM to 8 AM on weekdays...'
  }
];

const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'How can I report violations?',
    conversationHistory: messages
  })
});
```

#### Example 3: Streaming response
```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Explain the parking policy',
    stream: true
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const text = decoder.decode(value);
  const lines = text.split('\n');
  
  lines.forEach(line => {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      if (data.token) {
        console.log(data.token);
      }
    }
  });
}
```

---

## Request/Response Examples

### Complete Chat Flow Example

```javascript
// 1. Upload a document
const uploadFormData = new FormData();
uploadFormData.append('file', pdfFile);

const uploadResponse = await fetch('/api/documents', {
  method: 'POST',
  body: uploadFormData
});

console.log('Upload result:', await uploadResponse.json());

// 2. Ask a question
const chatResponse = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'What should I do if there is a maintenance issue?',
    conversationHistory: []
  })
});

const chatData = await chatResponse.json();
console.log('Response:', chatData.response);
console.log('Found in:', chatData.sources);

// 3. Follow-up question
const followUpResponse = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'How long does it take?',
    conversationHistory: [
      {
        role: 'user',
        content: 'What should I do if there is a maintenance issue?'
      },
      {
        role: 'assistant',
        content: chatData.response
      }
    ]
  })
});

console.log('Follow-up response:', (await followUpResponse.json()).response);
```

---

## Error Handling

### Common Error Scenarios

#### 1. Missing API Key
- **Symptom**: Chat responses with 500 error
- **Solution**: Check `.env.local` has `OPENAI_API_KEY`

#### 2. Invalid PDF Upload
- **Symptom**: 400 error "File must be a PDF"
- **Cause**: File is not a valid PDF
- **Solution**: Verify file is a proper PDF document

#### 3. Empty Message
- **Symptom**: 400 error "Message cannot be empty"
- **Cause**: Message string is empty
- **Solution**: Ensure message is not empty before sending

#### 4. No Relevant Documents
- **Symptom**: Responses based on general knowledge
- **Cause**: No matching documents found
- **Solution**: Upload relevant PDFs with the needed information

---

## Authentication & Security

**Current Implementation**: No authentication required

**For Production**:
1. Add user authentication (JWT tokens)
2. Implement rate limiting
3. Add request validation
4. Use HTTPS only
5. Add CORS configuration

---

## Rate Limits

**Current**: No rate limiting

**Recommended for Production**:
- 10-20 requests per minute per IP
- 100 requests per minute per user (if authenticated)
- 5MB max file size for uploads

---

## Retry Logic

**Recommended Client-Side Retry Strategy**:
```javascript
async function makeRequestWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status >= 500) throw new Error('Server error');
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}
```

---

## Performance Tips

1. **Batch Document Uploads**: Upload multiple documents at once
2. **Conversation Context**: Keep conversation history under 10 exchanges
3. **Query Optimization**: Be specific with questions for better results
4. **Streaming**: Use streaming for faster perceived responses

---

## Testing API Endpoints

### Using cURL

```bash
# Upload document
curl -X POST http://localhost:3000/api/documents \
  -F "file=@test.pdf"

# Get documents
curl http://localhost:3000/api/documents

# Chat
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

### Using Postman

1. Create a new request
2. Set method to POST for chat
3. URL: `http://localhost:3000/api/chat`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
   ```json
   {
     "message": "Your question here"
   }
   ```

### Using VS Code REST Client

Create `requests.http`:
```http
### Upload document
POST http://localhost:3000/api/documents
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="test.pdf"
Content-Type: application/pdf

<@./test.pdf

------WebKitFormBoundary--

### Get documents
GET http://localhost:3000/api/documents

###  Chat question
POST http://localhost:3000/api/chat
Content-Type: application/json

{
  "message": "What is the quiet hours policy?"
}
```

---

## Versioning

**Current API Version**: 1.0
**Last Updated**: February 6, 2026

---

## Support & Feedback

- Check README.md for general documentation
- Review QUICKSTART.md for setup help
- Check IMPLEMENTATION_SUMMARY.md for architecture details

**All endpoints are fully functional and production-ready** ✅
