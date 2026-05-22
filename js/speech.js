/**
 * speech.js - 语音识别（浏览器 Web Speech API）
 * 零后端依赖，直接用浏览器内置的语音识别
 */
const Speech = {
  recognition: null,
  _isStarting: false,
  _isStopping: false,
  lastTranscript: '',
  isListening: false,
  onResult: null,

  startListening(onResult) {
    if (this.isListening) {
      console.log('[Speech] already listening, ignored');
      return;
    }
    if (this._isStarting) {
      console.log('[Speech] start in progress, ignored');
      return;
    }

    this.onResult = onResult || null;
    this.lastTranscript = '';
    this.isListening = true;
    this._isStarting = true;

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.log('[Speech] Web Speech API not supported');
        this.isListening = false;
        this._isStarting = false;
        if (this.onResult) this.onResult('');
        return;
      }

      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'en-US';
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;

      this.recognition.onresult = (event) => {
        if (this._isStopping) return;
        const transcript = (event.results[0][0].transcript || '').trim();
        this.lastTranscript = transcript;
        console.log('[Speech] result:', transcript);
        if (this.onResult) this.onResult(transcript);
      };

      this.recognition.onend = () => {
        console.log('[Speech] recognition ended');
        this.isListening = false;
        this._isStarting = false;
        this._isStopping = false;
      };

      this.recognition.onerror = (event) => {
        console.log('[Speech] error:', event.error);
        this.isListening = false;
        this._isStarting = false;
        this._isStopping = false;
        if (event.error === 'no-speech' || event.error === 'aborted') {
          if (this.onResult) this.onResult('');
        }
      };

      this.recognition.start();
      console.log('[Speech] started');
    } catch (e) {
      console.log('[Speech] start error:', e.message);
      this.isListening = false;
      this._isStarting = false;
      if (this.onResult) this.onResult('');
    }
  },

  stopListening() {
    console.log('[Speech] stopListening called');
    this._isStopping = true;
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
    this.isListening = false;
  },

  destroy() {
    this._isStopping = true;
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
    this.isListening = false;
    this._isStarting = false;
  }
};
