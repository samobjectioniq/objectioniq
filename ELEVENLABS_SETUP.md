# ElevenLabs Voice AI Setup for ObjectionIQ

## Overview
ObjectionIQ uses ElevenLabs Text-to-Speech API to provide realistic voice responses for AI customers during objection handling practice sessions.

## Features
- **High-Quality Voice Synthesis**: Natural-sounding AI customer voices
- **Persona-Specific Voices**: Different voice characteristics for each customer type
- **Real-Time Speech**: Instant voice responses during practice calls
- **iPhone-Style Interface**: Professional call experience

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# ElevenLabs API Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Anthropic Claude API (for AI responses)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## Voice IDs Used

- **Sarah Mitchell**: `21m00Tcm4TlvDq8ikWAM` (Young professional, clear voice)
- **Robert Chen**: `pNInz6obpgDQGcFmaJgB` (Mature, authoritative voice)
- **Linda Rodriguez**: `AZnzlk1XvdvUeBnXmlld` (Warm, friendly voice)
- **David Thompson**: `EXAVITQu4vr4xnSDxMaL` (Older, experienced voice)

## Conversation Flow

1. **User clicks "Call [Customer]"** → iPhone-style interface opens
2. **AI customer speaks first** → Natural greeting using ElevenLabs voice
3. **User speaks** → Web Speech API converts to text
4. **Text sent to Claude** → AI generates customer response
5. **Claude response → ElevenLabs** → Converts to speech and plays
6. **Repeat conversation loop** → Natural back-and-forth dialogue

## Technical Implementation

### API Routes
- `/api/elevenlabs` - Text-to-speech conversion
- `/api/chat` - Claude AI conversation responses

### Voice Settings
Each persona has optimized voice settings for natural conversation:
- **Stability**: 0.5-0.7 (voice consistency)
- **Similarity Boost**: 0.75 (voice character preservation)
- **Style**: 0.0 (natural speaking style)
- **Speaker Boost**: true (enhanced clarity)

## Browser Support
- **Chrome**: Full support
- **Safari**: Full support
- **Firefox**: Full support
- **Edge**: Full support

## Security
- API keys stored server-side only
- HTTPS required for speech APIs
- No client-side API key exposure

## Mobile Support
- Responsive iPhone-style interface
- Touch-optimized controls
- Mobile browser compatibility

## Usage Instructions

### For Users
1. Select a customer from the dashboard
2. Click "Start Call" to begin practice
3. Wait for AI customer to speak first
4. Press microphone button and speak naturally
5. Listen to AI customer's response
6. Continue conversation until practice complete

### For Developers
1. Set up environment variables
2. Test voice synthesis with `/api/test-elevenlabs`
3. Verify Claude API responses
4. Test full conversation flow

## Pricing
- **ElevenLabs**: Pay-per-character usage
- **Claude**: Pay-per-token usage
- **Estimated cost**: ~$0.01-0.05 per practice session

## Deployment Checklist

### Environment Variables
- [ ] `ELEVENLABS_API_KEY` configured
- [ ] `ANTHROPIC_API_KEY` configured
- [ ] Variables added to production environment

### API Testing
- [ ] ElevenLabs TTS working
- [ ] Claude API responding correctly
- [ ] Voice quality acceptable
- [ ] Conversation flow natural

### Browser Testing
- [ ] Chrome voice recognition working
- [ ] Safari voice recognition working
- [ ] Mobile browsers tested
- [ ] HTTPS certificate valid

### Performance
- [ ] Voice response time < 2 seconds
- [ ] Audio quality clear
- [ ] No memory leaks
- [ ] Smooth conversation flow

## Troubleshooting

### Common Issues
1. **"API key not configured"** → Check environment variables
2. **"Speech recognition not supported"** → Use supported browser
3. **"Failed to generate speech"** → Check ElevenLabs API key
4. **"No audio output"** → Check browser audio permissions

### Debug Steps
1. Check browser console for errors
2. Verify API keys in environment
3. Test individual API endpoints
4. Check network connectivity
5. Verify HTTPS requirement

## Support
For technical issues, check the browser console and API response logs for detailed error information. 