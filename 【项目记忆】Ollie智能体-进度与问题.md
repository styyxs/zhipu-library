# Ollie智能体 · 项目记忆与进度文件

> 创建时间：2026-05-20 深夜
> 最后更新：2026-05-20
> 当前状态：卡点待解决

---

## 一、项目概述

- **产品名称：** Ollie和Mimi一起学英语
- **域名：** `ollie.zhipu-library.top`（Cloudflare Pages 静态托管）
- **核心功能：** 5步学习闭环（听Mimi说单词 → Ollie跟读 → AI评测 → Ollie教Mimi → 画画）
- **目标用户：** Ollie（5岁半）+ 家长（森哥）

---

## 二、设计文档

完整设计文档位于：
`/Users/sengao/.openclaw/workspace/subagent-outputs/2026-05-20-Ollie智能体文档融合/Ollie智能体-融合版设计文档.md`

---

## 三、技术架构（当前状态）

### 前端
- 静态网页：HTML5 + CSS3 + JavaScript
- 托管：Cloudflare Pages（`ollie.zhipu-library.top`）
- 代码仓库：https://github.com/styyxs/zhipu-library

### 语音（TTS）
- **主力方案：** MiniMax TTS API，通过 Worker 代理转发
- **降级方案：** Web Speech API（浏览器自带）
- 当前状态：Worker 不通，实际走的是 Web Speech 降级方案

### 语音识别（STT）
- 使用 Web Speech API（`webkitSpeechRecognition`）

### 画画
- HTML5 Canvas
- 预设 SVG 轮廓（30个单词）
- AI 生成完成图（调用 MiniMax Image API，走 Worker）

### 数据存储
- LocalStorage（探险日记、学习进度）
- 不上云，保护儿童隐私

---

## 四、当前代码文件结构

```
/Users/sengao/Documents/其他/奥莉学英语/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式（含动画）
├── js/
│   ├── app.js         # 主应用逻辑（5步闭环）
│   ├── tts.js          # 语音合成（TTS）
│   ├── speech.js       # 语音识别（STT）
│   ├── canvas.js       # 画画功能 + SVG轮廓
│   ├── words.js        # 单词数据
│   ├── dialog.js       # 对话逻辑
│   └── storage.js      # LocalStorage 封装
├── workers/
│   └── api-proxy.js    # Worker 代码（未部署）
└── data/
    └── scenes/         # 场景配置
```

---

## 五、部署情况

### GitHub 仓库
- 地址：https://github.com/styyxs/zhipu-library
- 状态：✅ push 成功（2026-05-20）
- 自动部署：Cloudflare Pages 绑定 GitHub，每次 push 自动部署

### Cloudflare Pages
- 子域名：`ollie.zhipu-library.top`
- 状态：✅ 可访问，正常运行

### Cloudflare Worker
- **当前配置地址（tts.js 和 canvas.js 中）：**
  - `https://ollie-zhipu-library.962324377.workers.dev`
- **原来配置的地址：**
  - `https://ollie-mimi-api.962324377.workers.dev`
- 状态：❌ 两个地址均无法访问（超时）
- 用途：TTS 代理 + Image API 代理

---

## 六、已知问题（卡点）

### 问题1：Worker 访问不通（核心卡点）

**现象：**
- `ollie-zhipu-library.962324377.workers.dev` 无法访问（超时）
- `ollie-mimi-api.962324377.workers.dev` 也无法访问
- 森哥浏览器打不开，小爱终端也超时

**影响：**
- TTS 主力方案无法使用（走不通 MiniMax API）
- 实际降级到 Web Speech API（浏览器自带语音）

**可能原因：**
- Cloudflare Worker 未正确部署
- 账户/项目配置问题
- 网络问题（公司网络对 443 端口限制，但家里网络也不通）

### 问题2：网页动画和语音乱跳不稳定

**现象：**
- 森哥打开 `ollie.zhipu-library.top` 后，没有做任何交互
- 页面随机出现：时而冒一句话、时而冒一个动画
- 完全无规律，不可预期

**可能原因分析：**
1. **LocalStorage 进度状态问题：** 之前学习的进度被保存了，刷新页面后自动恢复到了某个学习 Step，自动触发了 TTS 和动画
2. **Worker 请求失败回调问题：** TTS 发出请求后失败，触发了某个 fallback 逻辑，导致异常行为
3. **降级方案行为异常：** Web Speech API 在某些情况下可能自动播放

### 问题3：语音和动画不同步

**现象：**
- 有时先出动画有时先出语音
- callback 机制可能有问题

**代码分析：**
- `app.js` 第 65 行：`TTS.speak(..., { callback: () => this.showStep1Word(word) })`
- 动画是在 callback 里才显示的，不是同步的
- TTS 走降级方案时 callback 时机可能不稳定

---

## 七、GitHub push 情况

- 2026-05-20 当晚 push 成功
- GitHub 能通但不稳定（有时超时有时成功）
- 建议森哥备好梯子，万一 443 端口被限

---

## 八、下一步建议

### 关于 Worker 问题
1. **先确认 Worker 是否真实存在：** 森哥去 Cloudflare Dashboard 看看 `ollie-zhipu-library` 这个 Worker 项目是否真的部署了，状态是什么
2. **如果 Worker 没部署：** 需要重新部署 Worker（api-proxy.js）
3. **如果部署了但不通：** 可能是网络问题，等网络好再试
4. **备选方案：** 用 Cloudflare Pages 的 Functions 替代独立 Worker（都在同一个 Pages 项目里）

### 关于网页乱跳问题
1. **先清除 localStorage：** 在浏览器开发者工具 → Application → Local Storage 删除 `ollie.zhipu-library.top` 的所有数据
2. **如果清除后正常了：** 说明问题在进度状态恢复逻辑
3. **如果清除后还乱跳：** 问题在 TTS 降级方案的异常处理

### 关于从头写网页
- 当前代码架构已经完整实现了 5 步闭环
- **不建议完全重写**，先解决上述两个卡点（Worker + localStorage）看是否恢复稳定
- 如果清除 localStorage 后仍有问题，再考虑排查 TTS 降级代码

---

## 九、5步学习闭环当前实现状态

| Step | 内容 | 状态 |
|------|------|------|
| Step 1 | Mimi 呈现单词（TTS 3遍 + 字母动画） | ⚠️ TTS 降级可用，动画偶发乱跳 |
| Step 2 | Ollie 跟读（录音按钮） | ⚠️ 需要测试 |
| Step 3 | AI 评测发音 | ⚠️ 需要测试 |
| Step 4 | Ollie 教 Mimi（中文解释） | ⚠️ 需要测试 |
| Step 5 | 画画 + AI 生成完成图 | ⚠️ 需要 Worker 支持 Image API |

---

## 十、记忆待确认

- 森哥提到有一个"今天下午写的项目记忆文件"找不到了，内容可能是项目进度/TODO/笔记
- 如果森哥能描述内容，我可以尝试恢复或重新整理
