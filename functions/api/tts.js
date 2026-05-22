/**
 * functions/api/tts.js
 * TTS语音合成接口
 * POST /api/tts
 * Body: { text: string, voice?: string, speed?: number }
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { text, voice = 'Annie', speed = 0.9 } = await request.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = env.MINIMAX_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch('https://api.minimaxi.com/v1/t2a_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'speech-2.8-hd',
        text: text,
        stream: false,
        voice_setting: {
          voice_id: voice,
          speed: speed
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(JSON.stringify({ error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const audioData = await response.arrayBuffer();
    const bytes = new Uint8Array(audioData);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    return new Response(JSON.stringify({
      audioData: `data:audio/mp3;base64,${base64}`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}