/**
 * speech.js - 语音识别
 */
const Speech = {
  isSupported: false,
  isListening: false,
  recognition: null,
  
  init() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    
    this.recognition = new SR();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    
    this.recognition.onresult = (e) => {
      const result = e.results[e.results.length - 1];
      if (result.isFinal && this.onResult) {
        this.onResult(result[0].transcript, result[0].confidence);
      }
    };
    
    this.recognition.onerror = (e) => { this.isListening = false; };
    this.recognition.onend = () => { this.isListening = false; };
    this.isSupported = true;
  },
  
  startListening(onResult) {
    if (!this.isSupported) return false;
    if (this.isListening) this.stopListening();
    this.onResult = onResult;
    this.recognition.start();
    this.isListening = true;
    return true;
  },
  
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  },
  
  getVolumeLevel() { return Math.random() * 0.5 + 0.3; }
};

Speech.init();

Speech.checkPermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(t => t.stop());
    return true;
  } catch { return false; }
};
