/**
 * dialog.js - 对话模板引擎
 */
const Dialog = {
  step1: {
    intro: (scene) => `Ollie，我在${scene === 'orchard' ? '果园' : scene === 'farm' ? '农场' : '森林'}里学了一个新单词！`,
    wordDisplay: (word) => `A-P-P-L-E, ${word.toUpperCase()}`,
    encourage: '太棒了！你听到了吗？'
  },
  step2: {
    prompt: '你跟我念一遍好吗？按住这个金色的大按钮说话哦~',
    listening: '正在听...'
  },
  step3: {
    pass: '发音太棒了！🎉',
    fail: '再试一次吧，你可以的！😊'
  },
  step4: {
    question: (word) => `Ollie，这个用中文怎么说呀？`,
    thanks: (zh) => `原来是${zh}呀！Ollie真棒！`
  },
  step5: {
    invite: (word) => `我们来画一个${word}吧！`,
    complete: (word) => `太棒了！${word}画好了！🎨`
  }
};

function showMimiDialogue(id, text, callback) {
  const el = document.getElementById(id);
  if (!el) { callback?.(); return; }
  el.textContent = text;
  callback?.();
}

function showTextImmediate(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function showToast(text) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = text;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}
