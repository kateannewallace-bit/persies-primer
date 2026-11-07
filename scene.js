/* The beach: a big lizard, Froggy riding on its back, and a little crab who keeps trying to eat the lizard.
   Every word read: the crab tries, and the lizard is too big. End of a round: the lizard eats the crab. */
(function () {
  const C = {
    liz: '#7fb88a', lizDark: '#4f8560', lizBelly: '#cfe8c4', mouth: '#7a2e44',
    frog: '#a8dc6c', frogDark: '#6a9d3a', frogBelly: '#e8f5c8',
    crab: '#f2876f', crabDark: '#b8513f', eye: '#f8efea', pupil: '#2b1a21',
    sand: 'rgba(210,173,140,.30)', sandLine: '#d2ad8c', bow: '#f4b4c4', ink: '#4a2f3a',
  };

  function frogSvg() { // origin at Froggy's bottom middle
    return `<g class="frog">
      <ellipse cx="-17" cy="-6" rx="13" ry="8" fill="${C.frogDark}"/><ellipse cx="17" cy="-6" rx="13" ry="8" fill="${C.frogDark}"/>
      <ellipse cx="0" cy="-19" rx="21" ry="17" fill="${C.frog}"/>
      <ellipse cx="0" cy="-13" rx="13" ry="9" fill="${C.frogBelly}"/>
      <circle cx="-10" cy="-35" r="8.5" fill="${C.frog}"/><circle cx="10" cy="-35" r="8.5" fill="${C.frog}"/>
      <circle cx="-10" cy="-36" r="5.5" fill="${C.eye}"/><circle cx="10" cy="-36" r="5.5" fill="${C.eye}"/>
      <circle class="fpupil" cx="-11" cy="-36" r="3" fill="${C.pupil}"/><circle class="fpupil" cx="9" cy="-36" r="3" fill="${C.pupil}"/>
      <path d="M-9 -24 Q0 -18 9 -24" fill="none" stroke="${C.frogDark}" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="-14" cy="-24" r="3" fill="${C.bow}" opacity=".7"/><circle cx="14" cy="-24" r="3" fill="${C.bow}" opacity=".7"/>
      <path d="M-7 -8 L0 -11 L-7 -14 Z M7 -8 L0 -11 L7 -14 Z" fill="${C.bow}"/><circle cx="0" cy="-11" r="2" fill="${C.bow}"/>
      <ellipse cx="-8" cy="-1" rx="6" ry="3" fill="${C.frogDark}"/><ellipse cx="8" cy="-1" rx="6" ry="3" fill="${C.frogDark}"/>
    </g>`;
  }

  function lizardSvg() { // faces left; snout near x 6, feet on y 204
    return `<g class="liz">
      <path class="tail" d="M226 136 C280 136 330 150 360 186 C368 196 376 200 378 204 C362 203 346 195 330 182 C300 166 268 170 226 170 Z" fill="${C.liz}"/>
      <path d="M100 150 C94 170 86 190 82 204 L100 204 C104 190 110 176 118 160 Z" fill="${C.lizDark}"/>
      <path d="M200 156 C216 172 226 188 224 204 L240 204 C240 186 232 168 216 150 Z" fill="${C.lizDark}"/>
      <ellipse cx="160" cy="152" rx="78" ry="34" fill="${C.liz}"/>
      <ellipse cx="160" cy="170" rx="62" ry="13" fill="${C.lizBelly}"/>
      <g class="bulge"><ellipse cx="164" cy="176" rx="30" ry="15" fill="${C.lizBelly}" stroke="${C.lizDark}" stroke-width="2"/>
        <circle cx="140" cy="168" r="6" fill="${C.lizBelly}" stroke="${C.lizDark}" stroke-width="2"/><circle cx="188" cy="168" r="6" fill="${C.lizBelly}" stroke="${C.lizDark}" stroke-width="2"/></g>
      <circle cx="128" cy="134" r="6" fill="${C.lizDark}" opacity=".55"/><circle cx="196" cy="133" r="6" fill="${C.lizDark}" opacity=".55"/>
      <circle cx="112" cy="146" r="4" fill="${C.lizDark}" opacity=".55"/><circle cx="214" cy="148" r="4" fill="${C.lizDark}" opacity=".55"/>
      <ellipse cx="96" cy="140" rx="34" ry="26" fill="${C.liz}"/>
      <path d="M108 160 C100 176 88 192 80 202 L104 204 C110 192 118 178 128 166 Z" fill="${C.liz}"/>
      <path d="M186 168 C194 182 198 194 194 202 L216 204 C220 190 216 176 208 162 Z" fill="${C.liz}"/>
      <g fill="${C.liz}"><circle cx="76" cy="204" r="5"/><circle cx="86" cy="206" r="5"/><circle cx="98" cy="206" r="5"/>
        <circle cx="194" cy="205" r="5"/><circle cx="205" cy="206" r="5"/><circle cx="216" cy="206" r="5"/></g>
      <path d="M10 128 L84 136 L14 158 Z" fill="${C.mouth}"/>
      <path class="jaw" d="M10 132 L88 136 C78 152 54 158 34 157 C20 156 10 148 10 132 Z" fill="${C.liz}"/>
      <path class="head" d="M94 116 C82 98 54 92 30 99 C14 104 4 116 6 130 L90 138 C100 132 100 124 94 116 Z" fill="${C.liz}"/>
      <path d="M8 131 Q44 138 84 136" fill="none" stroke="${C.lizDark}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="16" cy="112" r="2.4" fill="${C.lizDark}"/>
      <circle cx="66" cy="124" r="6" fill="${C.bow}" opacity=".45"/>
      <circle cx="54" cy="107" r="11" fill="${C.eye}"/>
      <circle class="pupil" cx="51" cy="107" r="6" fill="${C.pupil}"/><circle cx="49" cy="105" r="1.8" fill="#fff"/>
      <path class="lid" d="M42 107 A12 12 0 0 1 66 107 Z" fill="${C.liz}"/>
      <g transform="translate(168 122)"><g class="frog-hop">${frogSvg()}</g></g>
    </g>`;
  }

  function crabSvg() { // origin at the middle of the crab's shell
    const legs = side => [[-18, 6, -36, 14, -40, 24], [-22, 0, -42, 4, -48, 14], [-14, 11, -26, 20, -28, 26]]
      .map(([a, b, c, d, e, f]) => `<path d="M${a * side} ${b} L${c * side} ${d} L${e * side} ${f}" fill="none" stroke="${C.crabDark}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
    const claw = side => `<g class="claw claw-${side < 0 ? 'r' : 'l'}">
      <path d="M${-22 * side} -8 L${-38 * side} -24" stroke="${C.crabDark}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="${-45 * side}" cy="-32" r="12" fill="${C.crab}" stroke="${C.crabDark}" stroke-width="2"/>
      <path class="notch" d="M${-45 * side} -32 L${-59 * side} -40 L${-57 * side} -27 Z" fill="var(--board, #4a2f3a)"/></g>`;
    return `<g class="crab"><g class="crab-idle">${legs(-1)}${legs(1)}
      <path d="M-9 -16 L-11 -30 M9 -16 L11 -30" stroke="${C.crabDark}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="-11" cy="-33" r="6.5" fill="${C.eye}"/><circle cx="11" cy="-33" r="6.5" fill="${C.eye}"/>
      <circle class="cpupil" cx="-10" cy="-33" r="3.2" fill="${C.pupil}"/><circle class="cpupil" cx="12" cy="-33" r="3.2" fill="${C.pupil}"/>
      ${claw(1)}${claw(-1)}
      <ellipse cx="0" cy="0" rx="31" ry="20" fill="${C.crab}" stroke="${C.crabDark}" stroke-width="2"/>
      <circle cx="-12" cy="-6" r="3" fill="#f8b4a4"/><circle cx="12" cy="-6" r="3" fill="#f8b4a4"/><circle cx="0" cy="-10" r="3" fill="#f8b4a4"/>
      <path d="M-7 5 Q0 10 7 5" fill="none" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round"/></g></g>`;
  }

  function svg(opts = {}) {
    return `<svg class="stage ${opts.small ? 'small' : ''}" viewBox="0 0 640 250" role="img" aria-label="A big lizard with Froggy the frog on its back, and a little crab">
      <path d="M0 210 Q160 204 320 210 T640 210 L640 250 L0 250 Z" fill="${C.sand}"/>
      <path d="M0 210 Q160 204 320 210 T640 210" fill="none" stroke="${C.sandLine}" stroke-width="2.5" stroke-dasharray="2 9" stroke-linecap="round"/>
      <g fill="${C.sandLine}" opacity=".6"><circle cx="40" cy="228" r="3"/><circle cx="190" cy="236" r="2.5"/><circle cx="300" cy="226" r="2"/><circle cx="520" cy="236" r="3"/><circle cx="610" cy="224" r="2"/></g>
      <path d="M22 212 C18 190 30 178 24 160 M30 212 C34 196 44 188 40 172" fill="none" stroke="${C.lizDark}" stroke-width="4" stroke-linecap="round" opacity=".6"/>
      <g transform="translate(250 6)">${lizardSvg()}</g>
      <g transform="translate(100 186)">${crabSvg()}</g>
      <g class="bubble"><path d="M372 10 h120 a20 20 0 0 1 20 20 v8 a20 20 0 0 1 -20 20 h-58 l-14 22 l-4 -22 h-44 a20 20 0 0 1 -20 -20 v-8 a20 20 0 0 1 20 -20z" fill="${C.eye}"/>
        <text class="bubble-text" x="432" y="43" text-anchor="middle">Too big!</text></g>
      <text class="gulp" x="280" y="72" text-anchor="middle">GULP!</text>
      <g class="burp"><circle cx="0" cy="0" r="20" fill="none" stroke="${C.eye}" stroke-width="3"/><text x="0" y="6" text-anchor="middle">burp</text></g>
    </svg>`;
  }

  /* ---------- sounds, made on the spot (no files to download) ---------- */
  let ac = null;
  const Sfx = { on: true };
  function ctx() { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } } if (ac.state === 'suspended') ac.resume(); return ac; }
  function tone(type, f0, f1, dur, vol = 0.18, delay = 0) {
    if (!Sfx.on) return; const a = ctx(); if (!a) return;
    const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  Sfx.step = () => tone('triangle', 900, 700, 0.04, 0.06);
  Sfx.snap = () => { tone('square', 1800, 600, 0.05, 0.12); tone('square', 1400, 500, 0.05, 0.1, 0.07); };
  Sfx.hop = () => tone('sine', 300, 700, 0.18, 0.15);
  Sfx.pop = () => tone('sine', 500, 900, 0.1, 0.14);
  Sfx.gulp = () => { tone('sine', 420, 70, 0.4, 0.3); tone('sine', 260, 60, 0.3, 0.2, 0.3); };
  Sfx.burp = () => { tone('sawtooth', 110, 70, 0.35, 0.12); tone('sine', 95, 60, 0.4, 0.2); };
  Sfx.chomp = () => tone('square', 220, 120, 0.06, 0.12);

  /* ---------- animation ---------- */
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const A = (el, kf, dur, o = {}) => el ? el.animate(kf, Object.assign({ duration: dur, fill: 'forwards', easing: 'ease-in-out' }, o)) : null;
  const tr = (x, y = 0, extra = '') => ({ transform: `translate(${x}px, ${y}px) ${extra}` });
  let runId = 0;

  function parts(root) {
    const q = s => root.querySelector(s), qa = s => [...root.querySelectorAll(s)];
    return { crab: q('.crab'), clawL: q('.claw-l'), clawR: q('.claw-r'), notches: qa('.notch'), cpupils: qa('.cpupil'),
      liz: q('.liz'), jaw: q('.jaw'), pupil: q('.pupil'), bulge: q('.bulge'), frog: q('.frog-hop'), fpupils: qa('.fpupil'),
      bubble: q('.bubble'), btext: q('.bubble-text'), gulp: q('.gulp'), burp: q('.burp') };
  }
  function reset(root) {
    runId++;
    if (!root) return;
    for (const a of root.getAnimations({ subtree: true })) if (!(window.CSSAnimation && a instanceof CSSAnimation)) a.cancel();
  }
  // walk sideways, like a crab, from x0 to x1
  function scuttle(p, x0, x1, dur) {
    const n = Math.max(4, Math.round(Math.abs(x1 - x0) / 22)), kf = [];
    for (let i = 0; i <= n; i++) kf.push(tr(x0 + (x1 - x0) * i / n, i % 2 ? -4 : 0, `rotate(${i % 2 ? 4 : -4}deg)`));
    kf[n] = tr(x1);
    for (let i = 0; i < n; i += 2) setTimeout(Sfx.step, dur * i / n);
    return A(p.crab, kf, dur, { easing: 'linear' }).finished;
  }
  function snap(p, times = 2) {
    for (let i = 0; i < times; i++) setTimeout(Sfx.snap, i * 260);
    p.notches.forEach(nt => A(nt, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(.1)' }, { transform: 'scaleY(1)' }], 260, { iterations: times, fill: 'none' }));
    return wait(260 * times);
  }
  function hopFrog(p, times = 2) {
    for (let i = 0; i < times; i++) setTimeout(Sfx.hop, i * 420);
    return A(p.frog, [tr(0, 0), tr(0, -26, 'rotate(-6deg)'), tr(0, 0, 'scale(1.08, .92)'), tr(0, 0)], 420, { iterations: times, fill: 'none' }).finished;
  }
  function showBubble(p, text) {
    p.btext.textContent = text; Sfx.pop();
    A(p.bubble, [{ opacity: 0, transform: 'scale(.3)' }, { opacity: 1, transform: 'scale(1.12)' }, { opacity: 1, transform: 'scale(1)' }], 380);
  }
  const hideBubble = p => A(p.bubble, [{ opacity: 1 }, { opacity: 0 }], 300);
  const look = (els, x, y, dur = 300) => els.forEach(el => A(el, [{ transform: `translate(${x}px, ${y}px)` }], dur));

  /* The crab tries to eat the lizard. Too big! Three ways, so it isn't the same every time. */
  async function tryEat(root, variant = 0, on = {}) {
    reset(root);
    const id = runId, p = parts(root), live = () => id === runId && root.isConnected;
    if (reduce()) { showBubble(p, 'Too big!'); on.bubble && on.bubble(); await wait(1600); if (live()) hideBubble(p); return; }
    const to = [168, 150, 155][variant % 3];
    look(p.fpupils, -3, 2); look([p.pupil], -3, 3);
    await scuttle(p, 0, to, 900); if (!live()) return;
    if (variant % 3 === 0) { // pinch the lizard's toe
      A(p.clawL, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(28deg)' }], 250);
      A(p.clawR, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-28deg)' }], 250);
      A(p.crab, [tr(to), tr(to + 12, -6)], 250);
      await snap(p, 3); look([p.pupil], -4, 5);
    } else if (variant % 3 === 1) { // jump up at the lizard's nose
      A(p.clawL, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(40deg)' }], 300);
      A(p.clawR, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-40deg)' }], 300);
      await A(p.crab, [tr(to), tr(to, 4, 'scale(1.1, .85)')], 220).finished; if (!live()) return;
      Sfx.hop(); look([p.pupil], -5, 0);
      await A(p.crab, [tr(to, 4), tr(to + 30, -70, 'rotate(-12deg)'), tr(to + 30, -70, 'rotate(-12deg)'), tr(to, 0)], 900, { easing: 'ease-out' }).finished;
      snap(p, 2);
    } else { // open the claws as wide as they go, and the lizard is still too big
      A(p.clawL, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-38deg)' }], 400);
      A(p.clawR, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(38deg)' }], 400);
      await A(p.crab, [tr(to), tr(to, -8, 'scale(1.18)'), tr(to, -8, 'scale(1.22) rotate(-4deg)'), tr(to, -8, 'scale(1.22) rotate(4deg)'), tr(to, -8, 'scale(1.2)')], 900).finished;
      await snap(p, 2);
      A(p.liz, [tr(0, 0), tr(-4, -6), tr(0, 0)], 400, { fill: 'none' });
    }
    if (!live()) return;
    showBubble(p, 'Too big!'); on.bubble && on.bubble(); hopFrog(p, 2);
    A(p.clawL, [{ transform: 'rotate(-10deg)' }], 300); A(p.clawR, [{ transform: 'rotate(10deg)' }], 300);
    look(p.cpupils, 0, 3);
    await wait(1300); if (!live()) return;
    hideBubble(p); look(p.cpupils, 0, 0); look([p.pupil], 0, 0); look(p.fpupils, 0, 0);
    A(p.clawL, [{ transform: 'rotate(0deg)' }], 300); A(p.clawR, [{ transform: 'rotate(0deg)' }], 300);
    await scuttle(p, to, 0, 800);
  }

  /* One more try... then the lizard eats the crab. Gulp! */
  async function eat(root, on = {}) {
    reset(root);
    const id = runId, p = parts(root), live = () => id === runId && root.isConnected;
    if (reduce()) { A(p.crab, [{ opacity: 0 }], 1); A(p.bulge, [{ transform: 'scale(1)' }], 1); on.gulp && on.gulp(); return; }
    look([p.pupil], -3, 3); look(p.fpupils, -3, 2);
    await scuttle(p, 0, 120, 800); if (!live()) return;
    A(p.clawL, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(30deg)' }], 250);
    A(p.clawR, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-30deg)' }], 250);
    await snap(p, 2); if (!live()) return;
    A(p.liz, [tr(0, 0), tr(-14, 4)], 350);
    await A(p.jaw, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-32deg)' }], 350).finished; if (!live()) return;
    look(p.cpupils, 0, -3, 150);
    await A(p.crab, [tr(120), tr(150, -50, 'scale(.7) rotate(-120deg)'), tr(160, -48, 'scale(.25) rotate(-260deg)')], 520, { easing: 'ease-in' }).finished;
    A(p.crab, [{ opacity: 1 }, { opacity: 0 }], 60);
    await A(p.jaw, [{ transform: 'rotate(-32deg)' }, { transform: 'rotate(0deg)' }], 140).finished; if (!live()) return;
    Sfx.chomp(); await A(p.jaw, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-9deg)' }, { transform: 'rotate(0deg)' }], 220, { iterations: 2 }).finished;
    Sfx.chomp(); A(p.liz, [tr(-14, 4), tr(0, 0)], 400);
    Sfx.gulp(); on.gulp && on.gulp();
    A(p.gulp, [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1.25)' }, { opacity: 1, transform: 'scale(1)' }, { opacity: 1, offset: .8 }, { opacity: 0, transform: 'scale(1)' }], 1600);
    await A(p.bulge, [{ transform: 'scale(0)' }, { transform: 'scale(1.3, 1.1)' }, { transform: 'scale(.9, 1.05)' }, { transform: 'scale(1)' }], 800).finished; if (!live()) return;
    look([p.pupil], 2, -2); hopFrog(p, 3); showBubble(p, 'Yum!');
    await wait(900); if (!live()) return;
    Sfx.burp();
    A(p.burp, [{ opacity: 0, transform: 'translate(262px, 136px) scale(.3)' }, { opacity: 1, transform: 'translate(236px, 100px) scale(1)' }, { opacity: 0, transform: 'translate(214px, 50px) scale(1.2)' }], 1400, { easing: 'ease-out' });
    A(p.liz, [tr(0, 0), tr(4, -3), tr(0, 0)], 300, { fill: 'none' });
    await wait(1200); if (!live()) return;
    hideBubble(p); look([p.pupil], 0, 0); look(p.fpupils, 0, 0);
  }

  window.Scene = { svg, tryEat, eat, reset, Sfx, frogSvg };
})();
