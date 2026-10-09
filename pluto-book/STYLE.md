# "פלוטו – הכוכב שביטלו אותו" — style bible + engine API for page builders

You are building ONE page (a JS scene file) of a ~68 s animated children's picture-book film, drawn 100% in code
(HTML canvas 2D + one WebGL shader, rendered headless frame-by-frame). Narration is the author's own recording (Hebrew).
The film lives INSIDE A BOOK: every page is a printed page of an elegant children's science atlas
("Atlas Coelestis Puerorum, vol. IX"). The space inside each illustrated plate is ALIVE.

Project dir (PB): /tmp/claude-0/-home-user-a-musing/e35e850f-2fd0-564a-bd19-93ae131a79e2/scratchpad/pb
Reference frames already approved in look: PB/checks/s0_01.00.jpg (cover), PB/checks/s1_05.60.jpg (avenue test), PB/checks/faces.jpg (Pluto's relief face expressions).
LOOK AT THEM before you start (Read tool on the .jpg).

## The client's art direction (non-negotiable — these are the author's own words, paraphrased)
- It must NOT look like cheap animation effects or generic "AI art". Design is central to the experience.
- The vibe is an elegant illustrated book / magazine with a SCIENTIFIC flavour for kids: think vintage celestial atlas
  meets modern editorial design. Fine gold rules, engraved stars, instrument line-art, Latin captions in classical caps
  (V for U: PLVTO, SATVRNVS), Hebrew set in a literary serif.
- Pluto is anthropomorphised gently and elegantly: his FACE IS THE LANDSCAPE — two craters and a valley in his ice,
  revealed by light and shadow. NEVER draw cartoon eyes, pupils, catch-lights, mouths or blush on top of him. Expressions
  come only from the relief parameters (face:{...}) and from LIGHT.
- "Use space as our production crew": the things around Pluto (a burning meteor passing, the red flash of the stamp,
  a sunrise, Charon's shadow, the comet tail, a nebula drifting past) move light and colour over him — and the changing light
  is what turns his smile into sadness or back. Motivate every emotional change with something happening in space.
- Children's story: warm, magical, a little funny, emotionally clear. Parents should enjoy it too.
- Hebrew book: reading direction and page turns go right-to-left. Camera journeys tend to move right -> left.

## Hard bans (cheap / AI-looking)
No lens flares, no bokeh blobs, no big soft "glow" halos, no rainbow/neon gradients, no generic particle explosions,
no drop-shadowed cartoon text, no emoji-like shapes, no stock "sparkle burst". Glints are tiny and engraved (glint()).
Motion should be calm and purposeful (ease in/out), with one clear focus at a time. No camera shake except a short
physical impact (stamp). Keep saturation restrained: deep ink blue, cream, gold, muted teal/rose/ochre, stamp red.

## Palette (core.js constants)
INK [60,40,25] dark brown ink · SEPIA [138,106,69] · GOLD [176,132,58] · GOLD_L [226,194,122] · STAMP_RED [196,48,56]
Plate night sky comes from SPACE (deep ink blue with soft teal/rose/ochre washes). Paper is cream.

## Typography (fonts are loaded; use these exact CSS names)
- 'Frank' (Frank Ruhl Libre, Hebrew serif, weights 300–900) — any Hebrew in the illustration. e.g. `500 40px Frank`.
- 'Cinzel' (classical Roman caps) — Latin captions/labels, ALWAYS with letterSpacing (e.g. g.letterSpacing='5px'), V for U.
- 'Cormorant' italic/normal — small scientific annotations ("fig. 2", "anno MCMXXX", numbers).
- 'Gveret' (Gveret Levin, Hebrew handwriting) — ONLY for the astronomer's speech bubbles / pencil notes in the margin.
- Never use Fredoka/Suez/Rubik. Set g.direction='rtl' for Hebrew, 'ltr' for Latin.
- DO NOT draw the narration text: the engine already draws the narration line under the plate, word by word in sync.

## Page layout (px, page = 1920x1080)
PAGE = {IX:240, IY:74, IW:1440, IH:810}: the plate. Your `ill(g, n, lt)` draws the plate's illustration into a
1440x810 canvas (origin = plate's top-left). The engine then composites it, adds paper grain, the fine gold/ink frame,
your caption (scene.plate = {lat, he}), the running header, the folio (scene.folio) and the narration line (y≈962).
Optional `over(p, n, lt)` draws on the WHOLE page (1920x1080) after everything — use it for things that live on the
paper outside the plate (the astronomer drawn as an ink figure in the margin, a comet tail breaking out of the plate,
pencil annotations). Keep the bottom band y>900 free (narration text) except brief, deliberate moments.

## Time
n = narration time in seconds (the audio). lt = n - scene.start. Everything must be a pure function of n (deterministic):
NEVER use Math.random/Date/performance.now; use mulberry(seed), hash2, vnoise2, fbm2. Film time = n + 2.0.
Word timings: PB/audio/lines.json (each line: text, s, e, words[{w,s,e}]). Sync key beats to the exact word times.
Helpers: win(n,a,b) smooth 0→1 between a..b; pulse(n,a,b,c,d) rise a..b, fall c..d; bump(n,t0,dur) 0→1→0;
ease, easeOut, easeIn, easeBack, elastic, clamp, lerp, mixc, rgba(c,a), canvas(w,h).

## Engine API (globals; read the source in PB/*.js for details)
- SPACE.draw(g, o, x=0,y=0,w=1440,h=810): the living sky. o: {t:n, cam:[x,y] (screen-height units, parallax), zoom,
  neb (nebula density .5), galx (galaxy amount .8), gpos:[x,y], warm (0..1 golden mood), cold (0..1 blue-grey mood),
  gray (0..1 desaturate), red (0..1 red wash), gold (golden clouds), bright (1), hue (radians), swirl (spin smear amount,
  around swc:[x,y]), warp (funhouse lens, around wpc:[x,y], radius wpr)}. Coordinates: centre (0,0), y down, 1 = plate height.
- STARS.draw(g, {t, cam, zoom, alpha, dim, swirl, swc, trail (radians of circular star trails, for spinning)}, w, h)
- DUST.draw(g, {t, alpha, vx, vy, cam}, w, h): fine drifting motes (subtle).
- glint(g, x, y, size, alpha, col) / sparkle(): tiny engraved 4-point star.
- drawPluto(g, x, y, r, o): Pluto (painted sphere, relief face). o: {spin (rad; face turns away/returns), light:[lx,ly]
  (direction light comes FROM, screen space, |v|<1; e.g. [-.7,-.45] upper-left), lightCol:[r,g,b] multipliers (e.g. [1,.75,.7]),
  amb (ambient 0..1), light2:{dir:[x,y], col:[r,g,b] 0-255, k (strength ~0.3..1.2)} a second coloured light (meteor, stamp flash,
  sunrise, inner warmth), glow (inner warmth 0..1), gold (0..1 turns golden), gray (0..1), atm (blue haze 0..1, default 1),
  squash:[sx,sy], rot, alpha, decal(g2,cx,cy,r) (draw onto his surface, clipped by you), face:{...} }.
  face: {smile -1..1, open 0..1 (0 = closed creases), sad 0..1, brow -1..1 (-1 determined, +1 worried), O 0..1 (gasp),
  look:[x,y], relief (strength, default 1)}. The face only reads under side/raking light; flat frontal light hides it
  (use that dramatically!). Cost grows with r² — keep r <= 330 in the plate.
- drawCharon(g, x, y, r, o): his moon (grey with a red polar cap at the top). Same options (no face by default).
- drawPlanet(g, kind, x, y, r, o): 'mercury','venus','earth','mars','jupiter','saturn','uranus','neptune' (+ rings).
- drawSun(g, x, y, r, a, t).
- AVENUE.draw(g, n, cam={x,y,z}, o): the "Via Stellarum" (שדרת הכוכבים): planets above walk-of-fame plaques. World units;
  Pluto at x=-880 (AVENUE.pluto(n,o) gives {x,y,r}); AVENUE.S(x,y,cam) world→plate px. o: {pluto:{...drawPluto opts},
  plutoPos, plutoScale, hidePluto, charon:false, plaque:{pluto:{gold, crossed, cracked, glow}}, fans (comet visitors 0..1),
  dim, gray, space:{...SPACE opts}, beforePluto(g,cam), afterPluto(g,cam), afterPlaque(g,X,Y,cam)}.
- drawPlaque(g, x, y, w, {lat:'PLVTO', he:'פלוטו'}, {persp, gold, crossed, cracked, glow, alpha}).
- drawAstronomer(g, x, y, s, {pose:'stand'|'scope'|'stamp'|'point', face:±1, blink, talk, arm, stampScale, onDark, bob}):
  the antagonist — a tiny pompous bureaucrat-astronomer drawn as an INK ILLUSTRATION (sepia lines + light wash).
  He belongs to the paper/margin world (draw him in over() on the cream paper, ~60–160 px tall). Use onDark:true only if
  he must appear over the dark plate.
- drawTelescope(g, x, y, len, ang, {onDark}).
- drawStampTool(g, x, y, s, rot) (the rubber stamp object), drawStampMark(g, x, y, scale, rot, alpha, {text:'מבוטל', glow})
  (red ink mark; scale 1 = 980 px wide).
- drawTag(g, ax, ay, len, swing, s, text='מתחזה', alpha): luggage tag on a string ("מתחזה" + "IMPOSTOR").
- drawBubble(g, x, y, w, h, tx, ty, text, {alpha, scale, size, font}) paper speech bubble (handwritten).
- drawLabel(g, x, y, text, size, col, {font, align, rot, alpha, glow, stroke}) generic label.
- star5(g, x, y, R, r) path of a 5-point star. renderIll(id, n) → canvas of another scene's plate (for custom transitions).

## Scene file contract
File: PB/scenes/sN.js. Wrap EVERYTHING in an IIFE so names never collide with other pages:
```js
(() => {
  // private helpers here (prefix not needed inside the IIFE)
  SCENE({ id: 'sN', start: <given>, trans: <given>, tdur: <given>, folio: N,
    plate: { lat: 'TABVLA N · ...', he: '...' },
    ill(g, n, lt) { /* 1440x810 plate */ },
    over(p, n, lt) { /* optional, whole page */ } });
})();
```
Keep start/trans/tdur exactly as given (the timeline is shared). Do NOT edit any other file (core/space/bodies/props/
avenue/film.html/other scenes). If a shared helper is missing, write a private one inside your IIFE.

## Rendering & checking (do this a lot — look at every frame you render)
cd PB && python3 shot.py sN <n1> <n2> ...   → PB/checks/sN_<n>.jpg + PB/checks/sN_sheet.jpg ; prints seconds/frame.
Frames must render in < 2.5 s each. Syntax check: node --check scenes/sN.js.
To see the page-turn into your page: python3 shot.py --film <F> ... (F = n + 2.0).
Look at the frames (Read the .jpg). Judge them as an art director: is Pluto's emotion readable? is the beat in sync with the
word being spoken? is it elegant, not cheap? is there one clear focus? would a child understand what happens?
