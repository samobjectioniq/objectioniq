import { NextRequest, NextResponse } from 'next/server';
import { textToSpeech } from '@/lib/audio';

export async function POST(request: NextRequest) {
  try {
    console.log('🔊 Text-to-speech request received');
    
    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    const { text, voiceId } = await request.json();
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    // Convert text to speech
    const audioBuffer = await textToSpeech(text, voiceId);
    
    // Return audio as blob
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error: any) {
    console.error('❌ Text-to-speech error:', error);
    return NextResponse.json(
      { error: 'Failed to convert text to speech', details: error.message },
      { status: 500 }
    );
  }
} 