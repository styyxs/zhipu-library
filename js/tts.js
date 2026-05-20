/**
 * tts.js - 语音合成
 */
const API_BASE = 'https://ollie-mimi-api.962324377.workers.dev';

const TTS = {
  cache: {},
  isPlaying: false,

  async speak(text, options = {}) {
    const { speed = 0.9, callback } = options;
    const cacheKey = `${text}_${speed}`;

    if (this.cache[cacheKey]) {
      return this.playAudio(this.cache[cacheKey], callback);
    }

    try {
      await this.minimaxSpeak(text, { speed, callback });
    } catch (e) {
      console.log('TTS fallback to Web Speech API');
      await this.webSpeechSpeak(text, { speed, callback });
    }
  },

  async minimaxSpeak(text, options = {}) {
    const response = await fetch(`${API_BASE}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: 'Annie', speed: options.speed || 0.9 })
    });

    if (!response.ok) throw new Error('TTS failed');

    const data = await response.json();
    const audio = new Audio(data.audioUrl || `data:audio/mp3;base64,${data.audioData}`);
    this.cache[cacheKey] = audio;
    return this.playAudio(audio, options.callback);
  },

  async webSpeechSpeak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) { reject(); return; }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = options.speed || 0.9;
      utterance.onend = () => { this.isPlaying = false; options.callback?.(); resolve(); };
      utterance.onerror = () => { this.isPlaying = false; reject(); };
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
