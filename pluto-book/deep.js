// ===================== DEEP: true 3D depth inside every plate (Three.js) =====================
// Thousands of stars and translucent nebula veils at real depths. The camera drifts forward all the time,
// and when the book camera dives into a plate (BOOKZ 0->1) it rushes forward: stars stretch into speed streaks.
// Drawn additively on top of the painted SPACE backdrop; everything is a pure function of time (deterministic).
'use strict';
window.BOOKZ = 0;
const DEEP = (() => {
  const DW = 1440, DH = 810, L = 700;                     // render size, depth of the star tunnel
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, premultipliedAlpha: true });
  renderer.setSize(DW, DH, false); renderer.setClearColor(0x000000, 0); renderer.setPixelRatio(1);
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(52, DW / DH, .1, 3000);
  const rnd = mulberry(4242);
  // ---------- stars ----------
  const NS = 5200, BX = 760, bpos = new Float32Array(NS * 3), pos = new Float32Array(NS * 3), col = new Float32Array(NS * 3), siz = new Float32Array(NS), ph = new Float32Array(NS);
  for (let i = 0; i < NS; i++) {
    const r = Math.sqrt(rnd()) * 260, a = rnd() * 6.283;
    pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = Math.sin(a) * r * .7; pos[i * 3 + 2] = -rnd() * L;
    const k = rnd(), c = k < .55 ? [1, .97, .9] : k < .8 ? [1, .88, .72] : k < .93 ? [.8, .88, 1] : [1, .78, .82];
    col.set(c, i * 3); const b = Math.pow(rnd(), 2.6); siz[i] = 1.0 + 6.5 * b; ph[i] = rnd() * 6.283;
  }
  { const rb = mulberry(777); for (let i = 0; i < NS * 3; i++) bpos[i] = (rb() - .5) * BX; }
  const VS = `
    attribute float size; attribute float phase; attribute vec3 color; attribute vec3 bpos; uniform float uCamZ, uL, uT, uStreak, uBox, uBX; uniform vec3 uCamP, uSV; attribute float endp;
    varying vec3 vC; varying float vA;
    void main(){
      vec3 wp;
      if (uBox > .5) {                                            // orbit mode: a box of stars wrapped around the camera
        wp = uCamP + mod(bpos - uCamP + .5 * uBX, uBX) - .5 * uBX;
        wp += endp * uSV;
      } else {
        float zw = uCamZ - mod(uCamZ - position.z, uL);            // endless tunnel: always ahead of the camera
        zw -= endp * uStreak; wp = vec3(position.x, position.y, zw);
      }
      vec4 mv = modelViewMatrix * vec4(wp, 1.0);
      float d = -mv.z;
      float far = uBox > .5 ? smoothstep(uBX * .5, uBX * .3, length(wp - uCamP)) : smoothstep(uL, uL * .5, d);
      vA = far * smoothstep(1.5, 14.0, d) * (.75 + .25 * sin(uT * (1.3 + size * .4) + phase)) * 1.35;
      vC = color;
      gl_PointSize = clamp(size * 420.0 / d, 1.0, 11.0);
      gl_Position = projectionMatrix * mv;
    }`;
  const FS = `
    uniform vec3 uTint; uniform float uGray, uAlpha; varying vec3 vC; varying float vA;
    void main(){
      vec2 q = gl_PointCoord - .5; float d = length(q);
      float a = smoothstep(.5, .0, d); a = a * a + .6 * smoothstep(.12, .0, d);
      vec3 c = vC * uTint; c = mix(c, vec3(dot(c, vec3(.3,.55,.15))), uGray);
      gl_FragColor = vec4(c * a * vA * uAlpha, a * vA * uAlpha);
    }`;
  const U = { uBox: { value: 0 }, uBX: { value: BX }, uCamP: { value: new THREE.Vector3() }, uSV: { value: new THREE.Vector3() }, uCamZ: { value: 0 }, uL: { value: L }, uT: { value: 0 }, uStreak: { value: 0 }, uTint: { value: new THREE.Vector3(1, 1, 1) }, uGray: { value: 0 }, uAlpha: { value: 1 } };
  const gS = new THREE.BufferGeometry();
  gS.setAttribute('position', new THREE.BufferAttribute(pos, 3)); gS.setAttribute('color', new THREE.BufferAttribute(col, 3));
  gS.setAttribute('bpos', new THREE.BufferAttribute(bpos, 3)); gS.setAttribute('size', new THREE.BufferAttribute(siz, 1)); gS.setAttribute('phase', new THREE.BufferAttribute(ph, 1)); gS.setAttribute('endp', new THREE.BufferAttribute(new Float32Array(NS), 1));
  const mS = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const stars = new THREE.Points(gS, mS); stars.frustumCulled = false; scene.add(stars);
  // speed streaks: a line per bright star, from where it is to where it was a moment ago
  const NL = 900, lb = new Float32Array(NL * 6), lp = new Float32Array(NL * 6), lc = new Float32Array(NL * 6), ls = new Float32Array(NL * 2), lph = new Float32Array(NL * 2), le = new Float32Array(NL * 2);
  for (let i = 0; i < NL; i++) for (let e = 0; e < 2; e++) { const j = i * 3; lp.set([pos[j], pos[j + 1], pos[j + 2]], (i * 2 + e) * 3); lb.set([bpos[j], bpos[j + 1], bpos[j + 2]], (i * 2 + e) * 3); lc.set([col[j], col[j + 1], col[j + 2]], (i * 2 + e) * 3); ls[i * 2 + e] = siz[i]; lph[i * 2 + e] = ph[i]; le[i * 2 + e] = e; }
  const gL = new THREE.BufferGeometry();
  gL.setAttribute('position', new THREE.BufferAttribute(lp, 3)); gL.setAttribute('bpos', new THREE.BufferAttribute(lb, 3)); gL.setAttribute('color', new THREE.BufferAttribute(lc, 3)); gL.setAttribute('size', new THREE.BufferAttribute(ls, 1));
  gL.setAttribute('phase', new THREE.BufferAttribute(lph, 1)); gL.setAttribute('endp', new THREE.BufferAttribute(le, 1));
  const UL = Object.assign({}, U, { uAlpha: { value: 0 }, uSV: { value: new THREE.Vector3() } });
  const mL = new THREE.ShaderMaterial({ uniforms: UL, vertexShader: VS.replace('gl_PointSize = clamp(size * 260.0 / d, .6, 9.0);', ''), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    fragmentShader: `uniform vec3 uTint; uniform float uGray, uAlpha; varying vec3 vC; varying float vA; void main(){ vec3 c = vC * uTint; c = mix(c, vec3(dot(c, vec3(.3,.55,.15))), uGray); gl_FragColor = vec4(c * vA * uAlpha * .5, vA * uAlpha * .5); }` });
  const streaks = new THREE.LineSegments(gL, mL); streaks.frustumCulled = false; scene.add(streaks);
  // ---------- nebula veils: soft painted wisps at many depths ----------
  function veilTex(seed) {
    const S = 256, c = canvas(S, S), x = c.getContext('2d'), id = x.createImageData(S, S);
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
      const u = i / S - .5, v = j / S - .5, r = Math.hypot(u, v) * 2;
      const f = fbm2(i * .018 + seed * 7, j * .018 + seed * 3, 5), f2 = fbm2(i * .05 + seed, j * .05, 3);
      const a = clamp((f - .38) * 2.4) * Math.pow(clamp(1 - r), 1.6) * (.6 + .4 * f2);
      const k = (j * S + i) * 4; id.data[k] = id.data[k + 1] = id.data[k + 2] = 255; id.data[k + 3] = a * 255;
    }
    x.putImageData(id, 0, 0); const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
  }
  const TEX = [0, 1, 2, 3].map(veilTex);
  const PAL = [[.30, .60, .70], [.80, .42, .55], [.50, .40, .85], [.90, .68, .40]];   // teal, rose, violet, ochre (muted)
  const VEILS = [];
  for (let i = 0; i < 34; i++) {
    const m = new THREE.SpriteMaterial({ map: TEX[i % 4], transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .2 });
    const s = new THREE.Sprite(m); const sc = 70 + rnd() * 170; s.scale.set(sc * (1 + rnd() * .6), sc, 1);
    s.material.rotation = rnd() * 6.283;
    const v = { s, x: (rnd() - .5) * 300, y: (rnd() - .5) * 170, z: -rnd() * L, b: [0, 0, 0], pal: PAL[i % 4], a: .22 + rnd() * .3, rot: (rnd() - .5) * .04 };
    s.position.set(v.x, v.y, v.z); scene.add(s); VEILS.push(v);
  }
  { const rv = mulberry(991); for (const v of VEILS) v.b = [(rv() - .5) * BX, (rv() - .5) * BX * .6, (rv() - .5) * BX]; }
  // orbit camera: circles a target point T straight ahead of the dolly path. yaw 0 = the usual forward view;
  // yaw pi = looking back at T from the far side (and so towards where we came from).
  function orbitCam(t, z, zoom, o) {
    const ob = o.orbit, D = ob.dist || 140, yaw = ob.yaw || 0, pit = ob.pitch || 0;
    const camZ = -dollyAt(t, z, zoom), cx = (o.cam ? o.cam[0] : 0) * 60, cy = -(o.cam ? o.cam[1] : 0) * 60;
    const T = new THREE.Vector3(cx, cy, camZ - D);
    const P = new THREE.Vector3(T.x + D * Math.sin(yaw) * Math.cos(pit), T.y + D * Math.sin(pit), T.z + D * Math.cos(yaw) * Math.cos(pit));
    return { P, T, roll: ob.roll || 0 };
  }
  // ---------- per-frame ----------
  const dollyAt = (t, z, zoom) => 7 * t + 150 * z + 70 * (zoom - 1);
  let lastKey = '';
  function draw(g, o, x = 0, y = 0, w = PAGE.IW, h = PAGE.IH) {
    if (o.deep === 0) return;
    const t = o.t || 0, z = window.BOOKZ || 0, zoom = o.zoom || 1;
    const dolly = dollyAt(t, z, zoom), v = (dollyAt(t, z, zoom) - dollyAt(t - .05, window._BOOKZ_PREV ?? z, zoom)) / .05;
    const camZ = -dolly, cx = (o.cam ? o.cam[0] : 0) * 60, cy = -(o.cam ? o.cam[1] : 0) * 60;
    const box = !!o.orbit; U.uBox.value = box ? 1 : 0;
    if (box) {
      const A = orbitCam(t, z, zoom, o), B = orbitCam(t - .05, window._BOOKZ_PREV ?? z, zoom, o.orbitPrev ? Object.assign({}, o, { orbit: o.orbitPrev }) : o);
      cam.position.copy(A.P); cam.up.set(Math.sin(A.roll), Math.cos(A.roll), 0); cam.lookAt(A.T);
      U.uCamP.value.copy(A.P);
      const vel = A.P.clone().sub(B.P).multiplyScalar(20);   // world units / s
      const sp = vel.length(), k = clamp((sp - 25) / 400) * 30 / Math.max(1, sp);
      UL.uSV.value.copy(vel).multiplyScalar(k);
      o._streak = clamp((sp - 25) / 400) * 30;
    } else { cam.up.set(0, 1, 0); cam.position.set(cx + 4 * Math.sin(t * .11), cy + 2.5 * Math.cos(t * .09), camZ); cam.lookAt(cx * .9, cy * .9, camZ - 100); }
    const warm = o.warm || 0, cold = o.cold || 0, gold = o.gold || 0;
    U.uTint.value.set(1 + .18 * warm + .2 * gold - .15 * cold, 1 + .02 * warm + .08 * gold - .05 * cold, 1 - .2 * warm - .25 * gold + .15 * cold);
    U.uGray.value = clamp((o.gray || 0) + .4 * cold); U.uCamZ.value = camZ; U.uT.value = t; U.uAlpha.value = (o.deepAlpha === undefined ? 1 : o.deepAlpha) * (o.bright || 1);
    const streak = box ? o._streak : clamp((v - 20) / 450) * 38;   // world-units length of the speed streaks
    UL.uCamZ.value = camZ; UL.uT.value = t; UL.uStreak.value = streak; UL.uAlpha.value = clamp(streak / 20) * U.uAlpha.value; UL.uTint.value = U.uTint.value; UL.uGray.value = U.uGray.value;
    const neb = .55 + .6 * (o.neb === undefined ? .5 : o.neb);
    const wr = (a, c) => c + ((((a - c + BX / 2) % BX) + BX) % BX) - BX / 2;
    for (const s of VEILS) {
      let fade;
      if (box) { const P = cam.position, x = wr(s.b[0], P.x), y = wr(s.b[1], P.y), zz = wr(s.b[2], P.z); s.s.position.set(x, y, zz);
        const d = Math.hypot(x - P.x, y - P.y, zz - P.z); fade = clamp((BX * .5 - d) / 140) * clamp((d - 20) / 60); }
      else { const zw = camZ - (((camZ - s.z) % L) + L) % L; s.s.position.set(s.x, s.y, zw); const d = camZ - zw; fade = clamp((L - d) / 180) * clamp((d - 12) / 60); }
      const c = s.pal, gr = U.uGray.value;
      let r = c[0] * U.uTint.value.x, gg = c[1] * U.uTint.value.y, b = c[2] * U.uTint.value.z; const l = r * .3 + gg * .55 + b * .15;
      s.s.material.color.setRGB(lerp(r, l, gr), lerp(gg, l, gr), lerp(b, l, gr));
      s.s.material.opacity = s.a * fade * neb * U.uAlpha.value; s.s.material.rotation += 0; s.s.material.rotation = s.rot * t + s.x;
    }
    renderer.render(scene, cam);
    g.save(); g.globalCompositeOperation = 'lighter'; g.drawImage(renderer.domElement, x, y, w, h); g.restore();
  }
  // near motes (2D, in page space): fine flecks drifting toward the viewer; they may cross the plate frame onto the paper
  const NEAR = []; for (let i = 0; i < 70; i++) NEAR.push({ x: (rnd() - .5) * 2.4, y: (rnd() - .5) * 1.5, z: rnd(), s: .5 + rnd(), c: rnd() < .6 ? [255, 244, 222] : [205, 228, 255] });
  function near(p, t, alpha = 1) {
    const z = window.BOOKZ || 0, dolly = dollyAt(t, z, 1) / 60;
    const cx = PAGE.IX + PAGE.IW / 2, cy = PAGE.IY + PAGE.IH / 2;
    p.save(); p.globalCompositeOperation = 'lighter';
    for (const m of NEAR) {
      const d = 1 - ((m.z + dolly * .25) % 1);                  // 1 far .. 0 at the viewer
      if (d < .04) continue;
      const k = .55 / d, X = cx + m.x * 520 * k, Y = cy + m.y * 520 * k;
      const a = alpha * clamp((1 - d) * 1.6) * clamp((d - .04) / .12) * .5, r = m.s * k * .9;
      if (a <= .01 || X < -40 || X > W + 40 || Y < -40 || Y > H + 40) continue;
      p.fillStyle = rgba(m.c, a); p.beginPath(); p.arc(X, Y, Math.min(r, 3.2), 0, 7); p.fill();
      if (r > 2.2) { p.strokeStyle = rgba(m.c, a * .6); p.lineWidth = .7; const L2 = r * 2.4; p.beginPath(); p.moveTo(X - L2, Y); p.lineTo(X + L2, Y); p.moveTo(X, Y - L2); p.lineTo(X, Y + L2); p.stroke(); }
    }
    p.restore();
  }
  return { draw, near };
})();
