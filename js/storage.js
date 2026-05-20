/**
 * storage.js - 本地存储
 */
const Storage = {
  PREFIX: 'ollie_mimi_',
  
  getProgress() {
    try {
      const data = localStorage.getItem(this.PREFIX + 'progress');
      return data ? JSON.parse(data) : { orchard: {completedWords:[]}, farm: {completedWords:[]}, forest: {completedWords:[]} };
    } catch { return { orchard: {completedWords:[]}, farm: {completedWords:[]}, forest: {completedWords:[]} }; }
  },
  
  saveProgress(progress) {
    try { localStorage.setItem(this.PREFIX + 'progress', JSON.stringify(progress)); } catch {}
  },
  
  markWordComplete(scene, word) {
    const p = this.getProgress();
    if (!p[scene]) p[scene] = { completedWords: [] };
    if (!p[scene].completedWords.includes(word)) p[scene].completedWords.push(word);
    this.saveProgress(p);
  },
  
  getDiary() {
    try { return JSON.parse(localStorage.getItem(this.PREFIX + 'diary') || '[]'); } catch { return []; }
  },
  
  addDiaryEntry(word, scene, imageData) {
    const diary = this.getDiary();
    diary.unshift({ word, scene, imageData, timestamp: Date.now() });
    if (diary.length > 30) diary.pop();
    try { localStorage.setItem(this.PREFIX + 'diary', JSON.stringify(diary)); } catch {}
  }
};
