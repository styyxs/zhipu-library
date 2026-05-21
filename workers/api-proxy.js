/**
 * Cloudflare Worker - MiniMax API代理
 * 解决CORS问题 + 隐藏API Key
 */

const MINIMAX_API_BASE = 'https://api.minimaxi.com';

// TTS语音合成
async function handleTTS(request) {
  const { text, voice = 'female-shaonv', speed = 0.9 } = await request.json();
  const apiKey = MINIMAX_API_KEY;

  const response = await fetch(`${MINIMAX_API_BASE}/v1/t2a_v2`, {
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
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  const audioData = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(audioData)));

  return new Response(JSON.stringify({
    audioData: base64
  }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

// ASR语音识别（短音频转文字）
async function handleASR(request) {
  const apiKey = MINIMAX_API_KEY;
  const formData = await request.formData();
  const audioFile = formData.get('file');
  const model = formData.get('model') || 'speech-02-hd';

  if (!audioFile) {
    return new Response(JSON.stringify({ error: 'No audio file' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // 构造发给 MiniMax 的 FormData
  const miniForm = new FormData();
  miniForm.append('file', audioFile);
  miniForm.append('model', model);
  miniForm.append('language', 'en');

  const response = await fetch(`${MINIMAX_API_BASE}/v1/audio/transcriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`
      // 注意：FormData 自己会设置正确的 Content-Type（multipart/form-data）
    },
    body: miniForm
  });

  if (!response.ok) {
    const error = await response.text();
    return new Response(JSON.stringify({ error }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }

  const result = await response.json();
  // 兼容 OpenAI 格式：{ text: "..." }
  return new Response(JSON.stringify({
    text: result.text || result.result?.text || ''
  }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}

// AI图片生成
async function handleImage(request) {
  const { prompt, size = '1024x1024' } = await request.json();
  const apiKey = MINIMAX_API_KEY;

  const response = await fetch(`${MINIMAX_API_BASE}/v1/images/generations`, {
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

// 路由分发
async function router(request) {
  const url = new URL(request.url);
  const path = url.pathname;

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
    if (path === '/api/tts') {
      return await handleTTS(request);
    } else if (path === '/api/image') {
      return await handleImage(request);
    } else if (path === '/api/asr') {
      return await handleASR(request);
    } else {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// 主入口
export default {
  async fetch(request, env) {
    globalThis.MINIMAX_API_KEY = env.MINIMAX_API_KEY || '';
    const response = await router(request);
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    return new Response(response.body, {
      status: response.status,
      headers: newHeaders
    });
  }
};
