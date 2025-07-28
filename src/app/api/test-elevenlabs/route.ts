import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing ElevenLabs API key...');
    console.log('🧪 Environment check:', {
      hasApiKey: !!ELEVENLABS_API_KEY,
      apiKeyLength: ELEVENLABS_API_KEY?.length || 0,
      apiKeyPreview: ELEVENLABS_API_KEY?.substring(0, 10) + '...' || 'None'
    });

    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json({
        error: 'ElevenLabs API key not configured',
        envVars: Object.keys(process.env).filter(key => key.includes('ELEVEN'))
      });
    }

    // Test with a simple API call to get user info
    const response = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    if (response.ok) {
      const userData = await response.json();
      return NextResponse.json({
        success: true,
        userData: {
          subscription: userData.subscription,
          characterCount: userData.subscription?.character_count || 'Unknown'
        }
      });
    } else {
      const errorText = await response.text();
      return NextResponse.json({
        error: 'ElevenLabs API test failed',
        status: response.status,
        errorText
      });
    }

  } catch (error) {
    console.error('❌ ElevenLabs test error:', error);
    return NextResponse.json({
      error: 'ElevenLabs API test error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 