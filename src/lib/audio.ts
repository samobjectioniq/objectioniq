import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// Voice IDs for different personas
export const VOICE_IDS = {
  SARAH: '21m00Tcm4TlvDq8ikWAM', // Professional female voice
  ROBERT: 'AZnzlk1XvdvUeBnXmlld', // Professional male voice
  LINDA: 'EXAVITQu4vr4xnSDxMaL', // Warm female voice
};

export interface AudioChunk {
  audio: ArrayBuffer;
  text: string;
  isComplete: boolean;
}

/**
 * Convert speech to text using OpenAI Whisper
 */
export async function speechToText(audioBlob: Blob): Promise<string> {
  try {
    console.log('🎤 Converting speech to text...');
    
    // Create form data for Whisper API
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'text');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Whisper API error: ${response.statusText}`);
    }

    const transcript = await response.text();
    console.log('✅ Speech transcribed:', transcript);
    return transcript.trim();

  } catch (error: any) {
    console.error('❌ Speech-to-text error:', error);
    throw new Error(`Failed to transcribe speech: ${error.message}`);
  }
}

/**
 * Convert text to speech using ElevenLabs
 */
export async function textToSpeech(text: string, voiceId: string = VOICE_IDS.SARAH): Promise<ArrayBuffer> {
  try {
    console.log('🔊 Converting text to speech:', text);
    
    const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    console.log('✅ Text converted to speech');
    return audioBuffer;

  } catch (error: any) {
    console.error('❌ Text-to-speech error:', error);
    throw new Error(`Failed to convert text to speech: ${error.message}`);
  }
}

/**
 * Stream text to speech using ElevenLabs streaming API
 */
export async function streamTextToSpeech(
  text: string, 
  voiceId: string = VOICE_IDS.SARAH,
  onChunk: (chunk: AudioChunk) => void
): Promise<void> {
  try {
    console.log('🔊 Streaming text to speech:', text);
    
    const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true,
        },
        output_format: 'mp3_44100_128',
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs streaming API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body for streaming');
    }

    let audioChunks: Uint8Array[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      audioChunks.push(value);
      
      // Send chunk as it arrives
      onChunk({
        audio: value.buffer instanceof ArrayBuffer
          ? value.buffer.slice(0)
          : new ArrayBuffer(0), // handle SharedArrayBuffer
        text: text,
        isComplete: false,
      });
    }

    // Send final complete chunk
    const completeAudio = new Uint8Array(audioChunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of audioChunks) {
      completeAudio.set(chunk, offset);
      offset += chunk.length;
    }

    onChunk({
      audio: completeAudio.buffer instanceof ArrayBuffer
        ? completeAudio.buffer.slice(0)
        : new ArrayBuffer(0), // handle SharedArrayBuffer
      text: text,
      isComplete: true,
    });

    console.log('✅ Streaming text-to-speech complete');

  } catch (error: any) {
    console.error('❌ Streaming text-to-speech error:', error);
    throw new Error(`Failed to stream text to speech: ${error.message}`);
  }
}

/**
 * Play audio buffer in browser
 */
export function playAudioBuffer(audioBuffer: ArrayBuffer): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      
      const audio = new Audio(url);
      
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      
      audio.onerror = (error) => {
        URL.revokeObjectURL(url);
        reject(error);
      };
      
      audio.play().catch(reject);
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Split text into sentences for natural speech breaks
 */
export function splitIntoSentences(text: string): string[] {
  // Split by sentence endings, but preserve abbreviations
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  return sentences.map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Buffer streaming text and return complete sentences
 */
export function bufferStreamingText(
  streamedText: string,
  onSentenceComplete: (sentence: string) => void
): string[] {
  const sentences = splitIntoSentences(streamedText);
  return sentences;
} 