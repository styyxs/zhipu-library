/**
 * speech.js - 语音识别（浏览器原生webkitSpeechAPI）
 */
const Speech = {
  recognition: null,
  lastTranscript: '',
  isListening: false,
  onResult: null,

  checkPermission() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
    }
  },

  async requestMicPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      return true;
    } catch (e) {
      console.log('Mic permission denied:', e.message);
      return false;
    }
  },

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      this.lastTranscript = transcript.trim();
      if (this.onResult) this.onResult(this.lastTranscript);
    };

    this.recognition.onerror = (event) => {
      console.log('Speech recognition error:', event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  },

  startListening(onResult) {
    if (!this.recognition) this.init();
    if (!this.recognition) return;
    // 防止重复启动
    if (this.isListening) {
      console.log('Already listening, ignoring start');
      return;
    }
    this.onResult = onResult || null;
    this.lastTranscript = '';
    this.isListening = true;
    try {
      this.recognition.start();
    } catch (e) {
      console.log('Recognition start error:', e);
      this.isListening = false;
    }
  },

  stopListening() {
    if (this.recognition && this.isListening) {
      try { this.recognition.stop(); } catch {}
    }
    this.isListening = false;
  }
};
