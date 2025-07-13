import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ChatRequest {
  persona: {
    id: string;
    name: string;
    age: number;
    type: string;
    characteristics: string[];
    description: string;
  };
  agentResponse: string;
  conversationHistory: Array<{
    speaker: string;
    content: string;
  }>;
}

const personaPrompts: Record<string, string> = {
  sarah: `You are Sarah, a 28-year-old young professional. You are price-sensitive, have a busy lifestyle, and want to make quick decisions. You are skeptical of sales pitches and want to know if insurance is really worth it. Your objections often include: "It's too expensive", "I don't have time for this", "Do I really need this?", "Can you make this quick?"`,
  'mike-jennifer': `You are Mike & Jennifer, a 35-year-old couple focused on family safety. You are safety-concerned, comparison shoppers, and detail-oriented. You want comprehensive coverage for your family and ask a lot of questions about policy details. Your objections often include: "How does this compare to other plans?", "Is this the safest option for my family?", "What exactly is covered?", "Can you show me the details?"`,
  robert: `You are Robert, a 67-year-old retiree. You are loyal to your current provider, suspicious of change, and ask many questions. You value long-term relationships and are wary of new offers. Your objections often include: "I've been with my provider for years", "Why should I switch?", "Is this really better?", "What aren't you telling me?"`,
};

export async function POST(request: NextRequest) {
  let persona: ChatRequest['persona'] | undefined;
  
  try {
    // Validate request body
    const body: ChatRequest = await request.json();
    
    if (!body.persona || !body.agentResponse) {
      return NextResponse.json(
        { error: 'Missing required fields: persona and agentResponse' },
        { status: 400 }
      );
    }
    
    persona = body.persona;
    const { agentResponse, conversationHistory = [] } = body;

    // Validate persona
    if (!personaPrompts[persona.id]) {
      return NextResponse.json(
        { error: `Invalid persona: ${persona.id}` },
        { status: 400 }
      );
    }

    // Persona-specific system prompt
    const systemPrompt = `${personaPrompts[persona.id]}

Respond in a natural, conversational way. Use contractions and sound like a real person. Keep responses short (1-2 sentences). Stay in character and make objections realistic for your persona.`;

    const userPrompt = `Conversation history:
${conversationHistory.map((msg: any) => `${msg.speaker === 'agent' ? 'Agent' : persona!.name}: ${msg.content}`).join('\n')}

Agent's latest message: "${agentResponse}"

Respond as ${persona!.name}:`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 150,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const response = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Error in chat API:', error);
    
    // Handle specific error types
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Authentication failed. Please check your API key.' },
        { status: 401 }
      );
    }
    
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    if (error.status === 404) {
      return NextResponse.json(
        { error: 'Model not found. Please check your configuration.' },
        { status: 404 }
      );
    }
    
    // Fallback response if AI is unavailable
    const fallbackResponses = {
      sarah: "I'm not sure about this... can you tell me more about the cost?",
      'mike-jennifer': "We need to think about this carefully. What about coverage for our children?",
      robert: "I've been with my current company for years. What makes you different?"
    };
    
    const fallback = (persona && persona.id && fallbackResponses[persona.id as keyof typeof fallbackResponses])
      ? fallbackResponses[persona.id as keyof typeof fallbackResponses]
      : "I need to think about this. Can you send me some information?";
      
    return NextResponse.json({ response: fallback });
  }
} 