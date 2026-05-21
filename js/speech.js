/**
 * speech.js - 语音识别（MiniMax ASR）
 * 麦克风录音 → Worker /api/asr → MiniMax ASR → 文字
 */
const Speech = {
  mediaRecorder: null,
  audioChunks: [],
  lastTranscript: '',
  isListening: false,
  onResult: null,

  // 初始化麦克风录音
  initRecorder() {
    return navigator.mediaDevices.getUserMedia({ audio: true });
  },

  // 录音并通过 Worker ASR 识别
  async startListening(onResult) {
    if (this.isListening) {
      console.log('[Speech] already listening, ignored');
      return;
    }
    this.onResult = onResult || null;
    this.lastTranscript = '';
    this.audioChunks = [];
    this.isListening = true;
    console.log('[Speech] startListening: requesting mic...');

    try {
      const stream = await this.initRecorder();

      // 尝试设置 MediaRecorder，优先用 webm/opus（兼容性最广）
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/webm';

      this.mediaRecorder = new MediaRecorder(stream, { mimeType });
      console.log('[Speech] MediaRecorder mimeType:', mimeType);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log('[Speech] chunk received, size:', event.data.size);
        }
      };

      this.mediaRecorder.onstop = async () => {
        console.log('[Speech] MediaRecorder stopped, chunks:', this.audioChunks.length);
        stream.getTracks().forEach(t => t.stop());
        this.isListening = false;

        if (this.audioChunks.length === 0) {
          console.log('[Speech] no audio recorded');
          if (this.onResult) this.onResult('');
          return;
        }

        // 发送录音到 Worker ASR
        const blob = new Blob(this.audioChunks, { type: mimeType });
        console.log('[Speech] sending audio to ASR, blob size:', blob.size);
        try {
          const formData = new FormData();
          formData.append('file', blob, 'recording.' + (mimeType.includes('mp4') ? 'mp4' : 'webm'));
          formData.append('model', 'speech-02-hd');
          formData.append('language', 'en');

          const resp = await fetch('/api/asr', { method: 'POST', body: formData });
          const data = await resp.json();
          const transcript = (data.text || '').trim();
          this.lastTranscript = transcript;
          console.log('[Speech] ASR result:', JSON.stringify(transcript));
          if (this.onResult) this.onResult(transcript);
        } catch (e) {
          console.log('[Speech] ASR error:', e.message);
          if (this.onResult) this.onResult('');
        }
      };

      this.mediaRecorder.start();
      console.log('[Speech] MediaRecorder started');
    } catch (e) {
      console.log('[Speech] mic error:', e.message);
      this.isListening = false;
      if (this.onResult) this.onResult('');
    }
  },

  stopListening() {
    console.log('[Speech] stopListening called, state:', this.mediaRecorder?.state);
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    } else {
      this.isListening = false;
    }
  },

  // 清理
  destroy() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.state === 'recording' && this.mediaRecorder.stop();
    }
    this.isListening = false;
    this.audioChunks = [];
  }
};
