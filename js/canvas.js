/**
 * canvas.js - 画布功能+30个SVG轮廓内嵌
 */
const Canvas = {
  canvas: null, ctx: null,
  isDrawing: false,
  currentColor: '#FF0000',
  lastX: 0, lastY: 0,
  outlines: {
    apple: "M 175 260 C 175 220, 210 180, 250 200 C 280 215, 290 260, 280 310 C 270 355, 210 370, 175 355 C 130 340, 115 285, 130 250 C 145 225, 160 230, 175 260 Z",
    banana: "M 90 280 Q 120 100, 260 150 Q 320 180, 300 280 Q 250 340, 90 280 Z",
    orange: "M 175 160 C 175 120, 235 100, 265 145 C 295 190, 285 270, 245 305 C 195 345, 115 320, 115 250 C 115 185, 140 155, 175 160 Z",
    grape: "M 140 220 C 120 180, 140 130, 180 130 C 220 130, 250 170, 240 220 C 230 270, 180 290, 140 220 Z",
    strawberry: "M 175 320 C 130 320, 90 270, 100 210 C 110 150, 175 120, 175 120 C 175 120, 240 150, 250 210 C 260 270, 220 320, 175 320 Z",
    pear: "M 175 340 C 130 340, 100 280, 110 220 C 120 160, 160 140, 175 140 C 190 140, 230 160, 240 220 C 250 280, 220 340, 175 340 Z",
    peach: "M 175 150 C 175 110, 230 100, 260 150 C 290 200, 275 290, 230 330 C 180 370, 120 340, 115 270 C 110 200, 130 155, 175 150 Z",
    cherry: "M 140 220 C 110 200, 110 260, 140 300 C 180 340, 220 320, 230 280 C 240 240, 200 210, 160 220 Z M 230 280 C 250 260, 280 260, 290 290 C 300 320, 270 340, 240 330 C 210 320, 215 300, 230 280 Z",
    watermelon: "M 50 280 C 50 180, 120 100, 200 100 C 280 100, 330 180, 300 280 C 280 350, 80 350, 50 280 Z",
    lemon: "M 120 175 C 100 140, 150 100, 200 110 C 260 120, 290 180, 270 240 C 250 300, 180 310, 140 270 C 100 230, 105 195, 120 175 Z",
    cat: "M 120 280 C 90 280, 70 230, 80 180 C 90 130, 140 120, 170 140 C 200 160, 210 220, 200 280 C 190 320, 140 320, 120 280 Z M 100 180 L 80 130 L 100 150 Z M 180 170 L 200 120 L 190 150 Z",
    dog: "M 100 280 C 70 260, 70 200, 100 160 C 130 120, 200 120, 240 160 C 280 200, 280 260, 250 300 C 220 330, 140 330, 100 280 Z M 130 170 L 110 130 L 130 150 Z",
    rabbit: "M 140 300 C 100 300, 80 250, 90 200 C 100 150, 160 140, 190 160 C 230 185, 240 250, 220 300 C 200 330, 170 330, 140 300 Z M 120 160 L 110 100 C 115 85, 130 85, 135 100 L 130 160 Z M 170 160 L 170 100 C 175 85, 190 85, 195 100 L 190 160 Z",
    cow: "M 80 300 C 50 270, 60 200, 120 180 C 180 160, 260 180, 290 240 C 310 290, 280 330, 220 330 C 150 330, 100 320, 80 300 Z M 100 180 L 80 120 L 100 150 Z M 250 180 L 270 120 L 260 160 Z",
    pig: "M 100 290 C 70 260, 80 190, 150 170 C 220 150, 300 180, 300 250 C 300 320, 220 340, 150 330 C 90 320, 110 305, 100 290 Z",
    horse: "M 100 310 C 60 270, 70 180, 140 150 C 210 120, 300 140, 310 220 C 320 290, 270 330, 200 330 C 130 330, 120 320, 100 310 Z M 140 150 L 130 90 L 155 120 Z",
    sheep: "M 110 300 C 80 270, 90 200, 160 180 C 230 160, 300 190, 300 260 C 300 330, 220 340, 160 330 C 100 320, 120 310, 110 300 Z",
    chicken: "M 140 310 C 100 290, 90 220, 130 180 C 170 140, 260 150, 280 210 C 300 270, 260 330, 190 330 C 150 330, 150 320, 140 310 Z",
    duck: "M 110 290 C 70 260, 80 190, 150 170 C 220 150, 300 180, 310 250 C 320 310, 260 340, 190 340 C 130 340, 130 310, 110 290 Z",
    milk: "M 140 310 C 110 310, 90 270, 100 220 C 110 170, 160 150, 200 160 C 250 170, 280 210, 280 260 C 280 310, 240 330, 190 330 C 150 330, 150 320, 140 310 Z",
    tree: "M 175 330 C 130 330, 100 280, 110 230 C 120 180, 160 160, 175 160 C 190 160, 230 180, 240 230 C 250 280, 220 330, 175 330 Z M 175 160 L 175 80 L 130 120 L 150 120 L 120 160 Z",
    flower: "M 175 280 C 130 280, 110 220, 130 170 C 150 120, 200 110, 220 170 C 240 230, 220 290, 175 300 C 130 295, 110 280, 175 280 Z M 175 170 C 160 160, 160 140, 175 130 C 190 140, 190 160, 175 170 Z",
    leaf: "M 175 310 C 120 310, 70 250, 90 170 C 110 90, 200 70, 260 130 C 290 170, 270 260, 175 310 Z",
    sun: "M 175 175 C 145 175, 120 200, 120 230 C 120 260, 145 285, 175 285 C 205 285, 230 260, 230 230 C 230 200, 205 175, 175 175 Z M 175 120 L 175 75 M 230 175 L 280 175 M 175 285 L 175 330 M 120 175 L 70 175",
    moon: "M 220 130 C 130 150, 100 230, 140 300 C 180 360, 280 350, 300 280 C 315 220, 280 150, 220 130 Z",
    star: "M 175 80 L 200 150 L 280 160 L 220 210 L 240 290 L 175 250 L 110 290 L 130 210 L 70 160 L 150 150 Z",
    bird: "M 100 200 C 80 170, 100 140, 140 140 C 180 140, 220 160, 240 190 C 270 230, 250 280, 200 290 C 150 300, 100 280, 100 200 Z",
    fish: "M 80 230 C 60 200, 90 150, 150 150 C 220 150, 300 190, 310 230 C 300 270, 220 310, 150 310 C 90 310, 60 270, 80 230 Z",
    butterfly: "M 130 220 C 100 180, 110 130, 150 130 C 190 130, 200 180, 175 220 C 150 260, 160 310, 200 310 C 240 310, 250 260, 220 220 C 190 180, 200 130, 240 130 C 280 130, 290 180, 260 220 C 230 260, 240 310, 280 310 C 320 310, 330 260, 300 220",
    bee: "M 175 180 C 145 180, 120 210, 120 250 C 120 290, 155 320, 195 320 C 240 320, 270 290, 270 250 C 270 210, 240 180, 175 180 Z"
  },

  init() {
    this.canvas = document.getElementById('drawCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    const size = 350;
    this.canvas.width = size; this.canvas.height = size;
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = 8;
    this.ctx.lineCap = 'round';
    this.setupColorPalette();
  },

  setupColorPalette() {
    const palette = document.getElementById('colorPalette');
    if (!palette) return;
    palette.innerHTML = '';
    const colors = ['#FF0000', '#FFA500', '#FFFF00', '#008000', '#0000FF', '#800080'];
    colors.forEach((color, i) => {
      const btn = document.createElement('button');
      btn.className = 'color-btn' + (i === 0 ? ' selected' : '');
      btn.style.backgroundColor = color;
      btn.onclick = () => {
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.currentColor = color;
        this.ctx.strokeStyle = color;
      };
      palette.appendChild(btn);
    });
  },

  clear() {
    if (!this.ctx) return;
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  },

  drawOutline(word) {
    if (!this.ctx) return;
    const path = this.outlines[word];
    if (!path) return;
    this.ctx.save();
    this.ctx.strokeStyle = '#D3D3D3';
    this.ctx.lineWidth = 6;
    const path2d = new Path2D(path);
    this.ctx.stroke(path2d);
    this.ctx.restore();
  },

  erase() {
    if (this.ctx) this.ctx.strokeStyle = '#FFFFFF';
  },

  startDrawing(e) {
    e.preventDefault();
    this.isDrawing = true;
    const pos = this.getPos(e);
    this.lastX = pos.x; this.lastY = pos.y;
  },

  draw(e) {
    if (!this.isDrawing) return;
    e.preventDefault();
    const pos = this.getPos(e);
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
    this.lastX = pos.x; this.lastY = pos.y;
  },

  stopDrawing() { this.isDrawing = false; },

  getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  },

  getImageData() { return this.canvas.toDataURL('image/png'); },

  attachEvents() {
    if (!this.canvas) return;
    this.canvas.addEventListener('touchstart', e => this.startDrawing(e), { passive: false });
    this.canvas.addEventListener('touchmove', e => this.draw(e), { passive: false });
    this.canvas.addEventListener('touchend', () => this.stopDrawing());
    this.canvas.addEventListener('mousedown', e => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', e => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseleave', () => this.stopDrawing());
  },

  async generateAIImage(word, scene) {
    const imageData = this.getImageData();
    const prompts = { orchard: 'in an orchard', farm: 'on a farm', forest: 'in a forest' };
    const prompt = `A cute cartoon ${word}, child-friendly style, vibrant colors, Studio Ghibli inspired, ${prompts[scene] || ''}`;
    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, size: '1024x1024' })
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      return data.imageUrl || data.imageData || imageData;
    } catch { return imageData; }
  }
};
