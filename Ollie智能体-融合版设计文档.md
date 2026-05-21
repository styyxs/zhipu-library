# Ollie智能体 · 融合版设计文档

> 项目：Ollie和Mimi一起学英语 · 网页版
> 托管域名：ollie.zhipu-library.top
> 版本：v1.0（融合版）
> 来源：MiniMax版本 + DeepSeek V4版本精华整合
> 最后更新：2026-05-20

---

## 一、项目概述

### 1.1 产品愿景

打造一个以"陪伴式教学"为核心理念的英语启蒙产品。通过Ollie（5岁半男孩）与粉色小猫Mimi的探险故事，将英语学习融入角色扮演和互动游戏中。产品旨在让Ollie在"教"与"学"的双重身份中获得成就感，从而激发内在的学习动力，让Mimi成为他成长路上的第一个"学生"和"伙伴"。

> **核心设计原则：关系重构比功能堆叠更重要**
> Ollie和Mimi是探险伙伴，不是师生关系。
> Ollie是被请教的"小前辈"，有成就感；Mimi是真实的探险伙伴，不是任务对象。

### 1.2 目标用户

- **核心用户：** Ollie，5岁半，学龄前儿童
- **使用设备：** iPad，浏览器访问（网页形式，自开发）
- **次要用户：** 家长（森哥），负责验收和支持

### 1.3 三个核心目的

| 目的 | 落地方式 |
|------|---------|
| Ollie学英语 | 探险故事里嵌单词，Mimi问"这个用英语怎么说" |
| 体验"教别人"的成长感 | Mimi主动求助Ollie"Ollie老师这个词是什么？" |
| Mimi成为长期成长伙伴 | Mimi有成长线：学会单词→解锁新场景→换新形象 |

### 1.4 核心功能三角

1. **语音对话：** 与Mimi进行有主题的、引导式的对话
2. **画画涂色：** 通过视觉和动手操作巩固记忆
3. **英语启蒙：** 以自然拼读和场景词汇为核心的英语输入

### 1.5 关系设定

- **Ollie（主角/小前辈）：** 聪明、有好奇心、喜欢表现自己。他是Mimi的"老师"和探险队长。
- **Mimi（伙伴/学生）：** 一只粉色、活泼、偶尔会犯小迷糊的卡通小猫。她是Ollie的忠实追随者和提问者，负责引出知识点，给Ollie创造"教"的机会。

---

## 二、5步学习闭环（核心交互流程）

> 这是整个产品的核心交互逻辑，所有功能围绕此闭环设计。**必须严格按顺序执行，不能跳过任何一个Step。**

### Step 1：Mimi呈现单词（听力输入）

**触发条件：** 进入一个新的单词学习单元

**交互流程：**
1. Mimi出现在屏幕中央，做出好奇的表情
2. **Mimi语音 (TTS)：** "Ollie，我今天在果园里学了一个新单词，你听听看！"
3. **Mimi语音 (TTS) - 第一遍：** "A-P-P-L-E, apple"（字母拼读 + 单词朗读，语速慢）
4. **等待1秒**（屏幕显示字母A-P-P-L-E依次出现，然后组合成apple）
5. **Mimi语音 (TTS) - 第二遍：** "A-P-P-L-E, apple"
6. **等待1秒**（单词`apple`下方出现一个卡通苹果的图标）
7. **Mimi语音 (TTS) - 第三遍：** "A-P-P-L-E, apple"
8. **动画反馈：** 卡通苹果图标跳动一下，Mimi开心地鼓掌

**UI变化：**
- 屏幕中央Mimi形象从左侧入场
- 对话框从右侧滑入，带打字机效果显示文字
- 字母逐个跳出动画，1秒后组合成完整单词
- 底部出现"🔊 再听一遍"小按钮

**动画反馈：**
- 字母A-P-P-L-E逐个以弹跳方式出现（每个字母200ms，间隔100ms）
- 字母组合成apple时整体放大再缩小（scale 1.2→1.0，300ms）
- 第三遍结束后苹果图标弹跳（translateY -10px→0，200ms）
- Mimi做鼓掌动作（2帧循环）

**技术实现：** MiniMax TTS，文本带SSML标签控制语速和停顿。前端动画配合语音节奏。

---

### Step 2：Ollie跟读练习（语音输出）

**触发条件：** Step 1第三遍播放完毕，自动过渡

**交互流程：**
1. **UI变化：** 屏幕中央出现一个巨大的圆形按钮（直径120px）
2. 按钮背景色为金色（`#FFD700`），带有呼吸灯闪烁动画（pulse动画，1.5s循环）
3. **Mimi语音 (TTS)：** "Ollie，轮到你了！按住按钮，像我刚才那样读一遍吧！"
4. **Ollie操作：** 按下并按住按钮，对着iPad麦克风跟读"A-P-P-L-E, apple"
5. **实时反馈：** 按钮在录音时变为粉红色（`#FFB6C1`），并显示音量波动动画（音量条6格，从左到右逐格亮起）
6. **松开按钮：** 录音停止，音频数据被发送到语音评测API

**UI变化：**
- 录音按钮入场动画：从中心放大弹出（scale 0→1，300ms ease-out）
- 按钮背景色变为录音中状态：`#FFB6C1`
- 按钮中心显示麦克风图标 + "正在听..."文字
- 按钮外围显示6格音量指示条

**动画反馈：**
- 等待录音时：按钮持续呼吸灯动画（opacity 0.6↔1.0，1.5s）
- 录音中：音量条从左到右逐格亮起（每格100ms），根据实际音量动态调整
- 松开瞬间：按钮轻微缩小再弹回（scale 0.95→1.0，150ms）

---

### Step 3：AI评测发音（鼓励式反馈）

**触发条件：** Step 2松开按钮，录音结束

**交互流程：**
1. **后台处理：** 语音评测API分析音频
2. **判定逻辑：**

**【通过分支】(Score >= 50%)**
- **Mimi语音 (TTS)：** "天哪！Ollie你读得也太标准了吧！比Mimi读得还好！你真厉害！"
- **动画反馈：** 全屏星星爆炸庆祝动画（20颗星星从中心向外扩散）+ Mimi做胜利手势
- **自动过渡：** 1.5秒后进入Step 4

**【不通过分支】(Score < 50%)**
- **Mimi语音 (TTS)：** "嗯...Ollie，好像有一点点不一样哦，我们再听一遍，然后一起试试好不好？加油！"
- **动画反馈：** 屏幕不显示任何负面信息，按钮恢复为金色呼吸灯状态
- **循环：** 自动回到Step 2，Ollie可以无限次重试
- **严禁出现：** "错误"、"不对"、"很差"等负面词汇

---

### Step 4：Ollie教Mimi（知识内化）

**触发条件：** Step 3通过后，自动过渡

**交互流程：**
1. **UI变化：** Mimi移动到屏幕左侧，做出"举手提问"的姿态。屏幕右侧出现一个对话框，指向Ollie
2. **Mimi语音 (TTS)：** "Ollie老师，你读得真棒！可是...apple到底是什么意思呀？我有点笨，你能教教我吗？"
3. **Ollie操作：** 按住麦克风按钮，用中文解释。例如："apple就是苹果，红红的，甜甜的。"
4. **正向反馈：** Mimi语音 (TTS)： "哦！原来是苹果呀！谢谢Ollie老师，你讲得真清楚，我记住啦！"
5. **动画反馈：** Mimi做出恍然大悟的表情（表情变化动画），并给Ollie比个心（心形从Mimi位置飘向Ollie）

---

### Step 5：比着画+涂色（多感官巩固）

**触发条件：** Step 4完成后，自动过渡

**交互流程：**
1. **UI变化：** 屏幕切换至画布模式。画布中央显示一个由灰色细线构成的"苹果"轮廓（`#D3D3D3`）
2. **Mimi语音 (TTS)：** "Ollie老师，我们把apple画下来吧！这样我以后看到画就能想起来啦！"
3. **Ollie操作：**
   - **描线：** Ollie用手指在屏幕上沿着灰色轮廓描线，描过的线会变成深棕色（`#5D4E37`）
   - **涂色：** 描完后，屏幕下方出现6色调色板。Ollie选择颜色，在苹果轮廓内涂色
4. **完成与AI生成：**
   - Ollie点击"完成"按钮
   - **AI图像生成：** 系统将Ollie的涂鸦作为输入，调用AI绘图API，生成一张"完成图"
   - **最终展示：** 屏幕展示AI生成的完成图。Mimi语音 (TTS)： "哇！这是我们一起画的apple！太漂亮了！"
5. **存入探险日记：** 系统将AI生成的图片自动存入浏览器的`LocalStorage`，并记录下当前学习的单词`apple`

---

## 三、单词体系（首批30个，分3个场景）

### 3.1 JSON配置结构

```json
{
  "scenes": [
    {
      "id": "orchard",
      "name": "果园探险",
      "color": "#FF6B35",
      "icon": "🍎",
      "words": [
        { "word": "apple", "zh": "苹果", "hint": "红红的，甜甜的" },
        { "word": "banana", "zh": "香蕉", "hint": "黄色的，长长的" },
        { "word": "orange", "zh": "橙子", "hint": "橙色的，圆圆的" },
        { "word": "grape", "zh": "葡萄", "hint": "紫色的，一串串" },
        { "word": "strawberry", "zh": "草莓", "hint": "红色的，小小的" },
        { "word": "pear", "zh": "梨", "hint": "黄色的，上面细下面圆" },
        { "word": "peach", "zh": "桃子", "hint": "粉色或黄色，软软的" },
        { "word": "cherry", "zh": "樱桃", "hint": "小小的，红红的，有梗" },
        { "word": "watermelon", "zh": "西瓜", "hint": "大大的，绿皮红瓤" },
        { "word": "lemon", "zh": "柠檬", "hint": "黄色的，酸酸的" }
      ]
    },
    {
      "id": "farm",
      "name": "农场探险",
      "color": "#8B4513",
      "icon": "🐔",
      "words": [
        { "word": "cat", "zh": "猫", "hint": "会抓老鼠，喵喵叫" },
        { "word": "dog", "zh": "狗", "hint": "是人类的好朋友，汪汪叫" },
        { "word": "rabbit", "zh": "兔子", "hint": "长耳朵，蹦蹦跳跳" },
        { "word": "cow", "zh": "奶牛", "hint": "会产牛奶，有黑白花" },
        { "word": "pig", "zh": "猪", "hint": "圆滚滚的，爱睡懒觉" },
        { "word": "horse", "zh": "马", "hint": "跑得很快，可以骑" },
        { "word": "sheep", "zh": "绵羊", "hint": "身上毛茸茸的，白白的" },
        { "word": "chicken", "zh": "鸡", "hint": "会下蛋，公鸡会打鸣" },
        { "word": "duck", "zh": "鸭子", "hint": "会在水里游泳" },
        { "word": "milk", "zh": "牛奶", "hint": "白白的身体很有营养" }
      ]
    },
    {
      "id": "forest",
      "name": "森林探险",
      "color": "#228B22",
      "icon": "🌲",
      "words": [
        { "word": "tree", "zh": "树", "hint": "高高大大，有树叶" },
        { "word": "flower", "zh": "花", "hint": "五颜六色，很漂亮" },
        { "word": "leaf", "zh": "叶子", "hint": "绿色的，薄薄的" },
        { "word": "sun", "zh": "太阳", "hint": "白天出来，暖暖的" },
        { "word": "moon", "zh": "月亮", "hint": "晚上出来，弯弯的或圆圆的" },
        { "word": "star", "zh": "星星", "hint": "晚上闪闪亮在天上" },
        { "word": "bird", "zh": "小鸟", "hint": "有翅膀，会飞会唱歌" },
        { "word": "fish", "zh": "鱼", "hint": "在水里游，会吐泡泡" },
        { "word": "butterfly", "zh": "蝴蝶", "hint": "有翅膀，五颜六色" },
        { "word": "bee", "zh": "蜜蜂", "hint": "会采蜜，会嗡嗡叫" }
      ]
    }
  ]
}
```

### 3.2 学习路径规则

- 每个场景内的单词学习顺序固定
- Ollie可以自由选择先探索哪个场景
- 每个单词的学习必须完整走完5步闭环
- 完成一个场景的全部10词后，解锁下一个场景

---

## 四、TTS方案（语音合成）

### 4.1 主力方案：MiniMax TTS

- **服务：** MiniMax Speech API（mmx speech）
- **配额：** 每天4000字符（约40-80次对话）
- **触发方式：** 通过mmx CLI调用 `mmx speech generate`
- **配置：**
  - **语音ID：** 选择活泼可爱的童声
  - **语速：** 设置为正常语速的90%（更慢更清晰）
  - **SSML支持：** 使用`<break time="1s"/>`标签控制单词朗读的间隔

### 4.2 SSML标签使用说明

**Step 1的TTS文本格式（带SSML标签）：**

```xml
<speak>
  Ollie，我今天在果园里学了一个新单词，你听听看！
  <break time="0.5s"/>
  A-P-P-L-E,
  <break time="0.5s"/>
  apple
  <break time="1s"/>
  A-P-P-L-E,
  <break time="0.5s"/>
  apple
  <break time="1s"/>
  A-P-P-L-E,
  <break time="0.5s"/>
  apple
</speak>
```

### 4.3 备用方案：Web Speech API（自动降级）

- **技术：** `window.speechSynthesis`
- **特点：** 无需任何配置，浏览器自带，但语音质量和自然度远不如MiniMax
- **触发条件：** MiniMax API调用失败或达到每日配额
- **降级策略：** 用户无感知，自动切换

### 4.4 降级代码示例

```javascript
async function speak(text) {
  try {
    await minimaxTTS(text);
  } catch (e) {
    // 自动降级到Web Speech API
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // 稍慢语速
    speechSynthesis.speak(utterance);
  }
}
```

---

## 五、画画功能

### 5.1 核心功能

- **比着画：** 提供预设的、由贝塞尔曲线构成的单词轮廓。Ollie用手指触摸描摹。
- **涂色：** 提供6种基础颜色的画笔和"油漆桶"填充工具。
- **完成图AI生成：** 将Ollie的涂鸦（Canvas数据）发送到AI绘图API，生成一张包含Mimi和场景的精美图片。
- **探险日记存储：** 所有绘画数据仅保存在本地`LocalStorage`，**绝不**上传到任何云端服务器（除AI绘图API调用外）。

### 5.2 调色板（6色）

| 颜色 | 色值 | 预览 |
|------|------|------|
| 红色 | `#FF0000` | 🔴 |
| 橙色 | `#FFA500` | 🟠 |
| 黄色 | `#FFFF00` | 🟡 |
| 绿色 | `#008000` | 🟢 |
| 蓝色 | `#0000FF` | 🔵 |
| 紫色 | `#800080` | 🟣 |

### 5.3 轮廓线条配置（SVG路径）

```json
{
  "outlines": {
    "apple": "M 150 100 C 150 80, 180 50, 200 80 C 220 100, 220 140, 200 180 C 180 210, 120 210, 100 180 C 80 150, 100 120, 120 100 C 130 90, 140 100, 150 100 Z",
    "banana": "M 80 150 Q 100 50, 180 80 Q 220 100, 200 180 Q 150 200, 80 150 Z",
    "cat": "M 100 200 L 100 120 L 60 80 L 100 100 L 120 50 L 140 100 L 160 80 L 140 120 L 140 200 Z"
  }
}
```

### 5.4 AI绘图Prompt模板

**Prompt生成模板：**
```
A cute cartoon illustration of a [word]. A small pink cat named Mimi is [action] in a [scene] setting, child-friendly style, vibrant colors, soft edges, Studio Ghibli inspired
```

**示例（apple + 果园）：**
```
A cute cartoon illustration of a red apple. A small pink cat named Mimi is holding the apple and smiling in an orchard setting, child-friendly style, vibrant colors, soft edges, Studio Ghibli inspired
```

### 5.5 路径跟随算法

```javascript
// 检测手指触摸点是否在预设轮廓的5px范围内
function isNearPath(touchX, touchY, pathPoints, threshold = 5) {
  for (let point of pathPoints) {
    const distance = Math.sqrt(
      Math.pow(touchX - point.x, 2) + Math.pow(touchY - point.y, 2)
    );
    if (distance <= threshold) return true;
  }
  return false;
}

// 油漆桶填充算法（泛洪填充）
function floodFill(x, y, fillColor) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const targetColor = getPixelColor(x, y);
  if (colorsMatch(targetColor, fillColor)) return;
  
  const stack = [[x, y]];
  const visited = new Set();
  
  while (stack.length > 0) {
    const [px, py] = stack.pop();
    const key = `${px},${py}`;
    if (visited.has(key)) continue;
    visited.add(key);
    const currentColor = getPixelColor(px, py);
    if (!colorsMatch(currentColor, targetColor)) continue;
    setPixelColor(px, py, fillColor);
    stack.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
  }
}
```

---

## 六、UI设计规范（儿童友好）

### 6.1 设计原则

| 原则 | 说明 |
|------|------|
| 超大触摸目标 | 最小80px，核心按钮120px以上 |
| 层级极简 | 最多2层（首页→场景），不超过3次点击 |
| 颜色鲜明不刺眼 | 莫兰迪色系+高饱和点缀 |
| 图>文 | 尽量用图标，文字最少化 |
| 即时反馈 | 每个操作都有动画/音效 |

### 6.2 色彩系统

| 用途 | 颜色名称 | 色值 | 说明 |
|------|------|------|------|
| 主色 | 粉色 | `#FFB6C1` | Mimi主题色、主要按钮背景、导航栏 |
| 辅助色 | 天蓝 | `#87CEEB` | 次要按钮、卡片边框、背景装饰 |
| 强调色 | 金色 | `#FFD700` | 核心交互按钮（录音）、奖励动画 |
| 背景色 | 暖白 | `#FFF8E7` | 主页面背景，柔和护眼 |
| 文字色 | 深棕 | `#5D4E37` | 所有文字颜色，柔和不刺眼 |
| 成功色 | 鼓励绿 | `#90EE90` | 通过提示、成功状态 |
| 描线色 | 浅灰 | `#D3D3D3` | Step 5中待描摹的轮廓线 |
| 完成色 | 深棕 | `#5D4E37` | Step 5中已描好的轮廓线 |
| 卡片背景 | 白色 | `#FFFFFF` | 场景卡片背景 |

**场景专属色：**

| 场景 | 色值 | 主色调 |
|------|------|------|
| 果园探险 | `#FF6B35` | 橙色系 |
| 农场探险 | `#8B4513` | 棕色系 |
| 森林探险 | `#228B22` | 绿色系 |

### 6.3 圆角系统

| 元素 | 圆角值 |
|------|------|
| 大卡片/弹窗 | 24px |
| 主按钮 | 16px |
| 头像/图标 | 50%（完全圆） |
| 输入框 | 12px |
| 对话框 | 20px，左侧三角 |

### 6.4 字体规范

| 用途 | 字号 | 字重 | 颜色 | 字体 |
|------|------|------|------|------|
| 标题 | 24-32px | 加粗 | `#5D4E37` | 圆体 |
| 正文 | 18-20px | 常规 | `#5D4E37` | 圆体 |
| 按钮 | 20px | 加粗 | 白色或`#FFB6C1` | 圆体 |
| 单词展示 | 28px | 加粗 | `#FFB6C1` | 圆体 |
| 对话文字 | 20px | 常规 | `#5D4E37` | 圆体 |

### 6.5 CSS按钮规范

```css
/* 主按钮 */
.primary-btn {
  height: 120px;
  min-width: 200px;
  border-radius: 16px;
  background: #FFB6C1;
  color: white;
  font-size: 20px;
  font-weight: bold;
  font-family: 'PingFang SC', 'Noto Sans SC', 'Arial Rounded MT Bold', sans-serif;
  box-shadow: 0 4px 12px rgba(255, 182, 193, 0.4);
  border: none;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.primary-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2px 6px rgba(255, 182, 193, 0.4);
}

/* 录音按钮（最大，圆形） */
.record-btn {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #FFD700;
  color: white;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
  border: none;
  cursor: pointer;
}

/* 呼吸灯动画 */
.record-btn.waiting {
  animation: pulse 1.5s infinite;
}

/* 脉冲动画 */
@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4); }
  50% { opacity: 0.6; box-shadow: 0 2px 6px rgba(255, 215, 0, 0.2); }
}

/* 次按钮 */
.secondary-btn {
  height: 80px;
  min-width: 160px;
  border-radius: 16px;
  background: white;
  color: #FFB6C1;
  border: 3px solid #FFB6C1;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}

/* 场景卡片 */
.scene-card {
  width: 100%;
  height: 160px;
  border-radius: 24px;
  background: white;
  border: 3px solid #FFB6C1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 182, 193, 0.2);
}

/* 对话框 */
.dialogue-box {
  background: white;
  border-radius: 20px;
  padding: 16px 20px;
  font-size: 20px;
  color: #5D4E37;
  position: relative;
  max-width: 80%;
}

/* 左侧三角 */
.dialogue-box::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 20px;
  border: 8px solid transparent;
  border-right-color: white;
}
```

---

## 七、页面结构与线框图

> 整个应用为单页应用（SPA），通过页面状态切换，不刷新页面。

### 7.1 整体架构

```
+--------------------------------------------------+
| [状态栏/顶部导航]  (场景名称, 探险日记入口)      |
+--------------------------------------------------+
|               [主内容区域]                        |
|       (根据Step 1-5动态切换内容)                  |
+--------------------------------------------------+
| [底部导航/功能栏]  (场景切换, 设置入口)           |
+--------------------------------------------------+
```

### 7.2 首页（场景选择）

```
┌────────────────────────────────────────────────────────┐
│  🐱 Mimi                              📖 探险日记      │
├────────────────────────────────────────────────────────┤
│     ┌──────────────────────────────────────────┐      │
│     │           🍎 果园探险 [进度：0/10 ⭐]      │      │
│     └──────────────────────────────────────────┘      │
│     ┌──────────────────────────────────────────┐      │
│     │           🐔 农场探险 [进度：0/10 ⭐]      │      │
│     └──────────────────────────────────────────┘      │
│     ┌──────────────────────────────────────────┐      │
│     │           🌲 森林探险 [进度：0/10 ⭐]      │      │
│     └──────────────────────────────────────────┘      │
├────────────────────────────────────────────────────────┤
│               🎤 (主对话按钮, 120px圆形)                │
└────────────────────────────────────────────────────────┘
```

**交互：**
- 点击场景卡片 → 进入该场景的第一个单词学习
- 点击探险日记 → 查看历史完成图（进入日记画廊页）
- 点击主对话按钮 → 进入自由对话模式（非学习流程）

### 7.3 Step 1 页面（呈现单词）

```
┌────────────────────────────────────────────────────────┐
│  ← 返回                           🍎 果园探险          │
├────────────────────────────────────────────────────────┤
│      ┌─────────────────┐   ┌───────────────────────┐   │
│      │    🐱 Mimi      │   │ A-P-P-L-E            │   │
│      │   (居左40%)    │   │          apple       │   │
│      └─────────────────┘   │ [🔊 再听一遍]       │   │
│                             └───────────────────────┘   │
│                                       🍎               │
└────────────────────────────────────────────────────────┘
```

**动画时序：**
1. Mimi从左侧滑入（300ms）
2. 对话框从右侧滑入（300ms）
3. 字母逐个跳出（A→P→P→L→E，每个200ms，间隔100ms）
4. 字母组合成apple（整体scale 1.2→1.0，300ms）
5. 苹果图标在单词下方出现（fade in + bounce，200ms）

### 7.4 Step 2 & 4 页面（跟读/教学）

```
┌────────────────────────────────────────────────────────┐
│  ← 返回                           🍎 果园探险          │
├────────────────────────────────────────────────────────┤
│      ┌─────────────────┐   ┌───────────────────────┐   │
│      │    🐱 Mimi      │   │ Ollie老师，apple是   │   │
│      │   (举手姿态)    │   │ 什么意思呀？        │   │
│      └─────────────────┘   └───────────────────────┘   │
│                   ┌─────────────────┐                  │
│                   │    🎤 按住说话    │                  │
│                   │   [120px圆形]    │                  │
│                   │   #FFD700金色   │                  │
│                   └─────────────────┘                  │
└────────────────────────────────────────────────────────┘
```

### 7.5 Step 3 页面（评测反馈 - 通过）

```
┌────────────────────────────────────────────────────────┐
│  ← 返回                           🍎 果园探险          │
├────────────────────────────────────────────────────────┤
│                      ⭐ ⭐ ⭐                           │
│                    ⭐     ⭐                            │
│                   ⭐  太棒了！ ⭐                       │
│                    ⭐     ⭐                            │
│                      ⭐ ⭐ ⭐                           │
│                      🐱 Mimi                           │
│                   (胜利手势)                          │
└────────────────────────────────────────────────────────┘
```

### 7.6 Step 5 页面（画画）

```
┌────────────────────────────────────────────────────────┐
│  ← 返回                    画apple                    │
├────────────────────────────────────────────────────────┤
│    ┌──────────────────────────────────────────────┐   │
│    │           🍎 灰色线条轮廓                     │   │
│    │          (#D3D3D3, 3px线宽)                  │   │
│    └──────────────────────────────────────────────┘   │
│  🔴 🟠 🟡 🟢 🔵 🟣     [🖌️ 橡皮擦]  [✅ 完成]       │
└────────────────────────────────────────────────────────┘
```

### 7.7 探险日记页

```
┌────────────────────────────────────────────────────────┐
│  ← 返回                           📖 我的探险日记      │
├────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                 │
│  │ 🍎 apple │  │ 🍌 banana│  │   ⏳    │                 │
│  │ [图片]  │  │ [图片]  │  │  未完成 │                 │
│  └─────────┘  └─────────┘  └─────────┘                 │
│                                                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                 │
│  │ 🌲 tree │  │ 🌸 flower│  │  🌞 sun  │                 │
│  │ [图片]  │  │ [图片]  │  │ [图片]  │                 │
│  └─────────┘  └─────────┘  └─────────┘                 │
└────────────────────────────────────────────────────────┘
```

---

## 八、技术架构

### 8.1 前端技术栈

- **框架：** 纯HTML5 + CSS3 + JavaScript (ES6+)（单页应用）
- **画布：** HTML5 Canvas API
- **语音输入：** Web Speech API（`webkitSpeechRecognition`）
- **语音输出：** MiniMax TTS（主力）+ Web Speech API（降级）
- **存储：** LocalStorage（探险日记，不上云）
- **适配：** iPad横屏优先，支持Safari

### 8.2 后端（轻量）

- **对话引擎：** MiniMax API
- **画图生成：** MiniMax Image API（`mmx image`）
- **部署：** 小爱负责服务器，域名解析到ollie.zhipu-library.top

### 8.3 配置化机制

```
/data/
  words/
    orchard.json     ← 果园10词
    farm.json        ← 农场10词
    forest.json      ← 森林10词
  scenes/
    orchard.json     ← 果园场景配置
    farm.json        ← 农场场景配置
    forest.json      ← 森林场景配置
  outlines/
    orchard.json    ← 果园场景轮廓SVG路径
    farm.json       ← 农场场景轮廓SVG路径
    forest.json     ← 森林场景轮廓SVG路径
  dialogs/
    templates.json   ← 对话模板
```

**未来增加单词：**
1. 在`/data/words/`下新建JSON文件
2. 在`/data/outlines/`下配对应轮廓
3. 对话引擎自动读取，不需要改代码

---

## 九、交互细节与异常处理

### 9.1 网络中断

- 所有核心流程（除AI绘图外）在无网环境下仍可进行
- TTS自动降级为Web Speech API
- 语音评测降级为本地简单匹配或跳过
- AI绘图失败时：直接展示Ollie的原始涂鸦，提示"网络不太好，下次再和Mimi一起拍照吧！"

### 9.2 录音权限

- 首次使用时请求麦克风权限
- 若用户拒绝：引导家长在系统设置中开启，提示"没有麦克风，Mimi就听不到你说话啦！"
- 权限请求使用浏览器标准API：`navigator.mediaDevices.getUserMedia({ audio: true })`

### 9.3 长时间无操作

- 30秒无操作：Mimi做出打哈欠的动作，并语音提示"Xllie，你还在吗？我有点困了..."
- 60秒无操作：屏幕变暗，提示"休息一下，明天再来和Mimi探险吧！"

### 9.4 切换场景

- 切换场景前，若当前单词未完成5步闭环，提示"我们还没和Mimi一起画完这幅画呢，确定要离开吗？"
- 用户确认后，保存当前进度，返回首页

### 9.5 异常处理代码示例

```javascript
// 网络状态检测
window.addEventListener('online', () => showToast('网络连接恢复！'));
window.addEventListener('offline', () => showToast('网络不太好，Mimi会耐心等你！'));

// 录音权限检测
async function checkMicrophonePermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (e) {
    return false;
  }
}

// 无操作计时器
let inactivityTimer;
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    mimiSpeak("Ollie，你还在吗？我有点困了...");
    mimiAnimation('yawn');
  }, 30000);
}
```

---

## 十、项目分工

| 角色 | 负责 |
|------|------|
| TT | 设计方案、需求确认、进度跟踪、阶段性验收 |
| 小爱 | 前端开发（HTML/CSS/JS）、画布功能、语音集成、服务器部署、域名解析 |
| 森哥 | 验收、域名解析协调、未来需求补充 |

---

## 十一、部署信息

- **子域名：** ollie.zhipu-library.top
- **SSL：** 自动HTTPS（Let's Encrypt）
- **备案：** 小爱负责
- **服务器：** 阿里云/腾讯云轻量应用服务器 (Linux)
- **Web服务器：** Nginx
- **访问地址：** `https://ollie.zhip
ie.zhipu-library.top

---

## 十二、扩展计划

### 12.1 v1.1（词汇扩展）

- 将单词库从30个扩展到50个
- 增加新的场景（如"海洋探险"、"海边探险"）
- 新场景同样采用JSON配置，新增单词只需在words目录下新建JSON文件

### 12.2 v1.2（复习机制）

- 增加"Mimi的挑战"模块
- 系统从已学习的单词中随机抽取
- 让Ollie完成一次快速的"听音辨词"或"看图说话"挑战
- 复习频率：每学5个新单词触发1次复习

### 12.3 v1.3（家长控制台）

增加一个简单的家长入口（密码保护）。家长可以查看：

| 功能 | 说明 |
|------|------|
| 学习报告 | 今日/本周学了哪些单词，跟读成功率 |
| 探险日记画廊 | 查看Ollie的所有完成图，支持筛选场景 |
| 设置每日学习时长上限 | 默认30分钟，到时提示"明天再来吧" |
| 查看TTS消耗情况 | 每日/每周字符消耗统计 |

**家长控制台入口设计：**
- 在首页右下角显示一个小锁图标（不显眼）
- 连续点击5次解锁，输入家长密码（默认：ollie2026）
- 密码可在控制台内修改

---

## 十三、完整对话模板示例（以apple为例）

### 13.1 完整流程（通过分支）

```
【Step 1 - 呈现单词】

Mimi: (好奇地，歪着头) "Ollie，我今天在果园里学了一个新单词，你听听看！"
[TTS播放] "A-P-P-L-E, apple" (1秒间隔) "A-P-P-L-E, apple" (1秒间隔) "A-P-P-L-E, apple"
[屏幕显示字母逐个跳出动画，最后组合成apple]
[苹果图标在单词下方出现，跳动一下]
Mimi: (开心地拍手) "太棒了！你听到了吗？"

【Step 2 - 跟读练习】

Mimi: "你跟我念一遍好吗？按住这个金色的大按钮说话哦~"
[120px金色圆形按钮出现，带呼吸灯动画]
Ollie: (按住按钮) "A-P-P-L-E, apple"
[松开按钮，音频发送到后台]

【Step 3 - 通过】

Mimi: (惊喜，眼睛发光) "天哪！Ollie你读得也太标准了吧！比Mimi读得还好！你真厉害！"
[全屏星星爆炸庆祝动画，20颗星星从中心向外扩散]
[自动1.5秒后进入Step 4]

【Step 4 - 教Mimi】

Mimi: (举起爪子，认真地) "Ollie老师，你读得真棒！可是...apple到底是什么意思呀？我有点笨，你能教教我吗？"
Ollie: (按住按钮) "apple就是苹果，红红的，甜甜的"
Mimi: (恍然大悟的表情) "哦！原来是苹果呀！谢谢Ollie老师，你讲得真清楚，我记住啦！"
[心形从Mimi位置飘向Ollie]

【Step 5 - 画画】

Mimi: "Ollie老师，我们把apple画下来吧！这样我以后看到画就能想起来啦！"
[屏幕切换到画布，显示苹果灰色轮廓线]
Ollie: (描线 + 选红色涂色)
Ollie: (点击完成)
[AI生成完成图：粉色Mimi拿着红苹果在果园里]
Mimi: "哇！这是我们一起画的apple！太漂亮了！我要把它收进我们的探险日记里！"
[完成图存入LocalStorage，记录单词apple]
[显示"已解锁下一个单词：banana"]
```

### 13.2 完整流程（不通过分支，Step 3循环）

```
【Step 1 - 呈现单词】（同上）

【Step 2 - 跟读练习】（同上）

【Step 3 - 不通过】

Mimi: (温和地，微微歪头) "嗯...Ollie，好像有一点点不一样哦，我们再听一遍，然后一起试试好不好？加油！"
[按钮恢复为金色呼吸灯状态，无负面信息显示]
[自动回到Step 2，等待Ollie再次跟读]

【循环回到Step 2】

Mimi: "再试一次吧，按住金色按钮，像我刚才那样读一遍！"
[Ollie再次跟读...]

【Step 3 - 第二次尝试，通过】

Mimi: (惊喜地跳起来) "太棒了！这次完全正确！Ollie你真是个天才！"
[星星爆炸动画]
[自动进入Step 4后续流程]
```

### 13.3 场景切换时的未完成提示

```
【用户在学习apple的Step 5时点击返回】

系统弹窗: "我们还没和Mimi一起画完这幅画呢，确定要离开吗？"
  [继续画] [离开]

选择"继续画": 关闭弹窗，返回Step 5画布页面
选择"离开": 保存当前进度（apple已学完Step 1-4），返回首页
```

---

## 附录：配置化文件示例

### A. 对话模板配置（dialogs/templates.json）

```json
{
  "step1": {
    "intro": "Ollie，我今天在{scene}里学了一个新单词，你听听看！",
    "word_display": "A-P-P-L-E, {word}",
    "encourage": "太棒了！你听到了吗？"
  },
  "step2": {
    "prompt": "你跟我念一遍好吗？按住这个金色的大按钮说话哦~",
    "listening": "正在听..."
  },
  "step3": {
    "pass": "天哪！Ollie你读得也太标准了吧！比Mimi读得还好！你真厉害！",
    "fail": "嗯...Ollie，好像有一点点不一样哦，我们再听一遍，然后一起试试好不好？加油！"
  },
  "step4": {
    "question": "Ollie老师，你读得真棒！可是...{word}到底是什么意思呀？我有点笨，你能教教我吗？",
    "thanks": "哦！原来是{zh}呀！谢谢Ollie老师，你讲得真清楚，我记住啦！"
  },
  "step5": {
    "invite": "Ollie老师，我们把{word}画下来吧！这样我以后看到画就能想起来啦！",
    "complete": "哇！这是我们一起画的{word}！太漂亮了！我要把它收进我们的探险日记里！"
  }
}
```

### B. 场景配置示例（scenes/orchard.json）

```json
{
  "id": "orchard",
  "name": "果园探险",
  "color": "#FF6B35",
  "icon": "🍎",
  "background": "果园场景背景图",
  "description": "Ollie和Mimi来到果园，发现了好多好吃的水果！",
  "nextScene": "farm"
}
```

### C. 轮廓配置示例（outlines/orchard.json）

```json
{
  "scene": "orchard",
  "outlines": {
    "apple": {
      "svg": "M 150 100 C 150 80, 180 50, 200 80 C 220 100, 220 140, 200 180 C 180 210, 120 210, 100 180 C 80 150, 100 120, 120 100 C 130 90, 140 100, 150 100 Z",
      "stem": "M 150 100 Q 160 70, 180 60",
      "fillColor": "#FF0000"
    },
    "banana": {
      "svg": "M 80 150 Q 100 50, 180 80 Q 220 100, 200 180 Q 150 200, 80 150 Z",
      "fillColor": "#FFFF00"
    }
  }
}
```

---

*本文档由TT整合MiniMax版本和DeepSeek V4版本精华生成，2026-05-20*
*小爱可照此文档直接执行开发*
