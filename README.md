# ObjectionIQ - AI-Powered Insurance Sales Training

A voice-first training application that helps insurance agents practice sales conversations with AI-powered customer personas.

## Features

- **Voice-First Training**: Practice real conversations with speech recognition and AI responses
- **Realistic Personas**: Three distinct customer types with unique characteristics and objections
- **AI-Powered Responses**: Claude AI generates realistic customer responses and objections
- **Performance Tracking**: Monitor session duration, objections handled, and confidence scores
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices
- **Professional UI**: Clean, modern interface built with Tailwind CSS

## Customer Personas

### Sarah (28) - Young Professional
- **Characteristics**: Price-conscious, Time-pressed, Tech-savvy, Skeptical of sales pitches
- **Common Objections**: Cost concerns, time constraints, uncertainty about need

### Mike & Jennifer (35) - Family Focused
- **Characteristics**: Safety-focused, Detail-oriented, Family priorities, Research-driven
- **Common Objections**: Coverage questions, family safety concerns, detailed inquiries

### Robert (67) - Skeptical Retiree
- **Characteristics**: Provider-loyal, Question-heavy, Value-focused, Experience-based
- **Common Objections**: Loyalty to current provider, value questions, experience-based skepticism

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **AI Integration**: Anthropic Claude API
- **Voice**: Web Speech API (Speech Recognition & Synthesis)
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd objectioniq
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Getting an Anthropic API Key

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env.local` file

## Usage

### Starting a Training Session

1. Navigate to the training page
2. Select a customer persona (Sarah, Mike & Jennifer, or Robert)
3. Allow microphone access when prompted
4. Click the microphone button to start speaking
5. Respond to the AI customer's objections and questions
6. Use the text input as a fallback if voice recognition isn't working

### Training Tips

**Before You Start:**
- Find a quiet environment
- Allow microphone access
- Speak clearly and naturally
- Listen to the AI customer's responses

**During Training:**
- Address objections directly
- Ask clarifying questions
- Provide specific examples
- Build rapport naturally

### Session Controls

- **Microphone Button**: Click to start/stop voice recognition
- **Reset Button**: Start a new conversation with the same persona
- **Text Input**: Type responses if voice recognition isn't working
- **Session Stats**: Monitor your progress in real-time

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Claude AI integration
│   ├── training/
│   │   └── page.tsx              # Training interface
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/
│   ├── PersonaSelector.tsx       # Persona selection interface
│   ├── SessionStats.tsx          # Session statistics display
│   └── VoiceInterface.tsx        # Main voice training interface
└── types/
    └── persona.ts                # TypeScript type definitions
```

## API Endpoints

### POST /api/chat

Generates AI customer responses based on the selected persona and conversation history.

**Request Body:**
```json
{
  "persona": {
    "id": "sarah",
    "name": "Sarah",
    "age": 28,
    "type": "Young Professional",
    "characteristics": ["Price-conscious", "Time-pressed"],
    "description": "Price-sensitive tech professional"
  },
  "agentResponse": "I understand your concerns about cost...",
  "conversationHistory": [...]
}
```

**Response:**
```json
{
  "response": "That sounds expensive. Can you tell me more about what's included?"
}
```

## Browser Compatibility

- **Speech Recognition**: Chrome, Edge, Safari (limited)
- **Speech Synthesis**: All modern browsers
- **Voice Features**: Best experience on Chrome/Edge

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Personas

1. Add persona data to the `personas` array in `src/app/training/page.tsx`
2. Update the `generateCustomerGreeting` function in `VoiceInterface.tsx`
3. Add fallback responses in the API route
4. Update the system prompt in the API to handle the new persona

### Customizing AI Responses

Modify the system prompt in `src/app/api/chat/route.ts` to adjust:
- Response style and tone
- Objection types and frequency
- Conversation flow and engagement

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue on GitHub or contact the development team.

---

**ObjectionIQ** - Transform your insurance sales skills with AI-powered voice training.
# Force new deployment
# Force new deployment - Sat Jul 19 13:28:27 PDT 2025
# Force redeploy with re-enabled API key - Sat Jul 19 14:07:25 PDT 2025
