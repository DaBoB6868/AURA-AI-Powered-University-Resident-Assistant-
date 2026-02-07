import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { vectorStore } from './vector-store';

const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'openai/gpt-3.5-turbo',
  temperature: 0.7,
  configuration: {
    baseURL: 'https://openrouter.ai/api/v1',
  },
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function generateRAGResponse(
  userQuery: string,
  conversationHistory: Message[] = []
): Promise<{ response: string; sources: string[] }> {
  try {
    // Search for relevant documents with confidence scores
    const searchResults = await vectorStore.searchWithScores(userQuery, 5);
    const relevantDocs = searchResults.map((r) => r.doc);
    const avgConfidence =
      searchResults.length > 0
        ? searchResults.reduce((sum, r) => sum + r.score, 0) / searchResults.length
        : 0;

    // Build context from retrieved documents
    const context = relevantDocs
      .map(
        (doc) =>
          `Source: ${doc.metadata.source}${doc.metadata.pageNumber ? ` (Page ${doc.metadata.pageNumber})` : ''}\n${doc.content}`
      )
      .join('\n\n---\n\n');

    // Adjust prompt based on confidence in PDF matches
    const confidenceNote =
      avgConfidence < 0.3
        ? 'If the community guides do not contain enough information, supplement with general knowledge of common dorm policies and best practices.'
        : 'Focus primarily on the provided community guides for accurate information.';

    // Build the system prompt
    const systemPrompt = `You are a friendly and knowledgeable UGA (University of Georgia) Dorm RA (Resident Assistant) chatbot. You help UGA students with questions about UGA dorm policies, UGA Housing community guidelines, campus resources at the University of Georgia in Athens, GA, and residential life at UGA.

${confidenceNote}

Always frame answers in the context of UGA. Reference UGA-specific services, buildings, and policies when possible. If a student asks something general, relate it back to UGA resources.

Be friendly, supportive, and professional. Keep responses concise and helpful. Go Dawgs!`;

    // Convert conversation history to LangChain messages
    const messages = conversationHistory.map((msg) =>
      msg.role === 'user'
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content)
    );

    // Add current query
    messages.push(
      new HumanMessage(
        `Please answer this question: "${userQuery}"\n\nCommunity Information from guides:\n${context || 'No specific information found in the community guides.'}`
      )
    );

    // Generate response using LangChain
    const result = await chatModel.invoke(messages);

    const response = result.content.toString();
    const sources = relevantDocs.map((doc) => doc.metadata.source);

    return {
      response,
      sources: [...new Set(sources)], // Remove duplicates
    };
  } catch (error) {
    console.error('Error generating RAG response:', error);
    throw error;
  }
}

export async function generateStreamingRAGResponse(
  userQuery: string,
  conversationHistory: Message[] = []
) {
  const searchResults = await vectorStore.searchWithScores(userQuery, 5);
  const relevantDocs = searchResults.map((r) => r.doc);
  const avgConfidence =
    searchResults.length > 0
      ? searchResults.reduce((sum, r) => sum + r.score, 0) / searchResults.length
      : 0;

  const context = relevantDocs
    .map(
      (doc) =>
        `Source: ${doc.metadata.source}${doc.metadata.pageNumber ? ` (Page ${doc.metadata.pageNumber})` : ''}\n${doc.content}`
    )
    .join('\n\n---\n\n');

  const confidenceNote =
    avgConfidence < 0.3
      ? 'If the community guides do not contain enough information, supplement with general knowledge of common dorm policies and best practices.'
      : 'Focus primarily on the provided community guides for accurate information.';

  const systemPrompt = `You are a friendly and knowledgeable UGA (University of Georgia) Dorm RA (Resident Assistant) chatbot. You help UGA students with questions about UGA dorm policies, UGA Housing community guidelines, campus resources at the University of Georgia in Athens, GA, and residential life at UGA.

${confidenceNote}

Always frame answers in the context of UGA. Reference UGA-specific services, buildings, and policies when possible. If a student asks something general, relate it back to UGA resources.

Be friendly, supportive, and professional. Keep responses concise and helpful. Go Dawgs!`;

  // Convert conversation history to LangChain messages
  const messages = conversationHistory.map((msg) =>
    msg.role === 'user'
      ? new HumanMessage(msg.content)
      : new AIMessage(msg.content)
  );

  // Add current query
  messages.push(
    new HumanMessage(
      `Please answer this question: "${userQuery}"\n\nCommunity Information from guides:\n${context || 'No specific information found in the community guides.'}`
    )
  );

  return chatModel.stream(messages);
}
