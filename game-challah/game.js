(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const stage = $('stage');
  const batchen = $('batchen');
  const breadLayer = $('bread-layer');
  const heldBread = $('held-bread');
  const kissButton = $('kiss-button');
  const instruction = $('instruction');
  const toast = $('toast');
  const hatch = $('exterior-hatch');
  const doorTouchButton = $('door-touch-button');
  const doorPrompt = $('door-prompt');
  const bakingCaption = $('baking-caption');
  const tableBreads = $('table-breads');
  tableBreads.innerHTML = Array.from({length: 5}, (_, i) => `<img src="assets/challah.webp" alt="" style="left:${-6 + i * 19}%;width:42%;bottom:${i % 2 ? 9 : 0}%;transform:rotate(${[-11, 5, -3, 12, -7][i]}deg)">`).join('');
  const state = {
    phase: 'intro', x: 50, depth: 0, targetX: null, targetDepth: null,
    score: 0, breads: [], carrying: false,
    lifting: false, kissing: false, delivering: false, targetBread: null,
    arrivalAction: null, gameTime: 0, nextHit: 2.8,
    lastFrame: performance.now(), mic: null, audio: null, analyser: null,
    micLast: 0, noiseFloor: .012, soundActive: false, lastKiss: 0, toastTimer: null,
    doorOpen: false, paused: false, carriedTableIndex: null,
    lives: 3, best: 0, carryStart: 0, backDoorOpen: false, level: 0, charge: 0, musicOn: true
  };
  const SUPER_AT = 5;
  // Game rules, in one place
  const TABLE_SLOTS = 5, LIVES = 3;
  const floorLimit = () => 5;   // the five-second rule: the game gets harder through the hits, not by shortening it
  const hitGap = () => Math.max(1.7, 4.6 - state.score * .15) + Math.random() * 1.1;
  const dropsPerHit = () => state.score >= 14 ? (Math.random() < .35 ? 3 : 2) : state.score >= 6 ? (Math.random() < .5 ? 2 : 1) : 1;
  try { state.best = Number(localStorage.getItem('challah-best')) || 0; } catch (_) {}
  const track = (x) => { try { window.hsTrack && window.hsTrack('gift_use', {x: 'game-challah:' + x}); } catch (_) {} };

  function updateKissButton() {
    kissButton.disabled = state.phase !== 'playing' || !state.carrying || state.lifting || state.kissing || state.delivering;
    kissButton.classList.toggle('ready', state.carrying && !kissButton.disabled);
    kissButton.textContent = '💋 נשיקה לחלה';
  }

  function armEntrance(withMic) {
    if (state.phase !== 'intro') return;
    state.phase = 'boarding-closed';
    $('mic-button').hidden = true;
    $('skip-button').hidden = true;
    doorPrompt.hidden = false;
    doorTouchButton.hidden = false;
    doorTouchButton.textContent = withMic ? 'פתיחה בלחיצה אם הזיהוי נכשל' : 'פתיחת הדלת בלי מיקרופון';
    $('mic-status').textContent = withMic ? 'המיקרופון פעיל. אין הקלטה או שליחת קול.' : 'אפשר להיכנס גם ללא מיקרופון.';
    state.lastKiss = performance.now();
  }
  function openEntrance() {
    if (state.phase !== 'boarding-closed') return;
    state.phase = 'boarding-open';
    state.doorOpen = true;
    hatch.classList.add('open');
    doorPrompt.textContent = 'הפתח נפתח! עוד ״מוואה״ סוגרת אותו מאחורייך.';
    doorTouchButton.textContent = 'סגירת הדלת בלי מיקרופון';
    fx('doorOpen');
  }
  function closeEntranceAndBoard() {
    if (state.phase !== 'boarding-open') return;
    state.phase = 'boarding';
    state.doorOpen = false;
    hatch.classList.remove('open');
    doorTouchButton.hidden = true;
    doorPrompt.textContent = 'הדלת נסגרה. נכנסים לשדי…';
    fx('doorClose');
    setTimeout(startBakingPrelude, 850);
  }
  function startBakingPrelude() {
    if (state.phase !== 'boarding') return;
    state.phase = 'baking';
    $('intro-panel').classList.add('exit');
    stage.classList.remove('intro');
    stage.classList.add('baking');
    setInstruction('בת־חן קולעת חלה לשבת…');
    setTimeout(() => { $('intro-panel').hidden = true; }, 650);
    setTimeout(() => {
      stage.classList.add('baking-oven');
      fx('bell');
      bakingCaption.textContent = 'הצמה נכנסת לתנור. החלות המוכנות מחכות על השולחן.';
      setInstruction('החלה בתנור. הכול שקט… בינתיים.');
    }, 2400);
    setTimeout(startBattle, 4900);
  }
  function startBattle() {
    if (state.phase !== 'baking') return;
    state.phase = 'alert';
    stage.classList.add('alert');
    bakingCaption.textContent = 'אזעקה! המגן של שדי תחת אש!';
    setInstruction('אזעקה! לייזרים פוגעים במגן של שדי.');
    fx('alarm');
    setTimeout(() => {
      if (!state.seenHowTo) { state.seenHowTo = true; $('howto').hidden = false; $('howto-go').focus(); return; }
      beginPlay();
    }, 1500);
  }
  function beginPlay() {
    $('howto').hidden = true;
    startMusic();
    doorClips.start();
    {
      stage.classList.remove('baking', 'baking-oven');
      stage.classList.add('playing');
      state.phase = 'playing';
      state.gameTime = 0;
      state.nextHit = 4.2;
      syncLives();
      $('pause-button').hidden = false;
      setCharacterClass('idle');
      updateKissButton();
      shipHit();
      setInstruction('חלה נפלה מהשולחן! געו בה כדי שבת־חן תאסוף אותה.');
      stage.focus({preventScroll: true});
    }
  }
  $('howto-go').addEventListener('click', beginPlay);

  function setToast(text, duration = 1600) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
  }
  function setInstruction(text) { instruction.textContent = text; }
  function syncHud() {
    $('score').textContent = state.score;
  }
  function setCharacterClass(name) {
    batchen.classList.remove('walk', 'idle', 'holding', 'kissing');
    batchen.classList.add(name);
  }
  const feetY = () => 97 - 42 * state.depth;
  const characterWidth = () => 46 - 20 * state.depth;
  const characterHeight = () => characterWidth() * 1.5 * stage.clientWidth / stage.clientHeight;
  const handsY = () => feetY() - characterHeight() * .42;
  const mouthY = () => feetY() - characterHeight() * .78;
  function syncCharacter() {
    batchen.style.left = `${state.x}%`;
    batchen.style.bottom = `${3 + 42 * state.depth}%`;
    batchen.style.width = `${characterWidth()}%`;
    heldBread.style.left = `${state.x + 8 - 3 * state.depth}%`;
    heldBread.style.top = `${handsY()}%`;
    heldBread.style.width = `${17 - 7 * state.depth}%`;
    $('blessing').style.left = `${state.x + 5 - 2 * state.depth}%`;
    $('blessing').style.top = `${mouthY() - 4}%`;
    $('foot-shadow').style.left = `${state.x}%`;
    $('foot-shadow').style.top = `${feetY() - 1}%`;
    $('foot-shadow').style.width = `${24 - 9 * state.depth}%`;
  }
  syncCharacter();
  window.addEventListener('resize', syncCharacter);

  async function enableMicrophone() {
    $('mic-status').textContent = 'מבקשים גישה למיקרופון…';
    if (!navigator.mediaDevices?.getUserMedia) {
      $('mic-status').textContent = 'המיקרופון אינו זמין כאן. אפשר להיכנס בלי מיקרופון.';
      armEntrance(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true, noiseSuppression: true}});
      if (state.phase !== 'intro') { stream.getTracks().forEach((track) => track.stop()); return; }
      state.mic = stream;
      const ctx = state.audio || new (window.AudioContext || window.webkitAudioContext)();
      state.audio = ctx;
      await ctx.resume();
      const source = ctx.createMediaStreamSource(stream);
      state.analyser = ctx.createAnalyser();
      state.analyser.fftSize = 1024;
      source.connect(state.analyser);
      armEntrance(true);
    } catch (_) {
      $('mic-status').textContent = 'לא קיבלנו גישה למיקרופון. אפשר להיכנס בלי מיקרופון.';
      armEntrance(false);
    }
  }

  const wave = new Uint8Array(1024);
  function sampleMicrophone(now) {
    if (!state.analyser || state.paused || now - state.micLast < 40) return;
    state.micLast = now;
    state.analyser.getByteTimeDomainData(wave);
    let energy = 0;
    for (let i = 0; i < wave.length; i++) {
      const sample = (wave[i] - 128) / 128;
      energy += sample * sample;
    }
    const rms = Math.sqrt(energy / wave.length);
    const previousFloor = state.noiseFloor;
    state.noiseFloor = Math.max(.005, Math.min(.05, previousFloor * .995 + rms * .005));
    // A rising, brief sound counts once; one sustained sound cannot both open and close the hatch.
    // This is a prototype kiss detector and still needs validation on real phones.
    const threshold = Math.max(.052, previousFloor * 2.8);
    if (rms < threshold * .55) state.soundActive = false;
    if (!state.soundActive && rms > threshold && now - state.lastKiss > 950) {
      state.soundActive = true;
      state.lastKiss = now;
      onKiss('mic');
    }
  }

  function shipHit() {
    stage.classList.remove('hit');
    $('laser').classList.remove('fire');
    $('flash').classList.remove('on');
    tableBreads.classList.remove('jolt');
    void stage.offsetWidth;
    stage.style.setProperty('--shake', (1 + Math.min(state.score, 24) / 8).toFixed(2));
    stage.classList.add('hit');
    $('laser').classList.add('fire');
    $('flash').classList.add('on');
    tableBreads.classList.add('jolt');
    const k = 1 + Math.min(state.score, 24) / 8;
    fx('laser', 1); setTimeout(() => fx('laser', 1.25), 90); if (k > 1.6) setTimeout(() => fx('laser', .85), 170);
    setTimeout(() => { fx('hit', k); duck(.5, 650); }, 110);
    // A hit must dislodge one of the challahs visibly resting on the table.
    const available = [...tableBreads.querySelectorAll('img')]
      .map((image, index) => ({image, index}))
      .filter(({image}) => !image.classList.contains('fallen'));
    for (let n = dropsPerHit(); n > 0 && available.length; n--) dropBread(available.splice(Math.floor(Math.random() * available.length), 1)[0]);
    if (navigator.vibrate) try { navigator.vibrate(60); } catch (_) {}
    setTimeout(() => {
      stage.classList.remove('hit');
      tableBreads.classList.remove('jolt');
    }, 560);
  }

  let breadId = 0;
  function dropBread({image, index}) {
    const stageBounds = stage.getBoundingClientRect();
    const breadBounds = image.getBoundingClientRect();
    const startX = (breadBounds.left + breadBounds.width / 2 - stageBounds.left) / stageBounds.width * 100;
    const startY = (breadBounds.top + breadBounds.height / 2 - stageBounds.top) / stageBounds.height * 100;
    image.classList.add('fallen');
    setTimeout(() => fx('whoosh', .8), 120);
    const landingX = 17 + Math.random() * 65;
    const landingY = 72 + Math.random() * 17;
    const bread = {
      id: ++breadId, x: startX, y: startY, startX, startY, tableIndex: index,
      landingX, landingY, flight: 0, flightDuration: .78 + Math.random() * .22,
      landed: false, element: document.createElement('div')
    };
    bread.element.className = 'bread falling';
    bread.element.innerHTML = '<img src="assets/challah.webp" alt="">';
    bread.element.style.left = `${bread.x}%`;
    bread.element.style.top = `${bread.y}%`;
    bread.element.style.width = '9%';
    bread.element.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      event.stopPropagation();
      chooseBread(bread);
    });
    bread.element.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      chooseBread(bread);
    });
    breadLayer.appendChild(bread.element);
    state.breads.push(bread);
    if (state.score === 0 && state.breads.length <= 1) setToast('החללית היטלטלה — חלה נפלה מהשולחן!');
  }

  function chooseBread(bread) {
    if (state.phase !== 'playing' || state.carrying || state.lifting || state.kissing || state.delivering) return;
    if (!state.breads.includes(bread) || !bread.landed) return;
    state.breads.forEach((item) => item.element.classList.remove('selected'));
    state.targetBread = bread;
    bread.element.classList.add('selected');
    state.targetX = bread.x;
    state.targetDepth = Math.max(0, Math.min(1, (97 - bread.landingY) / 42));
    setInstruction('בת חן בדרך לחלה…');
  }

  function pickUp(bread) {
    if (state.carrying || state.lifting || state.kissing) return;
    state.lifting = true;
    updateKissButton();
    state.targetBread = null;
    state.targetX = null;
    state.targetDepth = null;
    state.breads = state.breads.filter((b) => b !== bread);
    state.carriedTableIndex = bread.tableIndex;
    syncHud();
    bread.element.style.transition = 'left .36s ease-out, top .36s ease-out, transform .36s ease-out, opacity .25s';
    bread.element.style.left = `${state.x + 8 - 3 * state.depth}%`;
    bread.element.style.top = `${handsY()}%`;
    bread.element.style.transform = 'translate(-50%,-50%) scale(.88)';
    setCharacterClass('holding');
    fx('pickup');
    setInstruction('עכשיו נותנים ״מוואה״ למיקרופון.');
    setTimeout(() => {
      bread.element.remove();
      state.lifting = false;
      state.carrying = true;
      state.carryStart = performance.now();
      heldBread.classList.add('visible');
      updateKissButton();
    }, 370);
  }

  function kissChallah() {
    if (!state.carrying || state.kissing) return;
    state.kissing = true;
    const quick = performance.now() - state.carryStart < 1600;
    if (quick) { state.score += 1; syncHud(); popScore('נשיקת בזק! ‎+1'); setTimeout(() => fx('score', true), 350); }
    toggleBackDoor();
    stage.classList.add('slowmo');
    updateKissButton();
    setCharacterClass('kissing');
    heldBread.style.transition = 'top .9s cubic-bezier(.2,.05,.18,1), left .9s ease-in-out, transform .9s ease-in-out';
    heldBread.style.top = `${mouthY() + 4}%`;
    heldBread.style.left = `${state.x + 2 - state.depth}%`;
    heldBread.style.transform = 'translate(-50%,-50%) rotate(-12deg) scale(.9)';
    if (!state.micKiss) fx('smooch');
    state.micKiss = false;
    setTimeout(() => {
      $('blessing').classList.remove('show');
      void $('blessing').offsetWidth;
      $('blessing').classList.add('show');
      fx('chime');
    }, 700);
    setTimeout(() => {
      stage.classList.remove('slowmo');
      heldBread.style.transition = '';
      heldBread.style.transform = '';
      state.kissing = false;
      state.delivering = true;
      updateKissButton();
      state.targetX = 60;
      state.targetDepth = .72;
      state.arrivalAction = 'place';
      syncCharacter();
      setCharacterClass('walk');
      setInstruction('עכשיו מחזירים את החלה אל השולחן.');
    }, 1050);
  }

  function placeBread() {
    if (!state.delivering || state.arrivalAction !== 'place') return;
    state.arrivalAction = null;
    state.targetX = null;
    state.targetDepth = null;
    setCharacterClass('holding');
    heldBread.style.transition = 'left .55s ease-out, top .55s ease-out, transform .55s ease-out';
    heldBread.style.left = '75%';
    heldBread.style.top = '42%';
    heldBread.style.transform = 'translate(-50%,-50%) scale(.62)';
    setTimeout(() => {
      heldBread.classList.remove('visible');
      heldBread.style.transition = '';
      heldBread.style.transform = '';
      state.carrying = false;
      state.delivering = false;
      updateKissButton();
      state.score += 1;
      tableBreads.querySelectorAll('img')[state.carriedTableIndex]?.classList.remove('fallen');
      state.carriedTableIndex = null;
      syncHud(); syncCharacter();
      setCharacterClass('idle');
      setInstruction('עוד חלות עלולות ליפול. נוגעים בזו שרוצים להציל.');
      popScore('+1');
      fx('tap'); setTimeout(() => fx('score', false), 90);
      addCharge(1);

    }, 570);
  }

  const music = new Audio('assets/battle-music.mp3'); music.loop = true; music.volume = .4; music.preload = 'none';
  const MUSIC_LEVEL = .4;
  function ensureCtx() {
    try {
      if (!state.audio) state.audio = new (window.AudioContext || window.webkitAudioContext)();
      if (state.audio.state === 'suspended') state.audio.resume();
      return state.audio;
    } catch (_) { return null; }
  }
  // music and effects go through one limiter, so together they can never clip; music volume also works on iPhones this way
  function audioGraph() {
    const ctx = ensureCtx(); if (!ctx || !window.ChallahSfx) return null;
    if (!state.graph) {
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -5; limiter.knee.value = 0; limiter.ratio.value = 20; limiter.attack.value = .001; limiter.release.value = .12;
      limiter.connect(ctx.destination);
      const musicGain = ctx.createGain(); musicGain.gain.value = MUSIC_LEVEL; musicGain.connect(limiter);
      let routed = false;
      try { ctx.createMediaElementSource(music).connect(musicGain); music.volume = 1; routed = true; } catch (_) {}
      state.graph = {limiter, musicGain, routed};
      state.fx = window.ChallahSfx.create(ctx, limiter);
    }
    return state.graph;
  }
  function fx(name, ...args) {
    if (!state.musicOn) return;
    const g = audioGraph(); if (!g) return;
    try { state.fx[name](...args); } catch (_) {}
  }
  // the music steps back for a moment under big sounds
  function duck(depth, ms) {
    const g = state.graph; if (!g || !g.routed) return;
    const t = state.audio.currentTime;
    g.musicGain.gain.cancelScheduledValues(t); g.musicGain.gain.setTargetAtTime(MUSIC_LEVEL * depth, t, .015);
    g.musicGain.gain.setTargetAtTime(MUSIC_LEVEL, t + ms / 1000, .3);
  }
  // iPhones only let a sound start from a tap: the first tap on the entrance unlocks it for the whole game
  function unlockAudio() {
    if (state.unlocked) return; state.unlocked = true;
    audioGraph();
    try {
      music.muted = true; const p = music.play();
      if (p) p.then(() => { music.pause(); music.currentTime = 0; music.muted = false; }).catch(() => { music.muted = false; });
    } catch (_) { music.muted = false; }
  }
  try { state.musicOn = localStorage.getItem('challah-music') !== 'off'; } catch (_) {}
  function startMusic() { $('music-button').hidden = false; syncMusicButton(); if (state.musicOn) { audioGraph(); music.play().catch(() => {}); } }
  function syncMusicButton() { $('music-button').textContent = state.musicOn ? '🔊' : '🔇'; $('music-button').setAttribute('aria-label', state.musicOn ? 'השתקת מוזיקה' : 'הפעלת מוזיקה'); }
  $('music-button').addEventListener('click', () => { state.musicOn = !state.musicOn; try { localStorage.setItem('challah-music', state.musicOn ? 'on' : 'off'); } catch (_) {}
    syncMusicButton(); if (state.musicOn) { audioGraph(); music.play().catch(() => {}); } else { music.pause(); if (state.fx) state.fx.windOff(); } });
  document.addEventListener('visibilitychange', () => { if (document.hidden) music.pause(); else { ensureCtx(); if (state.musicOn && state.phase === 'playing') music.play().catch(() => {}); } });
  // Super move: every five challot returned charge "בל תשחית" — every challah on the floor goes back to the table at once.
  function addCharge(n) {
    state.charge = Math.min(SUPER_AT, state.charge + n);
    $('super-fill').style.width = `${state.charge / SUPER_AT * 100}%`;
    const ready = state.charge >= SUPER_AT; $('super-button').disabled = !ready; $('super-button').classList.toggle('ready', ready);
  }
  function superMove() {
    if (state.charge < SUPER_AT || state.phase !== 'playing' || state.paused) return;
    state.charge = 0; addCharge(0);
    const title = $('super-title'); title.classList.remove('show'); void title.offsetWidth; title.classList.add('show');
    stage.classList.add('super'); setTimeout(() => stage.classList.remove('super'), 1600);
    fx('superMove'); duck(.2, 1500);
    const saved = [...state.breads];
    if (state.targetBread) { state.targetBread = null; state.targetX = null; state.targetDepth = null; }
    state.breads = [];
    saved.forEach((bread, k) => {
      const slot = tableBreads.querySelectorAll('img')[bread.tableIndex];
      const sb = stage.getBoundingClientRect(), tb = (slot || tableBreads).getBoundingClientRect();
      bread.element.style.transition = `left .7s ${k * .08}s cubic-bezier(.3,0,.2,1), top .7s ${k * .08}s cubic-bezier(.3,0,.2,1), transform .7s ${k * .08}s, opacity .3s ${.6 + k * .08}s`;
      bread.element.style.left = `${(tb.left + tb.width / 2 - sb.left) / sb.width * 100}%`;
      bread.element.style.top = `${(tb.top + tb.height / 2 - sb.top) / sb.height * 100}%`;
      bread.element.style.transform = 'translate(-50%,-50%) rotate(720deg) scale(.6)'; bread.element.style.opacity = '0';
      setTimeout(() => { bread.element.remove(); slot?.classList.remove('fallen'); }, 900 + k * 80);
    });
    if (saved.length) { state.score += saved.length; syncHud(); popScore(`+${saved.length}`); }
    track('super-' + saved.length);
  }
  $('super-button').addEventListener('click', superMove);

  function syncLives() {
    $('lives').innerHTML = Array.from({length: LIVES}, (_, i) => `<img src="assets/challah.webp" alt="" class="${i < state.lives ? '' : 'gone'}">`).join('');
  }
  function popScore(text) {
    const el = document.createElement('div'); el.className = 'score-pop'; el.textContent = text;
    el.style.left = `${state.x}%`; el.style.top = `${mouthY() - 6}%`; stage.appendChild(el); setTimeout(() => el.remove(), 1100);
  }
  function loseBread(bread) {
    state.breads = state.breads.filter((b) => b !== bread);
    if (state.targetBread === bread) { state.targetBread = null; state.targetX = null; state.targetDepth = null; }
    bread.element.classList.add('lost'); setTimeout(() => bread.element.remove(), 700);
    state.lives -= 1; syncLives(); syncHud();
    fx('lose');
    setToast(state.lives > 0 ? ['חוק חמש השניות! החלה נפסלה.', 'אוי. היא כבר לא כשרה לשולחן.', 'זה כבר כפרת עוונות.'][state.lives % 3] : 'שלוש חלות נפסלו…', 1700);
    // a fresh challah comes out of the oven to its place on the table
    const slot = tableBreads.querySelectorAll('img')[bread.tableIndex];
    setTimeout(() => slot?.classList.remove('fallen'), 2600);
    if (state.lives <= 0) endRound();
  }
  function endRound() {
    state.phase = 'over'; state.paused = false;
    const best = Math.max(state.best, state.score); const record = state.score > state.best && state.score > 0; state.best = best;
    try { localStorage.setItem('challah-best', String(best)); } catch (_) {}
    $('over-score').textContent = state.score;
    $('over-best').textContent = record ? 'שיא חדש!' : `השיא שלך: ${best}`;
    $('over-line').textContent = state.score >= 20 ? 'צדיקה. פשוט צדיקה.' : state.score >= 10 ? 'השולחן שלך מכובד.' : state.score >= 4 ? 'יש למה לחזור בשבת הבאה.' : 'צאי לחל״ת כפרה.';
    $('game-over').hidden = false; $('pause-button').hidden = true;
    doorClips.stop();
    music.pause(); try { music.currentTime = 0; } catch (_) {}
    fx('windOff'); setTimeout(() => fx('gameOver'), 250);
    track('score-' + (state.score >= 20 ? '20+' : state.score >= 10 ? '10-19' : state.score >= 4 ? '4-9' : '0-3'));
    updateKissButton();
  }
  function restart() {
    state.breads.forEach((b) => b.element.remove());
    Object.assign(state, {breads: [], score: 0, lives: LIVES, carrying: false, lifting: false, kissing: false, delivering: false,
      targetBread: null, targetX: null, targetDepth: null, arrivalAction: null, gameTime: 0, nextHit: 1.6, x: 50, depth: 0, level: 0, paused: false, phase: 'playing'});
    tableBreads.querySelectorAll('img').forEach((i) => i.classList.remove('fallen'));
    heldBread.classList.remove('visible');
    $('game-over').hidden = true; $('pause-button').hidden = false;
    doorClips.start();
    state.charge = 0; addCharge(0); if (state.musicOn) music.play().catch(() => {}); if (state.backDoorOpen) fx('windOn');
    syncLives(); syncHud(); syncCharacter(); setCharacterClass('idle'); updateKissButton();
    setInstruction('נוגעים בחלה שנפלה. יש לה חמש שניות.');
    track('replay');
  }
  // Ortal's corridor behind the back door: the fight loops; a kiss plays "open" once and holds its last frame;
  // the next kiss plays "close" once and returns to the fight. Each switch is a short cross-fade between preloaded players.
  // If the clips cannot play, the painted door halves stay and work as before.
  const doorClips = (() => {
    const box = $('back-door');
    const clips = {};
    box.querySelectorAll('.door-clip').forEach((video) => { video.muted = true; clips[video.dataset.clip] = video; });
    let current = null, busy = false, failed = false, running = false, layer = 0, zapTimer = null;
    const fail = () => { failed = true; busy = false; box.classList.remove('video-on'); Object.values(clips).forEach((v) => { v.classList.remove('on'); v.pause(); }); };
    const zap = () => { box.classList.remove('zap'); void box.offsetWidth; box.classList.add('zap'); };
    function show(name) {
      const next = clips[name], previous = current && clips[current];
      current = name;
      try { next.currentTime = 0; } catch (_) {}
      const p = next.play();
      const reveal = () => {
        if (current !== name) return;
        next.style.zIndex = String(++layer);
        next.classList.add('on');
        box.classList.add('video-on');
        if (previous && previous !== next) setTimeout(() => { if (current !== previous.dataset.clip) { previous.classList.remove('on'); previous.pause(); } }, 120);
      };
      if (p && p.then) p.then(reveal, fail); else reveal();
    }
    // the fight's loop point is an edit, not a seamless loop: a soft red laser glow covers the cut
    clips.fight.addEventListener('timeupdate', () => {
      const v = clips.fight, left = v.duration - v.currentTime;
      if (current === 'fight' && !zapTimer && left < .35) zapTimer = setTimeout(() => { zapTimer = null; if (current === 'fight') zap(); }, Math.max(0, left - .12) * 1000);
    });
    clips.open.addEventListener('ended', () => { busy = false; });
    clips.close.addEventListener('ended', () => { if (current === 'close') show('fight'); busy = false; });
    Object.values(clips).forEach((v) => v.addEventListener('error', fail));
    return {
      get busy() { return !failed && busy; },
      start() {
        running = true;
        if (failed) return;
        if (!current) return show('fight');
        if (!clips[current].ended) clips[current].play().catch(() => {});
      },
      stop() { running = false; if (current) clips[current].pause(); },
      set(open) {
        if (failed || !running) return;
        busy = true;
        show(open ? 'open' : 'close');
      }
    };
  })();

  // Shedai opens with a kiss — so every kiss also opens (and the next one closes) the door at the end of the corridor.
  function toggleBackDoor() {
    if (doorClips.busy) return; // the door is mid-way through opening or closing; one kiss cannot trigger it twice
    state.backDoorOpen = !state.backDoorOpen;
    doorClips.set(state.backDoorOpen);
    $('back-door').classList.toggle('open', state.backDoorOpen);
    fx(state.backDoorOpen ? 'doorOpen' : 'doorClose'); fx(state.backDoorOpen ? 'windOn' : 'windOff');
  }
  $('again-button').addEventListener('click', restart);
  $('share-button').addEventListener('click', async () => {
    const url = new URL('/game-challah/', location.href).href, n = state.score, texts = [`הצלתי ${n} חלות באמצע קרב חלל. תורך.`, `איזה משחק חלה על הזמן. הצלתי ${n} חלות — תורך.`, `כל אם ובת צריכות להציל לפחות חלה אחת. אני הצלתי ${n}.`, `קרב חלה! הצלתי ${n} חלות. תורך.`], text = texts[Math.floor(Math.random() * texts.length)];
    try { if (navigator.share) await navigator.share({title: 'בשביל החלה', text, url}); else { await navigator.clipboard.writeText(text + '\n' + url); $('share-button').textContent = 'הקישור הועתק ✓'; } } catch (_) {}
  });

  function onKiss(source) {
    state.micKiss = source === 'mic';
    if (state.micKiss) { if (state.phase !== 'playing') fx('confirm'); }
    else if (state.phase === 'boarding-closed' || state.phase === 'boarding-open') fx('smooch');
    if (state.phase === 'boarding-closed') return openEntrance();
    if (state.phase === 'boarding-open') return closeEntranceAndBoard();
    if (state.phase !== 'playing' || state.paused) return;
    if (state.lifting || state.kissing || state.delivering) return;
    if (state.carrying) return kissChallah();
  }
  stage.addEventListener('pointerdown', (event) => {
    if (state.phase !== 'playing' || state.carrying || state.lifting || state.kissing || state.delivering || state.paused) return;
    const bounds = stage.getBoundingClientRect();
    const touchX = (event.clientX - bounds.left) / bounds.width * 100;
    const touchY = (event.clientY - bounds.top) / bounds.height * 100;
    const candidate = state.breads.map((bread) => ({bread, distance: Math.hypot((bread.x - touchX) / 12, (bread.y - touchY) / 7)}))
      .sort((a, b) => a.distance - b.distance)[0];
    if (candidate?.distance < 2.4) chooseBread(candidate.bread);
  });
  $('mic-button').addEventListener('click', () => { unlockAudio(); enableMicrophone(); });
  $('skip-button').addEventListener('click', () => { unlockAudio(); armEntrance(false); });
  doorTouchButton.addEventListener('click', () => onKiss('button'));
  kissButton.addEventListener('click', () => onKiss('button'));
  $('pause-button').addEventListener('click', () => {
    state.paused = !state.paused;
    if (state.paused) music.pause(); else if (state.musicOn) music.play().catch(() => {});
    if (state.paused) doorClips.stop(); else doorClips.start();
    $('pause-button').textContent = state.paused ? 'המשך' : 'השהיה';
    setInstruction(state.paused ? 'המשחק מושהה' : (state.carrying ? 'בת חן מחכה לנשיקה שלכם.' : 'נוגעים בחלה שרוצים להציל.'));
  });

  function frame(now) {
    const dt = Math.min((now - state.lastFrame) / 1000, .05);
    state.lastFrame = now;
    sampleMicrophone(now);
    if (state.phase === 'playing' && !state.paused) {
      state.gameTime += dt;
      if (state.gameTime >= state.nextHit) {
        shipHit();
        state.nextHit = state.gameTime + hitGap();
      }
      const dx = state.targetX === null ? 0 : state.targetX - state.x;
      const dd = state.targetDepth === null ? 0 : state.targetDepth - state.depth;
      const movingX = Math.abs(dx) > .25 ? Math.sign(dx) : 0;
      const movingDepth = Math.abs(dd) > .007 ? Math.sign(dd) : 0;
      if ((movingX || movingDepth) && !state.kissing && !state.lifting) {
        state.x = Math.max(13, Math.min(82, state.x + movingX * Math.min(Math.abs(dx), dt * 50)));
        state.depth = Math.max(0, Math.min(1, state.depth + movingDepth * Math.min(Math.abs(dd), dt * 1.15)));
        syncCharacter();
        setCharacterClass('walk');
      } else if (!state.kissing && !state.carrying && !state.lifting && !batchen.classList.contains('idle')) {
        setCharacterClass('idle');
      }
      if (state.targetX !== null && Math.abs(state.targetX - state.x) <= .25) state.targetX = null;
      if (state.targetDepth !== null && Math.abs(state.targetDepth - state.depth) <= .007) state.targetDepth = null;
      if (state.delivering && state.arrivalAction === 'place' && state.targetX === null && state.targetDepth === null) placeBread();
      for (const bread of state.breads) {
        if (!bread.landed) {
          bread.flight = Math.min(1, bread.flight + dt / bread.flightDuration);
          const t = bread.flight;
          const ease = t * t * (3 - 2 * t);
          bread.x = bread.startX + (bread.landingX - bread.startX) * ease;
          bread.y = bread.startY + (bread.landingY - bread.startY) * t * t;
          bread.element.style.left = `${bread.x}%`;
          bread.element.style.top = `${bread.y}%`;
          bread.element.style.transform = `translate(-50%,-50%) rotate(${t * (bread.landingX < bread.startX ? -95 : 85)}deg)`;
          bread.element.style.width = `${9 + t * (3 + (bread.landingY - 72) * .23)}%`;
          if (t >= 1) {
            bread.landed = true;
            fx('thud');
            bread.landedAt = state.gameTime;
            const ring = document.createElement('span'); ring.className = 'rule-ring'; bread.element.appendChild(ring); bread.ring = ring;
            bread.element.style.transform = '';
            bread.element.classList.remove('falling');
            bread.element.classList.add('landed');
            syncHud();
          }
        }
      }
      for (const bread of [...state.breads]) {
        if (!bread.landed || bread === state.targetBread && Math.abs(bread.x - state.x) < 6) continue;
        const left = 1 - (state.gameTime - bread.landedAt) / floorLimit();
        if (bread.ring) { bread.ring.style.setProperty('--left', Math.max(0, left).toFixed(3)); const n = String(Math.max(1, Math.ceil(left * floorLimit()))); if (bread.ring.textContent !== n) bread.ring.textContent = n; }
        if (left <= .3) bread.element.classList.add('urgent');
        const secLeft = Math.ceil(left * floorLimit());
        if (secLeft <= 2 && secLeft >= 1 && bread.lastSec !== secLeft && performance.now() - (state.lastTick || 0) > 300) { bread.lastSec = secLeft; state.lastTick = performance.now(); fx('tick', secLeft === 1); }
        if (left <= 0) loseBread(bread);
      }
      if (!state.carrying && !state.lifting && !state.kissing && state.targetBread) {
        const selected = state.targetBread;
        if (selected.landed && Math.abs(selected.x - state.x) < 2.2 && Math.abs(selected.y - feetY()) < 2.7) pickUp(selected);
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  window.gameDebug = {
    state,
    hit: shipHit,
    kiss: () => onKiss('button'),
    charge: (n) => addCharge(n)
  };
})();
