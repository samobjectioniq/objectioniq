import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_AGENT_ID_SARAH = process.env.ELEVENLABS_AGENT_ID_SARAH;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing ElevenLabs Agent connection...');
    
    // Check environment variables
    const envCheck = {
      hasApiKey: !!ELEVENLABS_API_KEY,
      apiKeyLength: ELEVENLABS_API_KEY?.length || 0,
      apiKeyPreview: ELEVENLABS_API_KEY?.substring(0, 10) + '...' || 'None',
      hasAgentId: !!ELEVENLABS_AGENT_ID_SARAH,
      agentId: ELEVENLABS_AGENT_ID_SARAH
    };

    console.log('🧪 Environment check:', envCheck);

    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json({
        error: 'ElevenLabs API key not configured',
        envCheck
      });
    }

    if (!ELEVENLABS_AGENT_ID_SARAH) {
      return NextResponse.json({
        error: 'ElevenLabs Agent ID not configured',
        envCheck
      });
    }

    // Test API key with user info
    console.log('🧪 Testing API key...');
    const userResponse = await fetch(`${ELEVENLABS_BASE_URL}/user`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      return NextResponse.json({
        error: 'ElevenLabs API key test failed',
        status: userResponse.status,
        details: errorText,
        envCheck
      });
    }

    const userData = await userResponse.json();
    console.log('🧪 API key test successful:', userData);

    // Test agent availability
    console.log('🧪 Testing agent availability...');
    const agentResponse = await fetch(`${ELEVENLABS_BASE_URL}/agents/${ELEVENLABS_AGENT_ID_SARAH}`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    if (!agentResponse.ok) {
      const errorText = await agentResponse.text();
      return NextResponse.json({
        error: 'Agent not found or not accessible',
        status: agentResponse.status,
        details: errorText,
        envCheck,
        userData
      });
    }

    const agentData = await agentResponse.json();
    console.log('🧪 Agent test successful:', agentData);

    return NextResponse.json({
      success: true,
      message: 'ElevenLabs Agent connection test successful',
      envCheck,
      userData: {
        subscription: userData.subscription,
        characterCount: userData.subscription?.character_count || 'Unknown'
      },
      agentData: {
        id: agentData.id,
        name: agentData.name,
        description: agentData.description
      }
    });

  } catch (error) {
    console.error('❌ Agent test error:', error);
    return NextResponse.json({
      error: 'Agent connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 