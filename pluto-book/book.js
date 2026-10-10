// ===================== the book itself: an open atlas lying on a desk under a lamp =====================
// At book-camera z = 0 we see the whole volume: the page we are reading on the left (Hebrew: the binding is on its right),
// the facing page beyond the gutter, the cloth boards, the stack of page edges, the desk. As z -> 1 the camera dives
// into the plate exactly as before (z = 1 is unchanged: the plate fills the frame).
'use strict';
const BOOK = { SB: .78, X0: 118, Y0: 119 };                 // page (1920x1080 page units) -> screen at z = 0
BOOK.PW = Math.round(W * BOOK.SB); BOOK.PH = Math.round(H * BOOK.SB);
let _DESK = null;
function deskTex() {
  if (_DESK) return _DESK;
  const c = canvas(W, H), x = c.getContext('2d'), { X0, Y0, PW, PH } = BOOK, GX = X0 + PW;
  // walnut desk: long grain, warm and dark
  x.drawImage(woodTex(), 0, 0);
  // the book's shadow on the desk
  x.save(); x.shadowColor = 'rgba(0,0,0,.75)'; x.shadowBlur = 60; x.shadowOffsetX = 18; x.shadowOffsetY = 26; x.fillStyle = '#000';
  x.beginPath(); x.roundRect(X0 - 26, Y0 - 20, W - X0 + 200, PH + 46, 10); x.fill(); x.restore();
  // cloth boards (the same navy cloth as the cover), a little larger than the page block
  x.save(); x.beginPath(); x.roundRect(X0 - 26, Y0 - 20, W - X0 + 200, PH + 46, 9); x.clip();
  x.drawImage(clothTex(), 0, 0); x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(0, 0, W, H);
  x.strokeStyle = rgba(GOLD, .5); x.lineWidth = 1.5; x.beginPath(); x.roundRect(X0 - 18, Y0 - 12, W, PH + 30, 6); x.stroke();
  x.restore();
  // page block: the edges of the pages beneath, fanned a hair outwards (left / bottom of the left page, bottom of the right)
  for (let i = 9; i >= 1; i--) {
    const o = i * 1.6, t = 220 - i * 9;
    x.fillStyle = `rgb(${t},${t - 14},${t - 34})`;
    x.beginPath(); x.rect(X0 - o, Y0 + o * .55, PW, PH); x.fill();
    x.beginPath(); x.rect(GX, Y0 + o * .55, W, PH); x.fill();
    x.strokeStyle = `rgba(110,90,60,${.25 + .03 * i})`; x.lineWidth = .7; x.beginPath(); x.moveTo(X0 - o, Y0 + o * .55 + PH); x.lineTo(GX, Y0 + o * .55 + PH); x.moveTo(X0 - o, Y0 + o * .55); x.lineTo(X0 - o, Y0 + o * .55 + PH); x.stroke();
  }
  // the facing page (right): plain paper with its running head and folio, curving down into the gutter
  x.save(); x.beginPath(); x.rect(GX, Y0, W, PH); x.clip();
  x.drawImage(PAPER, GX, Y0, PW, PH);
  x.fillStyle = rgba(SEPIA, .55); x.font = '500 12px Cinzel'; x.letterSpacing = '4px'; x.direction = 'ltr'; x.textAlign = 'left';
  x.fillText('ATLAS COELESTIS PVERORVM', GX + 70, Y0 + 44); x.letterSpacing = '0px';
  x.strokeStyle = rgba(SEPIA, .3); x.lineWidth = .8; x.beginPath(); x.moveTo(GX + 70, Y0 + 58); x.lineTo(W, Y0 + 58); x.stroke();
  let gr = x.createLinearGradient(GX, 0, GX + 150, 0); gr.addColorStop(0, 'rgba(60,40,20,.55)'); gr.addColorStop(.25, 'rgba(60,40,20,.18)'); gr.addColorStop(1, 'rgba(60,40,20,0)');
  x.fillStyle = gr; x.fillRect(GX, Y0, 150, PH);
  x.restore();
  // lamp: a warm pool of light from the upper left, the room falling into darkness
  gr = x.createRadialGradient(W * .36, H * .3, 80, W * .45, H * .45, W * .78);
  gr.addColorStop(0, 'rgba(255,214,150,.10)'); gr.addColorStop(.55, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.55)');
  x.fillStyle = gr; x.fillRect(0, 0, W, H);
  return (_DESK = c);
}
// a closed book on the desk (cover / back cover pages): the board in the left-page position, its page block peeking out
let _DESKC = null, _WOOD = null;
function woodTex() {
  if (_WOOD) return _WOOD;
  const c = canvas(W, H), x = c.getContext('2d'), id = x.createImageData(W, H), d = id.data;
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const g = fbm2(i * .0016, j * .03, 4), f = fbm2(i * .02 + 9, j * .25, 3), ring = Math.sin((j * .045 + g * 9) * 3.1);
    const v = .55 + .25 * g + .08 * ring + .07 * (f - .5), k = (j * W + i) * 4; d[k] = 62 * v + 8; d[k + 1] = 38 * v + 5; d[k + 2] = 24 * v + 4; d[k + 3] = 255;
  }
  x.putImageData(id, 0, 0); return (_WOOD = c);
}
function deskClosedTex() {
  if (_DESKC) return _DESKC;
  const c = canvas(W, H), x = c.getContext('2d'), { X0, Y0, PW, PH } = BOOK;
  x.drawImage(woodTex(), 0, 0);
  x.save(); x.shadowColor = 'rgba(0,0,0,.75)'; x.shadowBlur = 60; x.shadowOffsetX = 18; x.shadowOffsetY = 26; x.fillStyle = '#000';
  x.beginPath(); x.roundRect(X0 - 4, Y0 - 4, PW + 22, PH + 26, 9); x.fill(); x.restore();
  x.save(); x.beginPath(); x.roundRect(X0 - 4, Y0 - 4, PW + 22, PH + 26, 9); x.clip(); x.drawImage(clothTex(), 0, 0); x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(0, 0, W, H); x.restore();
  x.fillStyle = 'rgb(222,210,186)'; x.fillRect(X0 + 4, Y0 + PH, PW + 6, 14); x.fillRect(X0 + PW, Y0 + 6, 12, PH + 8);       // page block edges
  x.strokeStyle = 'rgba(120,100,70,.35)'; x.lineWidth = .6;
  for (let i = 1; i < 8; i++) { x.beginPath(); x.moveTo(X0 + 4, Y0 + PH + i * 1.7); x.lineTo(X0 + PW + 6, Y0 + PH + i * 1.7); x.moveTo(X0 + PW + i * 1.5, Y0 + 6); x.lineTo(X0 + PW + i * 1.5, Y0 + PH + 8); x.stroke(); }
  const gr = x.createRadialGradient(W * .36, H * .3, 80, W * .45, H * .45, W * .78);
  gr.addColorStop(0, 'rgba(255,214,150,.10)'); gr.addColorStop(.55, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.55)');
  x.fillStyle = gr; x.fillRect(0, 0, W, H);
  return (_DESKC = c);
}
// the page lies in the book: it dips into the gutter on its right and catches the lamp (drawn over the page, page units)
function pageInBook(p, z) {
  const a = 1 - z; if (a <= .01) return;
  p.save();
  let gr = p.createLinearGradient(W - 190, 0, W, 0); gr.addColorStop(0, 'rgba(60,40,20,0)'); gr.addColorStop(.6, `rgba(60,40,20,${.16 * a})`); gr.addColorStop(1, `rgba(50,32,16,${.6 * a})`);
  p.fillStyle = gr; p.fillRect(W - 190, 0, 190, H);
  gr = p.createLinearGradient(0, 0, 40, 0); gr.addColorStop(0, `rgba(80,60,30,${.18 * a})`); gr.addColorStop(1, 'rgba(80,60,30,0)'); p.fillStyle = gr; p.fillRect(0, 0, 40, H);
  gr = p.createRadialGradient(W * .3, H * .2, 100, W * .45, H * .5, W * .8); gr.addColorStop(0, `rgba(255,236,200,${.06 * a})`); gr.addColorStop(1, `rgba(30,20,10,${.12 * a})`);
  p.fillStyle = gr; p.fillRect(0, 0, W, H);
  p.restore();
}
// page -> screen transform for book-camera z (0 = the whole book, 1 = the plate full bleed)
function bookXf(z) {
  const cxp = PAGE.IX + PAGE.IW / 2, cyp = PAGE.IY + PAGE.IH / 2;
  const S = BOOK.SB * Math.pow(ZFULL / BOOK.SB, z);
  const C = [lerp(W / 2, cxp, z), lerp(H / 2, cyp, z)];                         // page point that is held ...
  const D = [lerp(BOOK.X0 + BOOK.PW / 2, W / 2, z), lerp(BOOK.Y0 + BOOK.PH / 2, H / 2, z)];   // ... at this screen point
  return [S, D[0] - C[0] * S, D[1] - C[1] * S];
}
