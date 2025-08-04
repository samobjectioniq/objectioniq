export interface Persona {
  id: string;
  name: string;
  age: number;
  type: string;
  description: string;
  characteristics: string[];
  color: 'blue' | 'green' | 'purple' | 'red' | 'orange';
  avatar: string;
  voiceId?: string; // allow undefined
  systemPrompt: string;
  objections?: string[];
}

export interface SessionStats {
  duration: number;
  objectionsHandled: number;
  responsesCount: number;
  confidenceScore: number;
}

export interface ConversationMessage {
  id: string;
  speaker: 'agent' | 'customer';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
} 