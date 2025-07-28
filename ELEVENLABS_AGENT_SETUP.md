# ElevenLabs Conversational AI Agent Integration

## 🤖 Real AI Agent Conversation for ObjectionIQ

ObjectionIQ now features integration with ElevenLabs Conversational AI agents, providing truly realistic conversations with AI-powered customers.

## 🚀 Agent Details

### Sarah Mitchell - AI Agent
- **Agent ID**: `agent_3801k17b9hbdefcs5setbn9smtes`
- **Agent URL**: https://elevenlabs.io/app/talk-to?agent_id=agent_3801k17b9hbdefcs5setbn9smtes
- **Type**: Conversational AI Agent
- **Specialization**: Insurance objection handling

## 🔧 Environment Variables

Add these to your `.env.local` file:

```bash
# ElevenLabs API Key (Server-side)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# ElevenLabs Agent ID for Sarah Mitchell
ELEVENLABS_AGENT_ID_SARAH=agent_3801k17b9hbdefcs5setbn9smtes

# Anthropic Claude API Key (for other personas)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## 🎯 Features Implemented

### 1. Real AI Agent Conversation
- **ElevenLabs Conversational AI** integration
- **Real-time conversation** with Sarah Mitchell
- **Natural voice responses** from trained agent
- **Session management** for continuous conversations

### 2. Advanced Voice Interface
- **iPhone-style call interface** maintained
- **Real-time audio streaming** from agent
- **Speech recognition** for user input
- **Audio level indicators** and visual feedback

### 3. Conversation Flow
- **Agent session creation** on call start
- **Real-time message exchange** with agent
- **Audio streaming** in both directions
- **Session cleanup** on call end

## 🔄 Conversation Flow

### 1. Call Initiation
- User clicks "Call Sarah Mitchell"
- System creates ElevenLabs agent session
- Agent provides initial greeting
- Call interface becomes active

### 2. Real-time Conversation
- User speaks → Speech recognition → Text message
- Text sent to Sarah's agent via API
- Agent processes and responds naturally
- Agent's voice response streams back to user

### 3. Call Management
- Continuous conversation until user ends call
- Session management and cleanup
- Error handling and fallbacks

## 🛠️ Technical Implementation

### API Routes
- `/api/elevenlabs-agent` - Main agent conversation API
- `/api/elevenlabs` - Legacy TTS for other personas
- `/api/chat` - Claude AI for other personas

### Components
- `AgentVoiceTraining.tsx` - Sarah Mitchell agent interface
- `VoiceTraining.tsx` - Legacy voice training for other personas

### Agent API Endpoints
- `POST /conversation` - Create agent session
- `POST /conversation/{id}/message` - Send text message
- `POST /conversation/{id}/audio` - Send audio message
- `DELETE /conversation/{id}` - End session

## 🎭 Agent Capabilities

### Sarah Mitchell Agent
- **Natural conversation** flow
- **Insurance knowledge** and expertise
- **Objection handling** scenarios
- **Realistic customer responses**
- **Professional voice** and personality

### Training Scenarios
- Price objections and negotiations
- Coverage questions and concerns
- Comparison shopping responses
- Time pressure and urgency
- Skepticism and trust building

## 🔒 Security & Permissions

### API Security
- **Server-side API key** handling
- **Session-based** conversations
- **Secure audio streaming**
- **Error handling** and validation

### Browser Requirements
- **HTTPS required** for production
- **Microphone permissions** needed
- **Web Speech API** support
- **Audio streaming** capabilities

## 📱 User Experience

### Call Interface
- **Professional iPhone-style** design
- **Real-time status** indicators
- **Audio level** visualization
- **Call duration** tracking
- **Error handling** and feedback

### Conversation Quality
- **Natural voice** responses
- **Realistic objections** and scenarios
- **Professional training** experience
- **Immersive practice** environment

## 🚀 Deployment Checklist

- [ ] **Environment variables** configured
- [ ] **ElevenLabs API key** validated
- [ ] **Agent ID** configured correctly
- [ ] **HTTPS enabled** for production
- [ ] **Microphone permissions** tested
- [ ] **Agent session** creation verified
- [ ] **Audio streaming** working
- [ ] **Error handling** implemented
- [ ] **Session cleanup** tested

## 🧪 Testing

### Local Testing
1. Set up environment variables
2. Start development server
3. Navigate to dashboard
4. Select Sarah Mitchell
5. Click "Call Sarah Mitchell"
6. Test conversation flow

### Production Testing
1. Deploy to Vercel with environment variables
2. Test agent session creation
3. Verify audio streaming
4. Test conversation quality
5. Validate session cleanup

## 💰 ElevenLabs Pricing

### Conversational AI
- **Agent conversations** billed per minute
- **Voice streaming** included
- **Session management** included
- **Real-time processing** included

### Pricing Tiers
- **Free Tier**: Limited agent minutes
- **Paid Plans**: Based on conversation minutes
- **Enterprise**: Custom pricing for high volume

## 🎉 Result

ObjectionIQ now provides the **most advanced AI training experience** available:

- **Real AI agent conversations** with Sarah Mitchell
- **Natural voice responses** from trained agent
- **Professional objection handling** scenarios
- **Immersive practice environment**
- **Cutting-edge AI technology**

This creates the most realistic and effective objection handling practice available for insurance agents! 🤖🎙️ 