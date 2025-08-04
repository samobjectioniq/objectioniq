import { NextRequest, NextResponse } from 'next/server';
import { speechToText } from '@/lib/audio';

export async function POST(request: NextRequest) {
  try {
    console.log('🎤 Speech-to-text request received');
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Get audio blob from request
    const audioBlob = await request.blob();
    
    if (!audioBlob || audioBlob.size === 0) {
      return NextResponse.json(
        { error: 'No audio data provided' },
        { status: 400 }
      );
    }

    // Convert speech to text
    const transcript = await speechToText(audioBlob);
    
    return NextResponse.json({
      success: true,
      transcript,
    });

  } catch (error: any) {
    console.error('❌ Speech-to-text error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe speech', details: error.message },
      { status: 500 }
    );
  }
} 