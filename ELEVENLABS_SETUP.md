# ElevenLabs Voice API Setup Guide

## 🎙️ High-Quality AI Voices for ObjectionIQ

ElevenLabs provides natural, human-like voices that are perfect for AI customer personas. This replaces the robotic browser speech synthesis with professional-quality voices.

## 🚀 Quick Setup

### 1. Get ElevenLabs API Key
1. Go to [ElevenLabs.io](https://elevenlabs.io)
2. Sign up for a free account
3. Navigate to your profile → API Key
4. Copy your API key

### 2. Add Environment Variable
Add this to your `.env.local` file:
```
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_api_key_here
```

### 3. Deploy to Vercel
Add the environment variable in Vercel:
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add `NEXT_PUBLIC_ELEVENLABS_API_KEY` with your API key
4. Redeploy

## 🎯 Voice Personas

The app uses these ElevenLabs voices:

- **Sarah (Young Professional)**: Rachel - young, professional female voice
- **Robert (Business Owner)**: Domi - mature, authoritative male voice  
- **Linda (Teacher)**: Bella - warm, friendly female voice

## 💰 Pricing

- **Free Tier**: 10,000 characters/month
- **Paid Plans**: Start at $22/month for 30,000 characters
- **Pay-as-you-go**: $0.30 per 1,000 characters

## 🔧 Fallback System

If ElevenLabs is unavailable or quota is exceeded:
- Automatically falls back to browser TTS
- No interruption to user experience
- Graceful degradation

## 🎨 Custom Voices

You can create custom voices in ElevenLabs:
1. Upload voice samples
2. Train custom voice model
3. Replace voice IDs in `src/utils/voiceApi.ts`

## 🐛 Troubleshooting

### API Key Issues
- Check environment variable is set correctly
- Verify API key is valid in ElevenLabs dashboard
- Check browser console for error messages

### Voice Quality
- ElevenLabs voices are much more natural than browser TTS
- Adjust voice settings in `VOICE_SETTINGS` for different personalities
- Test different voice IDs for best results

### Fallback Issues
- Browser TTS will work if ElevenLabs fails
- Check browser compatibility for speech synthesis
- Ensure HTTPS is enabled (required for speech APIs) 