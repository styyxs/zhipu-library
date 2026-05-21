/**
 * tts.js - TTS语音合成（MiniMax API + Web Speech API降级）
 * API_BASE只在这里声明，其他文件用完整URL
 */
const API_BASE = '';

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
      await this.webSpeechSpeak(text, { speed, callback }).catch(() => {});
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
    return new Promise((resolve) => {
      if (!window.speechSynthesis) { resolve(); return; }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = options.speed || 0.9;
      utterance.onend = () => { this.isPlaying = false; options.callback?.(); resolve(); };
      utterance.onerror = () => { this.isPlaying = false; resolve(); };
      this.isPlaying = true;
      window.speechSynthesis.speak(utterance);
    });
  },

  playAudio(audio, callback) {
    return new Promise((resolve, reject) => {
      audio.onended = () => { this.isPlaying = false; callback?.(); resolve(); };
      audio.onerror = () => { this.isPlaying = false; reject(new Error('Audio play failed')); };
      this.isPlaying = true;
      audio.play().catch(reject);
    });
  },

  stop() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    this.isPlaying = false;
  }
};
