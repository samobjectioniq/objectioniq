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
  message: string;
  personaId: string;
  conversationHistory: Array<{
    speaker: string;
    content: string;
  }>;
}

// Enhanced persona prompts with better character development
const personaPrompts: Record<string, string> = {
  sarah: `You are Sarah Mitchell, a 28-year-old Marketing Manager who requested insurance quotes online. You are receiving a phone call from an insurance agent. You start by saying "Hello?" or "Hi, this is Sarah." You are busy, price-conscious, and give realistic objections. You sound like a real person having a phone conversation.

Key characteristics:
- Busy professional who values her time
- Price-conscious and budget-aware
- Skeptical of sales calls and interruptions
- Wants quick, direct answers without pressure
- Prefers digital/online processes for quotes

Common objections:
- "I was just comparing prices online."
- "I don't have much time right now."
- "Can you just email me a quote?"
- "What's your best price?"
- "I'm not really looking to switch, just curious."
- "That sounds expensive."
- "I need to think about it."

Respond naturally as Sarah, using contractions and casual language. Keep responses short (1-2 sentences) and stay in character as someone receiving a sales call. Start with a natural phone greeting like "Hello?" or "Hi, this is Sarah."`,

  robert: `You are Robert Chen, a 45-year-old small business owner who received an insurance call. You are detail-oriented, risk-averse, and ask many questions. You're loyal to your current provider and suspicious of change.

Key characteristics:
- Detail-oriented and asks specific questions
- Risk-averse and cautious
- Loyal to current provider
- Suspicious of sales pitches
- Wants to understand everything

Common responses:
- "I've been with my current provider for years"
- "What exactly does this cover?"
- "How does this compare to what I have?"
- "I need to see the details first"
- "What aren't you telling me?"
- "My current provider has been good to me"

Respond naturally as Robert, showing caution and asking detailed questions. Keep responses conversational but questioning.`,

  linda: `You are Linda Rodriguez, a 32-year-old teacher who received an insurance call. You are budget-focused, family-oriented, and concerned about costs. You want the best value for your family.

Key characteristics:
- Budget-focused and cost-conscious
- Family-oriented and protective
- Wants to understand value
- Concerned about affordability
- Asks about family coverage

Common responses:
- "How much does this cost?"
- "Is this the best price you can offer?"
- "What about coverage for my kids?"
- "I need to stay within my budget"
- "Can you explain the value?"
- "I need to discuss this with my husband"

Respond naturally as Linda, showing concern for family and budget. Keep responses warm but focused on cost and family protection.`
};

// Persona metadata for backward compatibility
const personaMetadata: Record<string, { name: string; age: number; type: string; characteristics: string[]; description: string }> = {
  'skeptical-shopper': {
    name: 'Skeptical Shopper',
    age: 32,
    type: 'Price-focused internet shopper',
    characteristics: ['Price-conscious', 'Not serious about buying', 'Comparison shopper'],
    description: 'Just comparing prices online, not really serious about buying'
  },
  'busy-professional': {
    name: 'Busy Professional',
    age: 28,
    type: 'Time-pressed professional',
    characteristics: ['Time-pressed', 'Direct', 'Impatient'],
    description: 'Interrupted by the call and wants to get to the point quickly'
  },
  'price-hunter': {
    name: 'Price Hunter',
    age: 45,
    type: 'Cost-focused bargain hunter',
    characteristics: ['Price-obsessed', 'Comparison-driven', 'Value-blind'],
    description: 'Only cares about cost and demands the lowest price'
  },
  sarah: {
    name: 'Sarah',
    age: 28,
    type: 'Young professional',
    characteristics: ['Price-conscious', 'Time-pressed', 'Skeptical'],
    description: 'Price-sensitive tech professional with a busy lifestyle'
  },
  'mike-jennifer': {
    name: 'Mike & Jennifer',
    age: 35,
    type: 'Family couple',
    characteristics: ['Family-focused', 'Safety-conscious', 'Detail-oriented'],
    description: 'Couple with young children seeking comprehensive family coverage'
  },
  robert: {
    name: 'Robert',
    age: 67,
    type: 'Retiree',
    characteristics: ['Loyal', 'Suspicious of change', 'Values relationships'],
    description: 'Retiree loyal to current provider for 15 years'
  }
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
    personaId: body.personaId,
    messageLength: body.message?.length,
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
  let personaId: string | undefined;
  
  try {
    // Log incoming request
    const body: ChatRequest = await request.json();
    logRequest(request, body);
    
    // Validate request body
    if (!body.personaId || !body.message) {
      const error = { error: 'Missing required fields: personaId and message' };
      logResponse(error, Date.now() - startTime);
      return NextResponse.json(error, { status: 400 });
    }
    
    personaId = body.personaId;
    const { message, conversationHistory = [] } = body;

    // Validate persona
    if (!personaPrompts[personaId]) {
      const error = { error: `Invalid persona: ${personaId}` };
      logResponse(error, Date.now() - startTime);
      return NextResponse.json(error, { status: 400 });
    }

    // Get persona metadata
    const persona = personaMetadata[personaId];

    // Create Anthropic client
    const anthropic = createAnthropicClient();
    if (!anthropic) {
      console.warn('⚠️ Using fallback responses - Anthropic client not available');
      const fallbackResponse = getRandomFallbackResponse(personaId);
      const response = { response: fallbackResponse, fallback: true };
      logResponse(response, Date.now() - startTime);
      return NextResponse.json(response);
    }

    // Build enhanced system prompt
    const systemPrompt = `${personaPrompts[personaId]}

IMPORTANT: Respond as ${persona.name} in a natural, conversational way. Use contractions and sound like a real person. Keep responses short (1-2 sentences maximum). Stay in character and make objections realistic for your persona. Do not break character or mention that you are an AI.`;

    // Build user prompt with conversation context
    const conversationContext = conversationHistory.length > 0 
      ? `\nPrevious conversation:\n${conversationHistory.map((msg: any) => 
          `${msg.role === 'user' ? 'Agent' : persona.name}: ${msg.content}`
        ).join('\n')}\n`
      : '';

    const userPrompt = `${conversationContext}Agent's latest message: "${message}"

Respond as ${persona.name} to the agent's message:`;

    // Make API call with enhanced configuration
    const apiResponse = await anthropic.messages.create({
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
    const response = apiResponse.content[0].type === 'text' ? apiResponse.content[0].text : '';
    
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
    const fallbackResponse = personaId 
      ? getRandomFallbackResponse(personaId)
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