import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Speech-to-text is handled client-side or via external API. Not implemented server-side.' }, { status: 501 });
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'Text-to-speech is handled client-side or via external API. Not implemented server-side.' }, { status: 501 });
} 