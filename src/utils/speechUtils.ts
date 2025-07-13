// Speech recognition browser compatibility
export const getSpeechRecognition = () => {
  if (typeof window === 'undefined') return null;
  
  // Try different speech recognition implementations
  const SpeechRecognition = 
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    (window as any).mozSpeechRecognition ||
    (window as any).msSpeechRecognition;
    
  return SpeechRecognition;
};

// Speech synthesis browser compatibility
export const getSpeechSynthesis = () => {
  if (typeof window === 'undefined') return null;
  return window.speechSynthesis;
};

// Check browser compatibility
export const checkBrowserCompatibility = () => {
  const speechRecognition = getSpeechRecognition();
  const speechSynthesis = getSpeechSynthesis();
  
  return {
    speechRecognition: !!speechRecognition,
    speechSynthesis: !!speechSynthesis,
    isSupported: !!(speechRecognition && speechSynthesis)
  };
};

// Get available voices
export const getAvailableVoices = () => {
  const synthesis = getSpeechSynthesis();
  if (!synthesis) return [];
  
  return synthesis.getVoices();
};

// Select best voice for persona
export const selectVoiceForPersona = (personaId: string, voices: SpeechSynthesisVoice[]) => {
  const englishVoices = voices.filter(voice => voice.lang.includes('en'));
  
  // Default voice selection
  let selectedVoice = englishVoices.find(voice => 
    voice.name.includes('Google') || voice.name.includes('Natural') || voice.name.includes('Premium')
  ) || englishVoices[0] || voices[0];

  // Persona-specific voice selection
  switch (personaId) {
    case 'sarah':
      selectedVoice = englishVoices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('samantha')
      ) || selectedVoice;
      break;
    case 'mike-jennifer':
      selectedVoice = englishVoices.find(voice => 
        voice.name.toLowerCase().includes('male') || 
        voice.name.toLowerCase().includes('alex')
      ) || selectedVoice;
      break;
    case 'robert':
      selectedVoice = englishVoices.find(voice => 
        voice.name.toLowerCase().includes('male') || 
        voice.name.toLowerCase().includes('daniel')
      ) || selectedVoice;
      break;
  }
  
  return selectedVoice;
};

// Enhance text for better speech synthesis
export const enhanceTextForSpeech = (text: string): string => {
  return text
    .replace(/\./g, '... ') // Add pauses after sentences
    .replace(/,/g, ', ') // Add slight pauses after commas
    .replace(/\?/g, '? ') // Add pauses after questions
    .replace(/!/g, '! ') // Add pauses after exclamations
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

// Get persona-specific speech settings
export const getPersonaSpeechSettings = (personaId: string) => {
  switch (personaId) {
    case 'sarah':
      return { rate: 0.9, pitch: 1.2, volume: 0.9 }; // Younger, energetic
    case 'mike-jennifer':
      return { rate: 0.85, pitch: 1.0, volume: 0.9 }; // Mature, thoughtful
    case 'robert':
      return { rate: 0.8, pitch: 0.9, volume: 0.9 }; // Older, deliberate
    default:
      return { rate: 0.85, pitch: 1.1, volume: 0.9 };
  }
};

// Error messages for different browser issues
export const getErrorMessage = (error: string): string => {
  switch (error) {
    case 'not-allowed':
      return 'Microphone permission denied. Please allow microphone access and try again.';
    case 'no-speech':
      return 'No speech detected. Please speak clearly and try again.';
    case 'audio-capture':
      return 'Audio capture failed. Please check your microphone and try again.';
    case 'network':
      return 'Network error. Please check your internet connection and try again.';
    case 'service-not-allowed':
      return 'Speech recognition service not allowed. Please check your browser settings.';
    default:
      return `Speech recognition error: ${error}. Please try again or use text input.`;
  }
}; 