import { NextRequest, NextResponse } from 'next/server';
import { generateRAGResponse, generateStreamingRAGResponse } from '@/lib/rag-service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  stream?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequest;
    const { message, conversationHistory = [], stream = false } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    if (stream) {
      // Implement streaming response
      const responseStream = await generateStreamingRAGResponse(
        message,
        conversationHistory
      );

      const encoder = new TextEncoder();

      const customReadable = new ReadableStream({
        async start(controller) {
          try {
            for await (const token of responseStream) {
              const chunk = typeof token === 'string' ? token : (token as any)?.content || '';
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: chunk })}\n\n`));
            }
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
            );
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new NextResponse(customReadable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } else {
      // Non-streaming response
      const { response, sources } = await generateRAGResponse(
        message,
        conversationHistory
      );

      return NextResponse.json({
        response,
        sources,
        message: 'Response generated successfully',
      });
    }
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
