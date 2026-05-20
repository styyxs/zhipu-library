/**
 * words.js - 单词数据管理
 */
const WORDS_DATA = {
  orchard: [
    { word: 'apple', zh: '苹果', emoji: '🍎' },
    { word: 'banana', zh: '香蕉', emoji: '🍌' },
    { word: 'orange', zh: '橙子', emoji: '🍊' },
    { word: 'grape', zh: '葡萄', emoji: '🍇' },
    { word: 'strawberry', zh: '草莓', emoji: '🍓' },
    { word: 'pear', zh: '梨', emoji: '🍐' },
    { word: 'peach', zh: '桃子', emoji: '🍑' },
    { word: 'cherry', zh: '樱桃', emoji: '🍒' },
    { word: 'watermelon', zh: '西瓜', emoji: '🍉' },
    { word: 'lemon', zh: '柠檬', emoji: '🍋' }
  ],
  farm: [
    { word: 'cat', zh: '猫', emoji: '🐱' },
    { word: 'dog', zh: '狗', emoji: '🐕' },
    { word: 'rabbit', zh: '兔子', emoji: '🐰' },
    { word: 'cow', zh: '奶牛', emoji: '🐄' },
    { word: 'pig', zh: '猪', emoji: '🐷' },
    { word: 'horse', zh: '马', emoji: '🐴' },
    { word: 'sheep', zh: '绵羊', emoji: '🐑' },
    { word: 'chicken', zh: '鸡', emoji: '🐔' },
    { word: 'duck', zh: '鸭子', emoji: '🦆' },
    { word: 'milk', zh: '牛奶', emoji: '🥛' }
  ],
  forest: [
    { word: 'tree', zh: '树', emoji: '🌳' },
    { word: 'flower', zh: '花', emoji: '🌸' },
    { word: 'leaf', zh: '叶子', emoji: '🍃' },
    { word: 'sun', zh: '太阳', emoji: '☀️' },
    { word: 'moon', zh: '月亮', emoji: '🌙' },
    { word: 'star', zh: '星星', emoji: '⭐' },
    { word: 'bird', zh: '鸟', emoji: '🐦' },
    { word: 'fish', zh: '鱼', emoji: '🐟' },
    { word: 'butterfly', zh: '蝴蝶', emoji: '🦋' },
    { word: 'bee', zh: '蜜蜂', emoji: '🐝' }
  ]
};

function getWords(scene) {
  return WORDS_DATA[scene] || [];
}

function getWordEmoji(word) {
  for (const scene of Object.values(WORDS_DATA)) {
    const found = scene.find(w => w.word === word);
    if (found) return found.emoji;
  }
  return '❓';
}

function getWordZH(word) {
  for (const scene of Object.values(WORDS_DATA)) {
    const found = scene.find(w => w.word === word);
    if (found) return found.zh;
  }
  return '';
}

function updateSceneProgress() {
  const progress = Storage.getProgress();
  ['orchard', 'farm', 'forest'].forEach(scene => {
    const words = getWords(scene);
    const completed = progress[scene]?.completedWords?.length || 0;
    const el = document.getElementById(scene + 'Progress');
    if (el) el.textContent = `${completed}/${words.length}`;
  });
}
