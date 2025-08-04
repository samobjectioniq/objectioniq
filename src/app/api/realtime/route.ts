import { NextRequest, NextResponse } from 'next/server';

// Sarah Mitchell persona configuration for GPT-4o
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
  
  voice_settings: {
    voice: "alloy", // Professional, clear female voice
    response_format: "text",
    speed: 1.0,
    temperature: 0.7,
  }
};

export async function POST(request: NextRequest) {
  try {
    const { action, sessionId, audioData, message, conversationHistory = [] } = await request.json();
    
    console.log('🎙️ Realtime API Request:', { action, sessionId, hasAudioData: !!audioData, hasMessage: !!message });

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    switch (action) {
      case 'get_websocket_url':
        return await getWebSocketURL(sessionId);
      
      case 'start_session':
        return await startRealtimeSession(sessionId);
      
      case 'send_audio':
        return await processAudioInput(sessionId, audioData);
      
      case 'send_message':
        return await processTextInput(sessionId, message, conversationHistory);
      
      case 'end_session':
        return await endRealtimeSession(sessionId);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('❌ Realtime API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Get WebSocket URL for client connection (now returns streaming endpoint)
async function getWebSocketURL(sessionId: string) {
  try {
    console.log('🎙️ Generating streaming endpoint for session:', sessionId);
    
    // Return our streaming endpoint instead of WebSocket
    const streamingUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/realtime/stream?sessionId=${sessionId}`;
    
    return NextResponse.json({
      success: true,
      sessionId,
      streamingUrl,
      persona: SARAH_PERSONA,
      message: "Streaming endpoint ready"
    });
  } catch (error: any) {
    console.error('❌ Streaming URL error:', error);
    return NextResponse.json(
      { error: 'Failed to generate streaming URL', details: error.message },
      { status: 500 }
    );
  }
}

// Start a new realtime conversation session
async function startRealtimeSession(sessionId: string) {
  try {
    console.log('🎙️ Starting realtime session:', sessionId);
    
    return NextResponse.json({
      success: true,
      sessionId,
      persona: SARAH_PERSONA,
      message: "Session ready for streaming conversation"
    });

  } catch (error: any) {
    console.error('❌ Start session error:', error);
    return NextResponse.json(
      { error: 'Failed to start session', details: error.message },
      { status: 500 }
    );
  }
}

// Process incoming audio from the agent (fallback for non-WebSocket)
async function processAudioInput(sessionId: string, audioData: string) {
  try {
    console.log('🎙️ Processing audio input for session:', sessionId);
    
    // For now, return a placeholder - audio processing would require speech-to-text
    return NextResponse.json({
      success: true,
      sessionId,
      message: "Audio processing requires speech-to-text conversion",
      requiresTextInput: true
    });

  } catch (error: any) {
    console.error('❌ Process audio error:', error);
    return NextResponse.json(
      { error: 'Failed to process audio', details: error.message },
      { status: 500 }
    );
  }
}

// Process text input using OpenAI streaming API
async function processTextInput(sessionId: string, message: string, conversationHistory: any[] = []) {
  try {
    console.log('🎙️ Processing text input for session:', sessionId, 'Message:', message);
    
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
    console.error('❌ Process text error:', error);
    return NextResponse.json(
      { error: 'Failed to process text', details: error.message },
      { status: 500 }
    );
  }
}

// End the realtime session
async function endRealtimeSession(sessionId: string) {
  try {
    console.log('🎙️ Ending realtime session:', sessionId);
    
    return NextResponse.json({
      success: true,
      sessionId,
      message: "Session ended successfully"
    });

  } catch (error: any) {
    console.error('❌ End session error:', error);
    return NextResponse.json(
      { error: 'Failed to end session', details: error.message },
      { status: 500 }
    );
  }
}

// Handle WebSocket upgrade for real-time communication
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    console.log('🎙️ Session info request for session:', sessionId);
    
    // Return session info
    return NextResponse.json({
      success: true,
      sessionId,
      streamingUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/realtime/stream?sessionId=${sessionId}`,
      persona: SARAH_PERSONA,
      message: "Session ready for streaming",
      status: "ready"
    });

  } catch (error: any) {
    console.error('❌ Session info error:', error);
    return NextResponse.json(
      { error: 'Session info error', details: error.message },
      { status: 500 }
    );
  }
} 