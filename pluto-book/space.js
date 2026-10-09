// ===================== living space: storybook nebula shader + 2D star field + drifting dust =====================
'use strict';
const SPACE = (() => {
  const SW = 1008, SH = 567;                     // shader resolution (upscaled to the illustration; soft = painterly)
  const cv = canvas(SW, SH);
  const gl = cv.getContext('webgl', { preserveDrawingBuffer: true, antialias: false });
  const FS = `
precision highp float;
uniform vec2 res; uniform float t; uniform vec2 cam; uniform float zoom;
uniform float warm, cold, gray, bright, neb, galx, swirl, warp, wpr, gold, hue, red;
uniform vec2 swc, wpc, gpos;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*n(p);p=m*p;a*=.5;}return v;}
vec3 hueRot(vec3 c,float a){const vec3 k=vec3(.57735);float ca=cos(a);return c*ca+cross(k,c)*sin(a)+k*dot(k,c)*(1.-ca);}
void main(){
 vec2 fc=gl_FragCoord.xy; fc.y=res.y-fc.y; vec2 uv=fc/res; vec2 p=(fc-res*.5)/res.y;
 // spin swirl (used when Pluto spins)
 vec2 d=p-swc; float r=length(d); float ang=swirl*1.1/(.22+r); p=swc+mat2(cos(ang),-sin(ang),sin(ang),cos(ang))*d;
 // funhouse lens ("reality is crooked")
 vec2 dw=p-wpc; float rw=length(dw); p=wpc+dw*(1.-warp*exp(-rw*rw/(wpr*wpr)))+vec2(sin(p.y*7.+t*2.),cos(p.x*6.+t*1.7))*.03*warp;
 vec2 q=p/zoom+cam;
 vec2 w=vec2(fbm(q*1.5+vec2(0.,t*.045)),fbm(q*1.5+vec2(5.2,1.3)-t*.038));
 float dn=fbm(q*1.5+2.4*w+vec2(1.7,9.2)+vec2(t*.018,-t*.012));
 float dust=smoothstep(.55,.78,fbm(q*2.6+w*1.8+11.));
 float wash=fbm(q*7.+w*3.+21.);                                   // ink-wash texture
 vec3 top=vec3(.040,.062,.135), bot=vec3(.075,.105,.215);
 vec3 col=mix(top,bot,uv.y)*(.9+.2*wash);
 vec3 teal=vec3(.24,.47,.52), rose=vec3(.60,.36,.42), ochre=vec3(.74,.58,.36), slate=vec3(.30,.31,.52);
 vec3 nb=mix(slate,rose,smoothstep(.35,.8,w.x)); nb=mix(nb,teal,smoothstep(.5,.85,w.y)*.75);
 float dens=smoothstep(.36,.88,dn)*(.45+.55*neb);
 col+=nb*dens*.62*(1.-dust*.6)*(.8+.4*wash);
 col+=ochre*pow(smoothstep(.66,1.,dn),3.)*(.22+.8*warm+1.3*gold);
 float band=exp(-pow((p.y+p.x*.3-.05)/.30,2.));
 col+=vec3(.55,.55,.7)*band*fbm(q*9.+3.)*.14*(1.-dust*.7);
 vec2 gp=(p-gpos)*vec2(1.,2.3); float gr=length(gp), ga=atan(gp.y,gp.x);
 float arms=pow(.5+.5*cos(2.*(ga-log(gr+.001)*2.6-t*.22)),3.);
 col+=galx*(vec3(.72,.72,.86)*arms*exp(-gr*11.)*.55+vec3(1.,.93,.8)*exp(-gr*gr*900.)*.7);
 // moods
 col=hueRot(col,hue);
 col=mix(col,col*vec3(1.22,1.02,.80)+vec3(.10,.05,.015),warm*.85+gold*.6);
 float l=dot(col,vec3(.3,.55,.15));
 col=mix(col,vec3(l)*vec3(.72,.82,1.12)+vec3(.0,.01,.04),cold*.8);
 col=mix(col,vec3(l*.95),gray);
 col=mix(col,col*vec3(1.25,.55,.55)+vec3(.15,0.,0.),red);
 col*=bright;
 col=col*.95+vec3(.02,.025,.05);
 gl_FragColor=vec4(col,1.);
}`;
  function sh(type, src) { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
  const pg = gl.createProgram(); gl.attachShader(pg, sh(gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0,1);}')); gl.attachShader(pg, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pg); gl.useProgram(pg);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const U = {}; const loc = k => U[k] || (U[k] = gl.getUniformLocation(pg, k));
  gl.viewport(0, 0, SW, SH);
  const DEF = { t: 0, cam: [0, 0], zoom: 1, warm: 0, cold: 0, gray: 0, bright: 1, neb: .5, galx: .8, swirl: 0, warp: 0, wpr: .35, gold: 0, hue: 0, red: 0, swc: [0, 0], wpc: [0, 0], gpos: [-.55, -.28] };
  // draw the living sky into rect (x,y,w,h) of context g.  o: see DEF.  cam in screen-height units.
  function draw(g, o = {}, x = 0, y = 0, w = PAGE.IW, h = PAGE.IH) {
    const v = Object.assign({}, DEF, o); v.t = (v.t || 0) + (window.AMB_OFF || 0);
    gl.uniform2f(loc('res'), SW, SH);
    for (const k in v) { const val = v[k]; if (Array.isArray(val)) gl.uniform2f(loc(k), val[0], val[1]); else gl.uniform1f(loc(k), val); }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    g.save(); g.imageSmoothingQuality = 'high'; g.drawImage(cv, x, y, w, h); g.restore();
  }
  return { draw, SW, SH };
})();

// ---------- star field (crisp 2D stars with parallax, twinkle, sparkles) ----------
const STARS = (() => {
  const rnd = mulberry(77), list = [];
  for (let i = 0; i < 900; i++) {
    const z = rnd() < .55 ? .35 : rnd() < .7 ? .65 : 1.0;               // depth layer
    const b = Math.pow(rnd(), 3.2);                                    // brightness (few bright ones)
    const k = rnd(); const col = k < .55 ? [240, 238, 228] : k < .8 ? [255, 232, 196] : [206, 222, 240];
    list.push({ x: (rnd() - .5) * 4.2, y: (rnd() - .5) * 2.4, z, b, col, ph: rnd() * 6.28, f: .6 + rnd() * 2.2 });
  }
  // draw into rect of size (w,h). o: {t, cam:[x,y], zoom, alpha, swirl, swc:[x,y], spin (trail angle, rad), dim}
  function draw(g, o = {}, w = PAGE.IW, h = PAGE.IH) {
    const t = (o.t || 0) + (window.AMB_OFF || 0), cam = o.cam || [0, 0], zoom = o.zoom || 1, A = o.alpha === undefined ? 1 : o.alpha;
    const sw = o.swirl || 0, swc = o.swc || [0, 0], trail = o.trail || 0;
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const s of list) {
      const zf = 1 + (zoom - 1) * s.z;
      let px = (s.x - cam[0] * s.z) * zf, py = (s.y - cam[1] * s.z) * zf;
      px = ((px + 2.1) % 4.2 + 4.2) % 4.2 - 2.1;                        // wrap horizontally (endless sky)
      if (sw) { const dx = px - swc[0], dy = py - swc[1], r = Math.hypot(dx, dy), a = -sw * 1.1 / (.22 + r); px = swc[0] + dx * Math.cos(a) - dy * Math.sin(a); py = swc[1] + dx * Math.sin(a) + dy * Math.cos(a); }
      const X = w / 2 + px * h, Y = h / 2 + py * h; if (X < -20 || X > w + 20 || Y < -20 || Y > h + 20) continue;
      const tw = .65 + .35 * Math.sin(t * s.f + s.ph);
      const a = A * (.25 + .75 * s.b) * tw * (o.dim === undefined ? 1 : o.dim) * (.5 + .5 * s.z);
      const rad = (.6 + 2.2 * s.b) * (.6 + .5 * s.z);
      if (trail > 0) {                                                // star trails while spinning
        const r = Math.hypot(X - w / 2 - swc[0] * h, Y - h / 2 - swc[1] * h), a0 = Math.atan2(Y - h / 2 - swc[1] * h, X - w / 2 - swc[0] * h);
        g.strokeStyle = rgba(s.col, a * .8); g.lineWidth = rad * 1.1; g.lineCap = 'round';
        g.beginPath(); g.arc(w / 2 + swc[0] * h, h / 2 + swc[1] * h, r, a0 - trail * (.4 + .6 * s.z), a0); g.stroke(); continue;
      }
      g.fillStyle = rgba(s.col, a); g.beginPath(); g.arc(X, Y, rad * .8, 0, 7); g.fill();
      if (s.b > .6) { const L = rad * (4 + 5 * s.b) * (.75 + .25 * tw); g.strokeStyle = rgba(s.col, a * .7); g.lineWidth = .8;
        g.beginPath(); g.moveTo(X - L, Y); g.lineTo(X + L, Y); g.moveTo(X, Y - L); g.lineTo(X, Y + L); g.stroke(); }
    }
    g.restore();
  }
  return { draw };
})();

// four-point storybook sparkle with soft glow
function sparkle(g, x, y, size, a = 1, col = [255, 240, 210]) {
  if (a <= 0.01 || size <= .5) return;
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = rgba(col, a);
  const s = size, k = size * .06;
  g.beginPath(); g.moveTo(x, y - s); g.quadraticCurveTo(x + k, y - k, x + s, y); g.quadraticCurveTo(x + k, y + k, x, y + s); g.quadraticCurveTo(x - k, y + k, x - s, y); g.quadraticCurveTo(x - k, y - k, x, y - s); g.fill();
  g.beginPath(); g.arc(x, y, Math.max(.8, size * .09), 0, 7); g.fill();
  g.restore();
}
const glint = sparkle;

// ---------- drifting magic dust (soft bokeh motes) ----------
const DUST = (() => {
  const rnd = mulberry(5), list = [];
  for (let i = 0; i < 140; i++) list.push({ x: rnd(), y: rnd(), z: .3 + rnd() * .7, ph: rnd() * 6.28, c: rnd() < .5 ? [230, 226, 210] : [255, 226, 180] });
  function draw(g, o = {}, w = PAGE.IW, h = PAGE.IH) {
    const t = (o.t || 0) + (window.AMB_OFF || 0), A = o.alpha === undefined ? 1 : o.alpha, vx = o.vx === undefined ? .012 : o.vx, vy = o.vy === undefined ? -.006 : o.vy, cam = o.cam || [0, 0];
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const d of list) {
      let x = ((d.x + t * vx * d.z - cam[0] * .3 * d.z) % 1 + 1) % 1, y = ((d.y + t * vy * d.z + .012 * Math.sin(t * .7 + d.ph) - cam[1] * .3 * d.z) % 1 + 1) % 1;
      const X = x * w, Y = y * h, r = .5 + 1.3 * d.z * d.z, a = A * (.10 + .35 * d.z) * (.6 + .4 * Math.sin(t * 1.3 + d.ph));
      g.fillStyle = rgba(d.c, a); g.beginPath(); g.arc(X, Y, r, 0, 7); g.fill();
    }
    g.restore();
  }
  return { draw };
})();
