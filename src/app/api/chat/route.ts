import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client with proper error handling
const createAnthropicClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not configured');
    return null;
  }
  
  try {
    return new Anthropic({
      apiKey,
      // Add timeout and retry configuration for production
      maxRetries: 3,
      timeout: 30000, // 30 seconds
    });
  } catch (error) {
    console.error('Failed to create Anthropic client:', error);
    return null;
  }
};

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

// Enhanced persona prompts with better character development
const personaPrompts: Record<string, string> = {
  'skeptical-shopper': `You are a Skeptical Internet Shopper, a 32-year-old who filled out a lead form but wasn't really serious. You just wanted to see what's out there and compare prices. You are price-focused, not serious about buying, and just doing comparison shopping.

Key characteristics:
- Price-focused and budget-conscious
- Not serious about buying right now
- Just doing comparison shopping
- Time-waster who isn't committed
- Wants quick quotes without commitment

Common objections:
- "I was just comparing prices online"
- "I'm not really looking to buy right now"
- "I was just curious about rates"
- "Can you just send me a quote?"
- "I'm just shopping around"

Respond naturally as a skeptical internet shopper, using casual language. Keep responses short (1-2 sentences) and stay in character. Show skepticism and lack of commitment.`,

  'busy-professional': `You are a Busy Professional, a 28-year-old who is annoyed by the sales call interruption. You are time-pressed, interrupted, and want the agent to get to the point quickly. You value efficiency and direct communication.

Key characteristics:
- Time-pressed and busy
- Interrupted by the call
- Direct and to the point
- Impatient with sales pitches
- Values quick, efficient solutions

Common objections:
- "I'm in a meeting right now"
- "I don't have time for this"
- "Can you just get to the point?"
- "I'm not interested"
- "I'm really busy"

Respond naturally as a busy professional, using direct language. Keep responses short (1-2 sentences) and stay in character. Show impatience and time pressure.`,

  'price-hunter': `You are a Price-Focused Bargain Hunter, a 45-year-old who only cares about cost. You will compare every quote and demand the lowest price. You are price-obsessed, comparison-driven, and value-blind.

Key characteristics:
- Price-obsessed and cost-focused
- Comparison-driven shopper
- Value-blind (only sees price)
- Aggressive negotiator
- Demands the lowest price

Common objections:
- "What's your best price?"
- "I can get it cheaper elsewhere"
- "That's too expensive"
- "I only care about the bottom line"
- "Can you beat this price?"

Respond naturally as a price hunter, using direct language about costs. Keep responses short (1-2 sentences) and stay in character. Focus on price and cost comparisons.`,

  // Keep legacy personas for backward compatibility
  sarah: `You are Sarah, a 28-year-old young professional working in tech. You are price-sensitive, have a busy lifestyle, and want to make quick decisions. You are skeptical of sales pitches and want to know if insurance is really worth it. You value efficiency and direct communication.

Key characteristics:
- Price-conscious and budget-aware
- Time-pressed and values quick solutions
- Skeptical of sales tactics
- Wants clear, concise information
- Prefers digital/online processes

Common objections:
- "It's too expensive for my budget"
- "I don't have time for this right now"
- "Do I really need this coverage?"
- "Can you make this quick?"
- "What's the bottom line cost?"

Respond naturally as Sarah, using contractions and casual language. Keep responses short (1-2 sentences) and stay in character.`,

  'mike-jennifer': `You are Mike & Jennifer, a 35-year-old couple with two young children. You are safety-concerned, comparison shoppers, and detail-oriented. You want comprehensive coverage for your family and ask a lot of questions about policy details. You value thoroughness and family protection.

Key characteristics:
- Family-focused and safety-conscious
- Comparison shoppers who research thoroughly
- Detail-oriented and ask specific questions
- Want comprehensive coverage
- Value long-term security

Common objections:
- "How does this compare to other plans?"
- "Is this the safest option for my family?"
- "What exactly is covered?"
- "Can you show me the details?"
- "What about coverage for our children?"

Respond naturally as Mike & Jennifer, showing concern for family safety. Keep responses conversational and detailed.`,

  robert: `You are Robert, a 67-year-old retiree who has been with his current insurance provider for 15 years. You are loyal to your current provider, suspicious of change, and ask many questions. You value long-term relationships and are wary of new offers. You prefer stability and proven track records.

Key characteristics:
- Loyal to current provider
- Suspicious of change and new offers
- Values long-term relationships
- Asks many detailed questions
- Prefers stability over innovation

Common objections:
- "I've been with my provider for years"
- "Why should I switch from what works?"
- "Is this really better than what I have?"
- "What aren't you telling me?"
- "My current provider has been good to me"

Respond naturally as Robert, showing loyalty and skepticism. Keep responses measured and questioning.`
};

// Enhanced fallback responses for when Claude API is unavailable
const fallbackResponses: Record<string, string[]> = {
  'skeptical-shopper': [
    "I was just comparing prices online. Can you just send me a quote?",
    "I'm not really looking to buy right now, just shopping around.",
    "I was just curious about rates. What's the bottom line?",
    "I'm just doing some comparison shopping. Can you make this quick?",
    "I'm not serious about buying yet. Just want to see what's out there."
  ],
  'busy-professional': [
    "I'm in a meeting right now. Can you just get to the point?",
    "I don't have time for this. What's the bottom line?",
    "I'm really busy. Can you just send me some information?",
    "I'm not interested right now. I'm in the middle of something.",
    "Can you just give me the highlights? I'm pressed for time."
  ],
  'price-hunter': [
    "What's your best price? I can get it cheaper elsewhere.",
    "That's too expensive. Can you beat this price?",
    "I only care about the bottom line. What's the cheapest option?",
    "I'm comparing quotes. Can you give me your best deal?",
    "That's more than I want to pay. Do you have anything cheaper?"
  ],
  sarah: [
    "I'm not sure about this... can you tell me more about the cost?",
    "This seems expensive. Do you have anything more affordable?",
    "I'm really busy right now. Can you just give me the bottom line?",
    "I need to think about this. Can you send me some information?",
    "Is this really necessary? I'm not convinced I need this."
  ],
  'mike-jennifer': [
    "We need to think about this carefully. What about coverage for our children?",
    "How does this compare to what we have now?",
    "Can you show us the details of what's covered?",
    "We want to make sure our family is protected. What are the options?",
    "This is a big decision for our family. We need more information."
  ],
  robert: [
    "I've been with my current company for years. What makes you different?",
    "Why should I switch from what I have? It's been working fine.",
    "I'm not sure about changing providers. What's the catch?",
    "My current provider has been good to me. Why should I change?",
    "I need to think about this. Can you send me some information to review?"
  ]
};

// Get a random fallback response for a persona
const getRandomFallbackResponse = (personaId: string): string => {
  const responses = fallbackResponses[personaId] || fallbackResponses.sarah;
  return responses[Math.floor(Math.random() * responses.length)];
};

// Enhanced logging function
const logRequest = (request: NextRequest, body: any) => {
  console.log('🚀 Chat API Request:', {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    persona: body.persona?.id,
    agentResponseLength: body.agentResponse?.length,
    conversationHistoryLength: body.conversationHistory?.length,
    userAgent: request.headers.get('user-agent'),
    origin: request.headers.get('origin'),
  });
};

const logResponse = (response: any, duration: number) => {
  console.log('✅ Chat API Response:', {
    timestamp: new Date().toISOString(),
    duration: `${duration}ms`,
    responseLength: response.response?.length,
    hasError: !!response.error,
  });
};

const logError = (error: any, context: string) => {
  console.error('❌ Chat API Error:', {
    timestamp: new Date().toISOString(),
    context,
    error: {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
    },
    stack: error.stack,
  });
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let persona: ChatRequest['persona'] | undefined;
  
  try {
    // Log incoming request
    const body: ChatRequest = await request.json();
    logRequest(request, body);
    
    // Validate request body
    if (!body.persona || !body.agentResponse) {
      const error = { error: 'Missing required fields: persona and agentResponse' };
      logResponse(error, Date.now() - startTime);
      return NextResponse.json(error, { status: 400 });
    }
    
    persona = body.persona;
    const { agentResponse, conversationHistory = [] } = body;

    // Validate persona
    if (!personaPrompts[persona.id]) {
      const error = { error: `Invalid persona: ${persona.id}` };
      logResponse(error, Date.now() - startTime);
      return NextResponse.json(error, { status: 400 });
    }

    // Create Anthropic client
    const anthropic = createAnthropicClient();
    if (!anthropic) {
      console.warn('⚠️ Using fallback responses - Anthropic client not available');
      const fallbackResponse = getRandomFallbackResponse(persona.id);
      const response = { response: fallbackResponse, fallback: true };
      logResponse(response, Date.now() - startTime);
      return NextResponse.json(response);
    }

    // Build enhanced system prompt
    const systemPrompt = `${personaPrompts[persona.id]}

IMPORTANT: Respond as ${persona.name} in a natural, conversational way. Use contractions and sound like a real person. Keep responses short (1-2 sentences maximum). Stay in character and make objections realistic for your persona. Do not break character or mention that you are an AI.`;

    // Build user prompt with conversation context
    const conversationContext = conversationHistory.length > 0 
      ? `\nPrevious conversation:\n${conversationHistory.map((msg: any) => 
          `${msg.speaker === 'agent' ? 'Agent' : persona!.name}: ${msg.content}`
        ).join('\n')}\n`
      : '';

    const userPrompt = `${conversationContext}Agent's latest message: "${agentResponse}"

Respond as ${persona!.name}:`;

    // Make API call with enhanced configuration
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

    // Extract response
    const response = message.content[0].type === 'text' ? message.content[0].text : '';
    
    if (!response || response.trim().length === 0) {
      throw new Error('Empty response from Claude API');
    }

    const result = { response: response.trim() };
    logResponse(result, Date.now() - startTime);

    // Return response with CORS headers
    return NextResponse.json(result, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error: any) {
    logError(error, 'POST request processing');
    
    // Handle specific error types with detailed responses
    if (error.status === 401) {
      const errorResponse = { 
        error: 'Authentication failed. Please check your API key.',
        code: 'AUTH_ERROR'
      };
      logResponse(errorResponse, Date.now() - startTime);
      return NextResponse.json(errorResponse, { status: 401 });
    }
    
    if (error.status === 429) {
      const errorResponse = { 
        error: 'Rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT'
      };
      logResponse(errorResponse, Date.now() - startTime);
      return NextResponse.json(errorResponse, { status: 429 });
    }
    
    if (error.status === 404) {
      const errorResponse = { 
        error: 'Model not found. Please check your configuration.',
        code: 'MODEL_NOT_FOUND'
      };
      logResponse(errorResponse, Date.now() - startTime);
      return NextResponse.json(errorResponse, { status: 404 });
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      const errorResponse = { 
        error: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR'
      };
      logResponse(errorResponse, Date.now() - startTime);
      return NextResponse.json(errorResponse, { status: 503 });
    }
    
    // Use fallback response for any other errors
    const fallbackResponse = persona && persona.id 
      ? getRandomFallbackResponse(persona.id)
      : "I need to think about this. Can you send me some information?";
    
    const result = { 
      response: fallbackResponse, 
      fallback: true,
      error: 'Using fallback response due to API error'
    };
    
    logResponse(result, Date.now() - startTime);
    return NextResponse.json(result, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 