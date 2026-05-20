/**
 * storage.js - LocalStorage探险日记
 */
const Storage = {
  KEY_PREFIX: 'ollie_',

  getProgress() {
    try {
      const data = localStorage.getItem(this.KEY_PREFIX + 'progress');
      return data ? JSON.parse(data) : {};
    } catch { return {}; }
  },

  saveProgress(progress) {
    try {
      localStorage.setItem(this.KEY_PREFIX + 'progress', JSON.stringify(progress));
    } catch {}
  },

  markWordComplete(scene, word) {
    const progress = this.getProgress();
    if (!progress[scene]) progress[scene] = { completedWords: [], unlockedScenes: ['orchard'] };
    if (!progress[scene].completedWords.includes(word)) {
      progress[scene].completedWords.push(word);
    }
    this.saveProgress(progress);
  },

  getDiary() {
    try {
      const data = localStorage.getItem(this.KEY_PREFIX + 'diary');
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  addDiaryEntry(word, scene, imageData) {
    const diary = this.getDiary();
    // 避免重复添加
    if (!diary.find(e => e.word === word && e.scene === scene)) {
      diary.push({ word, scene, imageData, timestamp: Date.now() });
      try {
        localStorage.setItem(this.KEY_PREFIX + 'diary', JSON.stringify(diary));
      } catch {}
    }
  },

  clearAll() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
};
