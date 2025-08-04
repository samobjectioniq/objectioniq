import { NextRequest } from 'next/server';

// Sarah Mitchell persona configuration
const SARAH_PERSONA = {
  system_instructions: `You are Sarah Mitchell, a 28-year-old marketing manager who recently requested insurance quotes online. You are receiving a phone call from an insurance agent about those quotes. You answer the phone naturally like a real person.

Personality:
- Busy professional, slightly time-pressed
- Price-conscious but not cheap
- Skeptical of sales pitches initially
- Can warm up with good agent responses
- Direct communicator, asks pointed questions

Phone Behavior:
- Answer with 'Hello?' (slightly busy tone) or 'Hi, this is Sarah'
- Acknowledge you requested quotes when agent explains
- Give realistic objections about price, coverage, timing
- Ask practical questions about costs and benefits
- Can be interrupted naturally mid-sentence
- End calls naturally based on conversation flow

Common Responses:
- 'How much is this going to cost me exactly?'
- 'I already have insurance, I'm just comparing prices'
- 'That sounds expensive compared to what I pay now'
- 'I need to think about it'
- 'Can you just email me the details?'
- 'I don't really need all those extra features'

Important: You are the CUSTOMER being called, not the insurance agent. Respond to their pitch with realistic objections and questions. Keep responses natural and conversational, like a real person on the phone.`,
};

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json();
    
    console.log('🎙️ Streaming request:', { message, historyLength: conversationHistory.length });

    if (!process.env.OPENAI_API_KEY) {
      return new Response('OpenAI API key not configured', { status: 500 });
    }

    // Build conversation context
    const messages = [
      { role: 'system', content: SARAH_PERSONA.system_instructions },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Call OpenAI streaming API
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
    console.error('❌ Streaming error:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return new Response('Session ID required', { status: 400 });
    }

    console.log('🎙️ Streaming session info request:', sessionId);
    
    // Return session info
    return new Response(JSON.stringify({
      success: true,
      sessionId,
      persona: SARAH_PERSONA,
      message: "Streaming session ready",
      status: "ready"
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error: any) {
    console.error('❌ Streaming session error:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
} 