// ElevenLabs Voice API for high-quality AI voices
const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// Voice IDs for different personas (you can get these from ElevenLabs dashboard)
const VOICE_IDS = {
  sarah: '21m00Tcm4TlvDq8ikWAM', // Rachel - young, professional
  robert: 'AZnzlk1XvdvUeBnXmlld', // Domi - mature, authoritative
  linda: 'EXAVITQu4vr4xnSDxMaL', // Bella - warm, friendly
  default: '21m00Tcm4TlvDq8ikWAM' // Rachel as default
};

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

// Persona-specific voice settings
const VOICE_SETTINGS: Record<string, VoiceSettings> = {
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

export const generateElevenLabsSpeech = async (
  text: string, 
  personaId: string
): Promise<ArrayBuffer | null> => {
  if (!ELEVENLABS_API_KEY) {
    console.warn('ElevenLabs API key not configured, falling back to browser TTS');
    return null;
  }

  try {
    const voiceId = VOICE_IDS[personaId as keyof typeof VOICE_IDS] || VOICE_IDS.default;
    const voiceSettings = VOICE_SETTINGS[personaId] || VOICE_SETTINGS.default;

    console.log('🎙️ Generating ElevenLabs speech for:', personaId);
    console.log('🎙️ Voice ID:', voiceId);
    console.log('🎙️ Text:', text);

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
      console.error('🎙️ ElevenLabs API error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    console.log('🎙️ ElevenLabs speech generated successfully');
    return audioBuffer;

  } catch (error) {
    console.error('🎙️ Error generating ElevenLabs speech:', error);
    return null;
  }
};

// Fallback to browser TTS if ElevenLabs fails
export const fallbackToBrowserTTS = (
  text: string, 
  personaId: string,
  synthesis: SpeechSynthesis
): void => {
  console.log('🔊 Using browser TTS fallback');
  
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Basic voice selection for browser TTS
  const voices = synthesis.getVoices();
  const englishVoices = voices.filter(voice => voice.lang.includes('en'));
  
  // Select appropriate voice based on persona
  let selectedVoice = englishVoices[0];
  
  switch (personaId) {
    case 'sarah':
      selectedVoice = englishVoices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('samantha')
      ) || selectedVoice;
      break;
    case 'robert':
      selectedVoice = englishVoices.find(voice => 
        voice.name.toLowerCase().includes('male') || 
        voice.name.toLowerCase().includes('alex')
      ) || selectedVoice;
      break;
    case 'linda':
      selectedVoice = englishVoices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('bella')
      ) || selectedVoice;
      break;
  }
  
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }
  
  // Apply basic settings
  utterance.rate = 0.9;
  utterance.pitch = 1.1;
  utterance.volume = 0.9;
  
  synthesis.speak(utterance);
};

// Play audio buffer
export const playAudioBuffer = (audioBuffer: ArrayBuffer): Promise<void> => {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    audioContext.decodeAudioData(audioBuffer)
      .then(buffer => {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
        
        source.onended = () => {
          audioContext.close();
          resolve();
        };
      })
      .catch(error => {
        console.error('🎙️ Error playing audio buffer:', error);
        audioContext.close();
        reject(error);
      });
  });
}; 