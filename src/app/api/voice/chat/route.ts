import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧠 Chat request received');
    
    if (!process.env.OPENAI_API_KEY) {
      return new Response('OpenAI API key not configured', { status: 500 });
    }

    const { message, conversationHistory = [], persona } = await request.json();
    
    if (!message || message.trim().length === 0) {
      return new Response('No message provided', { status: 400 });
    }

    // Build conversation context
    const messages = [
      { role: 'system', content: persona.systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Call OpenAI API with streaming
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    // Return the streaming response
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('❌ Chat error:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
} 