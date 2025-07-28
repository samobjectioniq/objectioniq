import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// Voice IDs for different personas
const VOICE_IDS = {
  sarah: '21m00Tcm4TlvDq8ikWAM', // Rachel - young, professional
  robert: 'AZnzlk1XvdvUeBnXmlld', // Domi - mature, authoritative
  linda: 'EXAVITQu4vr4xnSDxMaL', // Bella - warm, friendly
  default: '21m00Tcm4TlvDq8ikWAM' // Rachel as default
};

// Persona-specific voice settings
const VOICE_SETTINGS = {
  sarah: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true
  },
  robert: {
    stability: 0.7,
    similarity_boost: 0.8,
    style: 0.0,
    use_speaker_boost: true
  },
  linda: {
    stability: 0.6,
    similarity_boost: 0.7,
    style: 0.0,
    use_speaker_boost: true
  },
  default: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true
  }
};

export async function POST(request: NextRequest) {
  try {
    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    const { text, personaId } = await request.json();

    if (!text || !personaId) {
      return NextResponse.json(
        { error: 'Text and personaId are required' },
        { status: 400 }
      );
    }

    const voiceId = VOICE_IDS[personaId as keyof typeof VOICE_IDS] || VOICE_IDS.default;
    const voiceSettings = VOICE_SETTINGS[personaId as keyof typeof VOICE_SETTINGS] || VOICE_SETTINGS.default;

    // Call ElevenLabs API
    const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: voiceSettings
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to generate speech' },
        { status: response.status }
      );
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer();

    // Return the audio as a response
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('ElevenLabs API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 