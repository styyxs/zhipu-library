/**
 * speech.js - 语音识别（浏览器 Web Speech API）
 * 零后端依赖，点一下开始，自动识别，自动停止
 */
const Speech = {
  recognition: null,
  lastTranscript: '',
  isListening: false,
  _autoStopCallback: null,

  startListening(onResult, onEnd) {
    if (this.isListening) {
      console.log('[Speech] already listening, ignored');
      return;
    }

    this.lastTranscript = '';
    this.isListening = true;
    this._autoStopCallback = onEnd || null;

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.log('[Speech] Web Speech API not supported');
        this.isListening = false;
        if (this._autoStopCallback) this._autoStopCallback('');
        return;
      }

      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'en-US';
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;

      this.recognition.onresult = (event) => {
        const transcript = (event.results[0][0].transcript || '').trim();
        this.lastTranscript = transcript;
        console.log('[Speech] result:', transcript);
        if (onResult) onResult(transcript);
      };

      this.recognition.onend = () => {
        console.log('[Speech] recognition ended');
        this.isListening = false;
        if (this._autoStopCallback) {
          this._autoStopCallback(this.lastTranscript);
          this._autoStopCallback = null;
        }
      };

      this.recognition.onerror = (event) => {
        console.log('[Speech] error:', event.error);
        this.isListening = false;
        if (event.error === 'no-speech' || event.error === 'aborted') {
          if (this._autoStopCallback) {
            this._autoStopCallback('');
            this._autoStopCallback = null;
          }
        }
      };

      this.recognition.start();
      console.log('[Speech] started');
    } catch (e) {
      console.log('[Speech] start error:', e.message);
      this.isListening = false;
      if (this._autoStopCallback) {
        this._autoStopCallback('');
        this._autoStopCallback = null;
      }
    }
  },

  stopListening() {
    console.log('[Speech] stopListening called (no-op for Web Speech API)');
    // Web Speech API auto-stops, manual stop not needed
  },

  destroy() {
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
    this.isListening = false;
  }
};
