/**
 * app.js - 主应用逻辑
 * 5步学习闭环
 */
const App = {
  currentScene: null,
  currentWord: null,
  currentWordIndex: 0,
  currentStep: 0,
  isProcessing: false,
  ollieSpeech: '',
  
  init() {
    updateSceneProgress();
    Canvas.init();
    Canvas.attachEvents();
    Speech.checkPermission();
  },
  
  selectScene(scene) {
    this.currentScene = scene;
    const progress = Storage.getProgress();
    this.currentWordIndex = progress[scene]?.completedWords?.length || 0;
    const words = getWords(scene);
    if (this.currentWordIndex >= words.length) {
      showToast('这个场景学完啦！换个场景试试~');
      return;
    }
    this.startWord();
  },
  
  startWord() {
    const words = getWords(this.currentScene);
    if (this.currentWordIndex >= words.length) {
      this.showSceneComplete(); return;
    }
    this.currentWord = words[this.currentWordIndex];
    this.goToStep(1);
  },
  
  goToStep(step) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(`step${step}Page`);
    if (page) page.classList.add('active');
    this.currentStep = step;
    switch(step) {
      case 1: this.runStep1(); break;
      case 2: this.runStep2(); break;
      case 3: this.runStep3(); break;
      case 4: this.runStep4(); break;
      case 5: this.runStep5(); break;
    }
  },
  
  // Step1: Mimi呈现单词
  async runStep1() {
    const word = this.currentWord;
    const sceneName = this.currentScene === 'orchard' ? '果园' : this.currentScene === 'farm' ? '农场' : '森林';
    
    showTextImmediate('step1Dialogue', `Ollie，我在${sceneName}里学了一个新单词！`);
    await this.delay(1000);

    const spelling = word.word.toUpperCase().split('').join('-');
    try {
      await TTS.speak(`${spelling}, ${word.word}`, { callback: () => this.showStep1Word(word) });
    } catch (e) {
      console.log('TTS failed, continue anyway:', e);
      this.showStep1Word(word);
    }
  },
  
  async showStep1Word(word) {
    // 显示字母动画
    const lettersEl = document.getElementById('wordLetters');
    lettersEl.innerHTML = '';
    word.word.toUpperCase().split('').forEach((l, i) => {
      const span = document.createElement('span');
      span.className = 'letter';
      span.textContent = l;
      span.style.animationDelay = `${i * 0.15}s`;
      lettersEl.appendChild(span);
    });
    
    document.getElementById('wordImage').textContent = word.emoji;
    await this.delay(1500);
    showTextImmediate('step1Dialogue', '太棒了！你听到了吗？');
    await TTS.speak('太棒了！你听到了吗？', { callback: () => this.delay(1000).then(() => this.goToStep(2)) }).catch(() => this.delay(2000).then(() => this.goToStep(2)));
  },
  
  // Step2: Ollie跟读
  async runStep2() {
    showTextImmediate('step2Dialogue', '你跟我念一遍好吗？按住按钮说话哦~');
    try { await TTS.speak('你跟我念一遍好吗？按住按钮说话哦~'); } catch {}
    
    const recordBtn = document.getElementById('recordBtn');
    recordBtn.classList.add('waiting');
    this.bindRecordEvents(recordBtn, () => {
      App.ollieSpeech = Speech.lastTranscript || '';
      this.goToStep(3);
    });
  },
  
  bindRecordEvents(btn, onStop) {
    this.unbindRecordEvents();
    
    const start = async (e) => {
      e.preventDefault();
      if (this.isProcessing) return;
      this.isProcessing = true;
      btn.classList.remove('waiting');
      btn.classList.add('recording');
      showTextImmediate('step2Dialogue', '正在听...');
      Speech.startListening((t) => { Speech.lastTranscript = t; });
    };
    
    const stop = async (e) => {
      e.preventDefault();
      if (!this.isProcessing) return;
      Speech.stopListening();
      btn.classList.remove('recording');
      this.isProcessing = false;
      await this.delay(500);
      onStop();
    };
    
    btn.addEventListener('touchstart', start, { passive: false });
    btn.addEventListener('touchend', stop, { passive: false });
    btn.addEventListener('mousedown', start);
    btn.addEventListener('mouseup', stop);
    this._handlers = { start, stop };
  },
  
  unbindRecordEvents() {
    const btn = document.getElementById('recordBtn');
    if (this._handlers) {
      btn?.removeEventListener('touchstart', this._handlers.start);
      btn?.removeEventListener('touchend', this._handlers.stop);
      btn?.removeEventListener('mousedown', this._handlers.start);
      btn?.removeEventListener('mouseup', this._handlers.stop);
    }
  },
  
  // Step3: 评分
  async runStep3() {
    const recognized = (Speech.lastTranscript || '').toLowerCase();
    const target = this.currentWord.word.toLowerCase();
    const score = this.similarity(recognized, target);
    
    const content = document.getElementById('step3Content');
    
    if (score >= 0.5) {
      // 通过
      content.innerHTML = '<div class="mimi-character">🐱</div><div class="success-text">太棒了！</div>';
      for (let i = 0; i < 20; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        star.textContent = '⭐';
        star.style.cssText = `left:150px;top:150px;--tx:${(Math.random()-0.5)*300}px;--ty:${(Math.random()-0.5)*300}px;animation-delay:${Math.random()*0.5}s;position:absolute;font-size:24px;`;
        content.appendChild(star);
      }
      await TTS.speak('发音太棒了！').catch(() => {});
      await this.delay(1500);
      this.goToStep(4);
    } else {
      // 失败，循环Step2
      content.innerHTML = '<div class="mimi-character">🐱</div><div class="mimi-dialogue" style="margin-top:20px;">再试一次吧，你可以的！</div>';
      await TTS.speak('再试一次吧，你可以的！').catch(() => {});
      await this.delay(1500);
      this.goToStep(2);
    }
  },
  
  similarity(s1, s2) {
    if (!s1 || !s2) return 0;
    if (s1 === s2) return 1;
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    if (longer.length === 0) return 1;
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastVal = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) { costs[j] = j; }
        else if (j > 0) {
          let newVal = costs[j - 1];
          if (s1.charAt(i-1) !== s2.charAt(j-1)) newVal = Math.min(Math.min(newVal, lastVal), costs[j]) + 1;
          costs[j - 1] = lastVal;
          lastVal = newVal;
        }
      }
      costs[s2.length] = lastVal;
    }
    return (longer.length - costs[s2.length]) / longer.length;
  },
  
  // Step4: Ollie教Mimi
  async runStep4() {
    showTextImmediate('step4Dialogue', 'Ollie，这个用中文怎么说呀？');
    await TTS.speak('Ollie，这个用中文怎么说呀？').catch(() => {});
    
    const btn = document.getElementById('step4RecordBtn');
    btn.classList.add('waiting');
    this.bindRecordEvents(btn, async () => {
      const zh = getWordZH(this.currentWord.word);
      showTextImmediate('step4Dialogue', `原来是${zh}呀！Ollie真棒！`);
      await TTS.speak(`原来是${zh}呀！Ollie真棒！`).catch(() => {});
      await this.delay(1000);
      this.goToStep(5);
    });
  },
  
  // Step5: 画画
  async runStep5() {
    const word = this.currentWord;
    showToast(`我们来画一个${word.word}吧！`);
    await TTS.speak(`我们来画一个${word.word}吧！`).catch(() => {});
    
    Canvas.init();
    Canvas.clear();
    Canvas.drawOutline(word.word);
  },
  
  async finishDrawing() {
    const word = this.currentWord;
    const scene = this.currentScene;
    
    showToast('正在生成图片...');
    const imageData = await Canvas.generateAIImage(word.word, scene);
    Storage.addDiaryEntry(word.word, scene, imageData);
    Storage.markWordComplete(scene, word.word);
    
    showToast(`太棒了！${word.word}画好了！🎨`);
    await TTS.speak(`太棒了！${word.word}画好了！`).catch(() => {});
    
    updateSceneProgress();
    this.currentWordIndex++;
    
    await this.delay(2000);
    this.startWord();
  },
  
  showSceneComplete() {
    showToast('🎉 这个场景学完啦！');
    this.goHome();
  },
  
  goHome() {
    this.currentScene = null;
    this.currentWord = null;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('homePage').classList.add('active');
    updateSceneProgress();
  },
  
  goBack() {
    if (this.currentStep > 1) this.goToStep(this.currentStep - 1);
    else this.goHome();
  },
  
  openDiary() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('diaryPage').classList.add('active');
    const grid = document.getElementById('diaryGrid');
    const diary = Storage.getDiary();
    if (diary.length === 0) {
      grid.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">还没有探险日记，快去学习吧！</div>';
      return;
    }
    grid.innerHTML = diary.map(e => `<div class="diary-item completed"><span class="diary-word">${e.word}</span><span class="diary-image">${getWordEmoji(e.word)}</span></div>`).join('');
  },
  
  delay(ms) { return new Promise(r => setTimeout(r, ms)); }
};

// 全局暴露
document.addEventListener('DOMContentLoaded', () => App.init());
window.App = App;
window.goBack = () => App.goBack();
window.openDiary = () => App.openDiary();
window.selectScene = s => App.selectScene(s);
window.finishDrawing = () => App.finishDrawing();
window.clearCanvas = () => { Canvas.clear(); Canvas.drawOutline(App.currentWord?.word); };
window.replayWord = async () => {
  const w = App.currentWord;
  if (w) await TTS.speak(`${w.word.toUpperCase().split('').join('-')}, ${w.word}`).catch(() => {});
};
