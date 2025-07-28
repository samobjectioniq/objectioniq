import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_AGENT_ID_SARAH = process.env.ELEVENLABS_AGENT_ID_SARAH;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// Create a new conversation session with the agent
export async function POST(request: NextRequest) {
  try {
    console.log('🤖 ElevenLabs Agent API called');
    
    if (!ELEVENLABS_API_KEY) {
      console.error('❌ ElevenLabs API key not configured');
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    if (!ELEVENLABS_AGENT_ID_SARAH) {
      console.error('❌ ElevenLabs Agent ID not configured');
      return NextResponse.json(
        { error: 'ElevenLabs Agent ID not configured' },
        { status: 500 }
      );
    }

    const { action, sessionId, audioData, message } = await request.json();
    console.log('🤖 Agent request:', { action, sessionId: sessionId?.substring(0, 10) + '...' });

    switch (action) {
      case 'create_session':
        return await createAgentSession();
      case 'send_audio':
        return await sendAudioToAgent(sessionId, audioData);
      case 'send_message':
        return await sendMessageToAgent(sessionId, message);
      case 'end_session':
        return await endAgentSession(sessionId);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ ElevenLabs Agent API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new conversation session with Sarah's agent
async function createAgentSession() {
  try {
    console.log('🤖 Creating agent session...');
    console.log('🤖 Environment check:', {
      hasApiKey: !!ELEVENLABS_API_KEY,
      apiKeyLength: ELEVENLABS_API_KEY?.length || 0,
      apiKeyPreview: ELEVENLABS_API_KEY?.substring(0, 10) + '...' || 'None',
      hasAgentId: !!ELEVENLABS_AGENT_ID_SARAH,
      agentId: ELEVENLABS_AGENT_ID_SARAH
    });
    
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }

    if (!ELEVENLABS_AGENT_ID_SARAH) {
      throw new Error('ElevenLabs Agent ID not configured');
    }
    
    const requestBody = {
      agent_id: ELEVENLABS_AGENT_ID_SARAH,
      name: 'ObjectionIQ Training Session',
      description: 'Insurance objection handling practice session'
    };

    console.log('🤖 Request body:', requestBody);
    console.log('🤖 Making request to:', `${ELEVENLABS_BASE_URL}/conversation`);
    
    const response = await fetch(`${ELEVENLABS_BASE_URL}/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('🤖 Agent session response status:', response.status);
    console.log('🤖 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Agent session creation failed:', response.status, errorText);
      return NextResponse.json(
        { 
          error: 'Failed to create agent session',
          details: errorText,
          status: response.status
        },
        { status: response.status }
      );
    }

    const sessionData = await response.json();
    console.log('🤖 Agent session created successfully:', sessionData);

    return NextResponse.json({
      sessionId: sessionData.id,
      agentId: ELEVENLABS_AGENT_ID_SARAH,
      status: 'active'
    });

  } catch (error) {
    console.error('❌ Agent session creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create agent session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Send audio to the agent
async function sendAudioToAgent(sessionId: string, audioData: string) {
  try {
    console.log('🤖 Sending audio to agent...');
    
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }
    
    // Convert base64 audio to buffer
    const audioBuffer = Buffer.from(audioData, 'base64');
    
    const response = await fetch(`${ELEVENLABS_BASE_URL}/conversation/${sessionId}/audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'audio/wav',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: audioBuffer,
    });

    console.log('🤖 Audio response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Audio send failed:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to send audio to agent' },
        { status: response.status }
      );
    }

    const audioResponse = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioResponse).toString('base64');

    return NextResponse.json({
      audio: audioBase64,
      status: 'success'
    });

  } catch (error) {
    console.error('❌ Audio send error:', error);
    return NextResponse.json(
      { error: 'Failed to send audio to agent' },
      { status: 500 }
    );
  }
}

// Send text message to the agent
async function sendMessageToAgent(sessionId: string, message: string) {
  try {
    console.log('🤖 Sending message to agent:', message.substring(0, 50) + '...');
    
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }
    
    const response = await fetch(`${ELEVENLABS_BASE_URL}/conversation/${sessionId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        message: message
      }),
    });

    console.log('🤖 Message response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Message send failed:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to send message to agent' },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    
    // Get the audio response
    if (responseData.audio_url) {
      const audioResponse = await fetch(responseData.audio_url);
      const audioBuffer = await audioResponse.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');
      
      return NextResponse.json({
        audio: audioBase64,
        text: responseData.text,
        status: 'success'
      });
    }

    return NextResponse.json({
      text: responseData.text,
      status: 'success'
    });

  } catch (error) {
    console.error('❌ Message send error:', error);
    return NextResponse.json(
      { error: 'Failed to send message to agent' },
      { status: 500 }
    );
  }
}

// End the agent session
async function endAgentSession(sessionId: string) {
  try {
    console.log('🤖 Ending agent session...');
    
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }
    
    const response = await fetch(`${ELEVENLABS_BASE_URL}/conversation/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    console.log('🤖 Session end response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Session end failed:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to end agent session' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      status: 'ended'
    });

  } catch (error) {
    console.error('❌ Session end error:', error);
    return NextResponse.json(
      { error: 'Failed to end agent session' },
      { status: 500 }
    );
  }
} 