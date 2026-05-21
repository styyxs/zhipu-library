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
    if (!SpeechRecognition) {
      console.log('SpeechRecognition not supported in this browser');
      return;
    }
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event) => {
      // 如果已经在停止中（stop已调用），忽略后续onresult
      if (this._isStopping) {
        console.log('[Speech] onresult ignored (_isStopping=true), result count:', event.results.length);
        return;
      }
      const result = event.results[0];
      console.log('[Speech] onresult: isFinal=' + result.isFinal + ', transcript="' + result[0].transcript + '", confidence=' + result[0].confidence);
      const transcript = result[0].transcript.trim();
      this.lastTranscript = transcript;
      if (this.onResult) this.onResult(transcript);
    };

    this.recognition.onerror = (event) => {
      console.log('[Speech] Recognition error:', event.error, '| _isStopping:', this._isStopping);
      this.isListening = false;
      this._isStopping = false;
      this._isStarting = false;
    };

    this.recognition.onstart = () => {
      console.log('[Speech] Recognition started | _isStopping:', this._isStopping);
    };

    this.recognition.onend = () => {
      console.log('[Speech] Recognition ended | lastTranscript:', this.lastTranscript, '| _isStopping:', this._isStopping);
      this.isListening = false;
      this._isStopping = false;
      this._isStarting = false;
    };
  },

  startListening(onResult) {
    if (!this.recognition) this.init();
    if (!this.recognition) return;
    if (this._isStarting) {
      console.log('[Speech] startListening blocked (_isStarting=true)');
      return;
    }
    this._isStarting = true;
    console.log('[Speech] startListening called | isListening:', this.isListening, '| state:', this.recognition?.state, '| _isStopping:', this._isStopping);

    const doStart = () => {
      this._isStarting = false;
      this.onResult = onResult || null;
      this.lastTranscript = '';
      this.isListening = true;
      console.log('[Speech] doStart calling recognition.start() | state before:', this.recognition?.state);
      try {
        this.recognition.start();
      } catch (e) {
        console.log('[Speech] Start error:', e.message, '| state:', this.recognition?.state);
        this.isListening = false;
        this._isStarting = false;
      }
    };

    // 如果上一个识别还在停止中，等它
    if (this._isStopping) {
      const checkAndStart = () => {
        if (!this._isStopping) { doStart(); return; }
        setTimeout(checkAndStart, 50);
      };
      checkAndStart();
      return;
    }

    // 如果识别还在运行，先停止再启动
    if (this.isListening || this.recognition.state === 'running') {
      this._isStopping = true;
      const prevOnEnd = this.recognition.onend;
      this.recognition.onend = () => {
        if (prevOnEnd) prevOnEnd.call(this.recognition);
        this._isStopping = false;
        doStart();
      };
      try { this.recognition.stop(); } catch {}
    } else {
      doStart();
    }
  },

  stopListening() {
    console.log('[Speech] stopListening called | isListening:', this.isListening, '| state:', this.recognition?.state, '| _isStopping:', this._isStopping);
    this._isStopping = true;
    this._isStarting = false;
    if (this.recognition && this.isListening) {
      try { this.recognition.stop(); } catch (e) { console.log('[Speech] stop() error:', e.message); }
    }
    this.isListening = false;
  }
};
