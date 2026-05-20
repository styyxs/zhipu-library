/**
 * Cloudflare Pages Functions - API路由
 * 路径: /functions/api.js
 * 处理 /api/tts 和 /api/image 请求
 */

export async function onRequest({ request, env }) {
  const url = new URL(request.url);

  // CORS预检
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  try {
    if (url.pathname === '/api/tts') {
      return await handleTTS(request, env);
    } else if (url.pathname === '/api/image') {
      return await handleImage(request, env);
    } else {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

async function handleTTS(request, env) {
  const { text, voice = 'Annie', speed = 0.9 } = await request.json();
  const apiKey = env.MINIMAX_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'MINIMAX_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const response = await fetch('https://api.minimax.io/v1/t2a_v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'speech-02-hd',
      text: text,
      stream: false,
      voice_setting: {
        voice_id: voice,
        speed: parseFloat(speed)
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  const audioData = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(audioData)));

  return new Response(JSON.stringify({ audioData: base64 }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

async function handleImage(request, env) {
  const { prompt, size = '1024x1024' } = await request.json();
  const apiKey = env.MINIMAX_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'MINIMAX_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const response = await fetch('https://api.minimax.io/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'image-01',
      prompt: prompt,
      size: size,
      n: 1
    })
  });

  if (!response.ok) {
    const error = await response.text();
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  const data = await response.json();
  return new Response(JSON.stringify({
    imageUrl: data.data?.[0]?.url || ''
  }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
