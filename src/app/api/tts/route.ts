import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!elevenLabsApiKey) {
      console.error('ElevenLabs API key is missing on server');
      return NextResponse.json(
        { error: 'TTS Service Unavailable (Missing Key)' },
        { status: 503 }
      );
    }

    // You can customize the voice ID. Here we use a standard popular ID (e.g., 'Rachel' or any premium voice).
    // Using an arbitrary professional sounding voice ID commonly used in generic TTS examples.
    // '21m00Tcm4TlvDq8ikWAM' is ElevenLabs 'Rachel' voice.
    const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; 

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": elevenLabsApiKey
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API Error: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();

    // Stream the audio blob back to the client
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error: any) {
    console.error('TTS API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
