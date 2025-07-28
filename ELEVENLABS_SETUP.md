# ElevenLabs Voice AI Setup for ObjectionIQ

## 🎙️ Complete Voice Training Implementation

ObjectionIQ now features a comprehensive voice training system with real speech recognition and ElevenLabs AI voice synthesis.

## 🔧 Environment Variables

Add these to your `.env.local` file:

```bash
# ElevenLabs API Key (Server-side)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Anthropic Claude API Key
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## 🚀 Features Implemented

### 1. Real Speech Recognition
- **Web Speech API** integration
- **Microphone permissions** handling
- **Visual feedback** during listening
- **Error handling** for unsupported browsers

### 2. ElevenLabs Voice Synthesis
- **Professional AI voices** for each persona
- **Persona-specific voice settings**
- **Streaming audio** generation
- **Fallback to browser TTS** if needed

### 3. iPhone-Style Call Interface
- **Full-screen call layout**
- **Large customer avatar**
- **Call timer** and status indicators
- **Microphone button** with visual feedback
- **Audio level indicators**
- **Mute/unmute controls**

### 4. Natural Conversation Flow
- **AI speaks first** with persona-specific greeting
- **User speaks** → **Speech to text** → **Claude API** → **ElevenLabs speech**
- **Real-time conversation** loop
- **Conversation history** tracking

## 🎭 Voice Personas

### Sarah Mitchell (Young Professional)
- **Voice ID**: `21m00Tcm4TlvDq8ikWAM` (Rachel)
- **Style**: Young, professional, confident
- **Greeting**: "Hi, this is Sarah. I'm calling about the insurance quote you requested..."

### Robert Chen (Small Business Owner)
- **Voice ID**: `AZnzlk1XvdvUeBnXmlld` (Domi)
- **Style**: Mature, authoritative, business-focused
- **Greeting**: "Hello, this is Robert Chen. I received your request for insurance information..."

### Linda Rodriguez (Budget-Conscious Teacher)
- **Voice ID**: `EXAVITQu4vr4xnSDxMaL` (Bella)
- **Style**: Warm, friendly, understanding
- **Greeting**: "Hi there, this is Linda. I'm calling about your insurance quote..."

## 🔄 Conversation Flow

1. **User clicks "Start Voice Call"**
2. **AI customer speaks greeting** using ElevenLabs voice
3. **User presses microphone** and speaks response
4. **Speech recognition** converts to text
5. **Text sent to Claude API** for AI response
6. **AI response converted** to ElevenLabs speech
7. **Audio plays automatically**
8. **Repeat conversation loop** until call ends

## 🛠️ Technical Implementation

### API Routes
- `/api/elevenlabs` - ElevenLabs text-to-speech
- `/api/chat` - Claude AI conversation

### Components
- `VoiceTraining.tsx` - Main voice training interface
- `VoiceTraining` - iPhone-style call interface

### Browser Support
- **Chrome**: Full support
- **Safari**: Full support (with webkit prefix)
- **Firefox**: Full support
- **Edge**: Full support

## 🔒 Security & Permissions

### HTTPS Required
- **Speech APIs** require HTTPS in production
- **Microphone access** requires user permission
- **Secure API key** handling

### Error Handling
- **API key validation**
- **Network error recovery**
- **Browser compatibility** checks
- **Graceful fallbacks**

## 📱 Mobile Support

### Responsive Design
- **Touch-friendly** interface
- **Large buttons** for mobile
- **Optimized layout** for small screens
- **Audio optimization** for mobile devices

### Performance
- **Streaming audio** for fast response
- **Audio buffering** for smooth playback
- **Memory management** for long calls

## 🎯 Usage Instructions

### For Users
1. **Select a customer** from the dashboard
2. **Click "Start Voice Call"**
3. **Allow microphone access** when prompted
4. **Speak naturally** when the microphone is active
5. **Listen to AI responses** in realistic voices
6. **End call** when practice is complete

### For Developers
1. **Set up environment variables**
2. **Deploy to HTTPS environment**
3. **Test microphone permissions**
4. **Verify ElevenLabs API access**
5. **Monitor API usage** and costs

## 💰 ElevenLabs Pricing

### Free Tier
- **10,000 characters** per month
- **Basic voices** available
- **Perfect for testing**

### Paid Plans
- **Starter**: $22/month - 30,000 characters
- **Creator**: $99/month - 250,000 characters
- **Independent Publisher**: $330/month - 1,000,000 characters
- **Growing Business**: $825/month - 2,500,000 characters

### Voice Cloning
- **Custom voices** available
- **Professional voice** training
- **Brand-specific** voice creation

## 🚀 Deployment Checklist

- [ ] **Environment variables** configured
- [ ] **HTTPS enabled** for production
- [ ] **ElevenLabs API key** validated
- [ ] **Microphone permissions** tested
- [ ] **Browser compatibility** verified
- [ ] **Error handling** implemented
- [ ] **Performance optimized**
- [ ] **Mobile responsiveness** tested

## 🎉 Result

ObjectionIQ now provides a **truly realistic phone call experience** with:
- **Real speech recognition**
- **Professional AI voices**
- **Natural conversation flow**
- **iPhone-style interface**
- **Complete voice training** system

This creates the most realistic objection handling practice available for insurance agents! 🎙️ 