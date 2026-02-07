import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { vectorStore } from './vector-store';

const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo',
  temperature: 0.7,
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
    // Search for relevant documents
    const relevantDocs = await vectorStore.search(userQuery, 5);

    // Build context from retrieved documents
    const context = relevantDocs
      .map(
        (doc) =>
          `Source: ${doc.metadata.source}${doc.metadata.pageNumber ? ` (Page ${doc.metadata.pageNumber})` : ''}\n${doc.content}`
      )
      .join('\n\n---\n\n');

    // Build the system prompt
    const systemPrompt = `You are a helpful Dorm RA (Resident Assistant) chatbot. You help students with questions about dorm policies, community guidelines, and residential life. 

Use the provided community guides and policies to answer questions accurately. If you don't have information in the provided guides, say so and offer general helpful advice.

Be friendly, supportive, and professional. Keep responses concise and helpful.`;

    // Convert conversation history to LangChain messages
    const messages = conversationHistory.map((msg) =>
      msg.role === 'user'
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content)
    );

    // Add current query
    messages.push(
      new HumanMessage(
        `Based on the following community guides and policies, please answer this question: "${userQuery}"\n\nCommunity Information:\n${context || 'No relevant information found in documents.'}`
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
  const relevantDocs = await vectorStore.search(userQuery, 5);

  const context = relevantDocs
    .map(
      (doc) =>
        `Source: ${doc.metadata.source}${doc.metadata.pageNumber ? ` (Page ${doc.metadata.pageNumber})` : ''}\n${doc.content}`
    )
    .join('\n\n---\n\n');

  const systemPrompt = `You are a helpful Dorm RA (Resident Assistant) chatbot. You help students with questions about dorm policies, community guidelines, and residential life.

Use the provided community guides and policies to answer questions accurately. If you don't have information in the provided guides, say so and offer general helpful advice.

Be friendly, supportive, and professional. Keep responses concise and helpful.`;

  // Convert conversation history to LangChain messages
  const messages = conversationHistory.map((msg) =>
    msg.role === 'user'
      ? new HumanMessage(msg.content)
      : new AIMessage(msg.content)
  );

  // Add current query
  messages.push(
    new HumanMessage(
      `Based on the following community guides and policies, please answer this question: "${userQuery}"\n\nCommunity Information:\n${context || 'No relevant information found in documents.'}`
    )
  );

  return chatModel.stream(messages);
}
