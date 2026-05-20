/**
 * tts.js - 语音合成
 */
const API_BASE = 'https://ollie-zhipu-library.962324377.workers.dev';

const TTS = {
  cache: {},
  isPlaying: false,

  async speak(text, options = {}) {
    const { speed = 0.9, callback } = options;
    const cacheKey = `${text}_${speed}`;

    if (this.cache[cacheKey]) {
      return this.playAudio(this.cache[cacheKey], callback);
    }

    // 优先MiniMax TTS，降级用Web Speech API
    try {
      await this.minimaxSpeak(text, { speed, callback, cacheKey });
    } catch (e) {
      console.log('TTS fallback to Web Speech API:', e.message);
      await this.webSpeechSpeak(text, { speed, callback });
    }
  },

  async minimaxSpeak(text, options) {
    const { speed, callback, cacheKey } = options;
    const response = await fetch(`${API_BASE}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: 'Annie', speed: speed || 0.9 })
    });

    if (!response.ok) throw new Error('TTS API failed');

    const data = await response.json();
    const audioSrc = data.audioUrl || `data:audio/mp3;base64,${data.audioData}`;
    const audio = new Audio(audioSrc);
    if (cacheKey) this.cache[cacheKey] = audio;
    return this.playAudio(audio, callback);
  },

  async webSpeechSpeak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(); return;
      }
      // 停止之前的语音
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = options.speed || 0.9;
      utterance.onend = () => { this.isPlaying = false; options.callback?.(); resolve(); };
      utterance.onerror = (e) => { 
        console.log('Web Speech error:', e);
        this.isPlaying = false; 
        reject(); 
      };
      this.isPlaying = true;
      window.speechSynthesis.speak(utterance);
    });
  },

  playAudio(audio, callback) {
    return new Promise((resolve, reject) => {
      audio.onended = () => { this.isPlaying = false; callback?.(); resolve(); };
      audio.onerror = () => { this.isPlaying = false; reject(); };
      this.isPlaying = true;
      audio.play().catch(reject);
    });
  },

  stop() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    this.isPlaying = false;
  }
};
