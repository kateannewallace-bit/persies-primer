/* ---------- helpers ---------- */
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const lc = s => s.toLowerCase();
const childName = () => (state.childName || '').trim();
const greet = s => childName() ? `${s}, ${childName()}!` : `${s}!`;

/* ---------- the book: words and sentences by lesson ---------- */
const LESSONS = window.LESSONS;
const MAXL = LESSONS.length;
const lessonAt = n => LESSONS.find(L => L.n === n) || LESSONS[0];
const IRREGULAR = new Set(LESSONS.flatMap(L => (L.irregular || '').split(/\s+/).filter(Boolean)));
const wordsOf = L => [...(L.words || '').split(/\s+/), ...(L.irregular || '').split(/\s+/)].filter(Boolean);
const wordsUpTo = n => LESSONS.filter(L => L.n <= n).flatMap(wordsOf);
const sentencesUpTo = n => LESSONS.filter(L => L.n <= n).flatMap(L => (L.sentences || []).map(s => ({ s, n: L.n })));
const lessonOfWord = w => (LESSONS.find(L => wordsOf(L).includes(w)) || {}).n || 1;
// Words the speech voice gets wrong get a spoken spelling.
const SAY_AS = { an: 'Ann', ax: 'axe' };
const sayAs = w => SAY_AS[w] || w;
// Letters spoken for the grown-up when a letter choice is right ("t, at").
const LETTER_SAY = { a: 'ay', x: 'ex' };

/* The games. Grown-ups choose which are on; a round mixes them. */
const GAMES = {
  read: { name: 'Read it to me', icon: '📖', levels: ['Words and sentences from the lesson'] },
  find: { name: 'Find the word', icon: '👀', levels: ['Two words to choose from', 'Three words', 'Three look-alike words'] },
  finish: { name: 'Finish the word', icon: '✏️', levels: ['Last letter, two to choose', 'Last letter, three to choose', 'First letter, three to choose', 'First or last letter, four to choose'] },
};
const GAME_KEYS = Object.keys(GAMES);

const HANDS = [
  'Play "crab says": say a word in slow sounds, "a… t", and your child says it fast, "at!" before the crab can pinch. Then swap.',
  'Write two of today\'s words in big letters in a tray of sand or salt, saying each sound as you write it. Blumenfeld pairs reading with writing from the first lesson.',
  'Make today\'s words with letter tiles or magnets: put a and t together and read it. Swap the t for an x: ax!',
  'Draw a crab and a lizard together. Write "at" next to them and let your child read it to Froggy.',
  'Point to a word in a book you are reading together that your child can sound out, like "at" or "an", and let them read just that word.',
];
const TIPS = [
  '<strong>Read it to me.</strong> Point under the word, left to right. Your child says the sounds and then the word. Tap ✓ when it\'s read. Stuck? Tap Help: the app says the word, your child says it back, and it comes back for review.',
  '<strong>Find the word.</strong> The app says a word and your child taps it. At the start the words differ only in the last letter, so it\'s real listening and looking, not guessing.',
  '<strong>Finish the word.</strong> The app says a word with one letter missing and your child picks the letter. This is the start of spelling, which the book teaches together with reading.',
  '<strong>No pictures.</strong> Like Alpha-Phonics, words never come with pictures, so they must be read, not guessed. The lizard, the crab and Froggy are only the reward.',
  '<strong>Short and happy.</strong> At three, three to five words is plenty. Stop while it\'s still fun.',
];

function defaultState() {
  return {
    childName: 'Persie', lesson: 1,
    on: { read: true, find: true, finish: false }, levels: { find: 1, finish: 1 }, rec: { find: [], finish: [] },
    readRec: [], words: {}, cards: [], cleared: 0, sessions: [], log: [],
    crabs: 0, total: 0, perSession: 5, voice: 'on', sfx: 'on', updatedAt: 0,
  };
}
function normalize(s) {
  const d = defaultState();
  s = Object.assign(d, s || {});
  for (const k of ['on', 'levels', 'rec']) s[k] = Object.assign(defaultState()[k], s[k]);
  s.lesson = Math.max(1, Math.min(MAXL, s.lesson | 0 || 1));
  return s;
}

/* ---------- storage: this device first, Supabase sync when a sync code is set ---------- */
const LS_KEY = 'persies-primer-v1';
const CODE_KEY = 'persies-primer-sync-code';
const CFG = window.CHALKBOARD_CONFIG || {};
const syncAvailable = !!(CFG.supabaseUrl && CFG.supabaseKey && window.crypto?.subtle);
function loadLocal() { try { const t = localStorage.getItem(LS_KEY); return t ? JSON.parse(t) : null; } catch (e) { return null; } }
function saveLocal() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {} }
let state = normalize(loadLocal());
const sync = { code: '', key: '', status: 'off', lastAt: 0, saving: false, dirty: false, error: '' };
try { sync.code = localStorage.getItem(CODE_KEY) || ''; } catch (e) {}

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function newCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const raw = [...bytes].map(b => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8)}`;
}
function cleanCode(c) {
  const raw = String(c).toUpperCase().replace(/[^A-Z0-9]/g, '');
  return raw.length === 12 ? `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8)}` : '';
}
// Same Supabase table as the other apps; the prefix keeps this app's rows separate.
async function keyFor(code) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('persies-primer:' + code));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
async function rpc(fn, body) {
  const res = await fetch(`${CFG.supabaseUrl}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: Object.assign({ apikey: CFG.supabaseKey, 'Content-Type': 'application/json' }, CFG.supabaseKey.startsWith('sb_') ? {} : { Authorization: `Bearer ${CFG.supabaseKey}` }),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${fn} failed (${res.status})`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
async function pushRemote() {
  if (!sync.key) return;
  if (sync.saving) { sync.dirty = true; return; }
  sync.saving = true;
  try { await rpc('chalkboard_save', { p_key: sync.key, p_data: state }); sync.status = 'ok'; sync.lastAt = Date.now(); sync.error = ''; }
  catch (e) { sync.status = 'error'; sync.error = navigator.onLine === false ? 'offline' : String(e.message || e); }
  sync.saving = false;
  if (screen === 'parent') render();
  if (sync.dirty) { sync.dirty = false; pushRemote(); }
}
async function pullRemote() {
  if (!sync.key) return;
  try {
    const remote = await rpc('chalkboard_get', { p_key: sync.key });
    sync.status = 'ok'; sync.lastAt = Date.now(); sync.error = '';
    if (remote && (remote.updatedAt || 0) > (state.updatedAt || 0)) { state = normalize(remote); saveLocal(); }
    else if (!remote || (state.updatedAt || 0) > (remote.updatedAt || 0)) pushRemote();
  } catch (e) { sync.status = 'error'; sync.error = navigator.onLine === false ? 'offline' : String(e.message || e); }
  if (screen === 'home' || screen === 'parent') render();
}
async function startSync(code) {
  sync.code = code;
  try { localStorage.setItem(CODE_KEY, code); } catch (e) {}
  sync.key = await keyFor(code);
  sync.status = 'syncing';
  await pullRemote();
}
function stopSync() {
  sync.code = ''; sync.key = ''; sync.status = 'off';
  try { localStorage.removeItem(CODE_KEY); } catch (e) {}
}
function save() { state.updatedAt = Date.now(); saveLocal(); pushRemote(); }
function initSync() {
  if (!syncAvailable) return;
  if (sync.code) startSync(sync.code);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') pullRemote(); });
  window.addEventListener('online', () => pullRemote());
}

/* ---------- speech ---------- */
const canSpeak = 'speechSynthesis' in window;
const VOICE_KEY = 'persies-primer-voice';
let voices = [];
function loadVoices() {
  try { voices = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)); } catch (e) { voices = []; }
  if (screen === 'parent') render();
}
function savedVoiceName() { try { return localStorage.getItem(VOICE_KEY) || ''; } catch (e) { return ''; } }
const NICE_VOICES = ['Samantha', 'Ava', 'Karen', 'Moira', 'Serena', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny'];
function chosenVoice() {
  const name = savedVoiceName();
  const exact = name && voices.find(v => v.name === name);
  if (exact) return exact;
  const score = v => (/enhanced|premium|natural/i.test(v.name) ? 0 : 1);
  for (const p of NICE_VOICES) {
    const hits = voices.filter(v => v.name.startsWith(p)).sort((a, b) => score(a) - score(b));
    if (hits.length) return hits[0];
  }
  return null;
}
// A list speaks each part on its own, so a reading word is never run into the words around it
// ("Find the word." … "an.", not "find the wordan"). Word parts ({ w }) are said a little slower.
function say(t, rate = 0.85) {
  if (!canSpeak || !t) return;
  try {
    speechSynthesis.cancel();
    const v = chosenVoice();
    for (const part of [].concat(t)) {
      const isWord = typeof part === 'object';
      const u = new SpeechSynthesisUtterance(isWord ? `${sayAs(part.w)}.` : part);
      if (v) { u.voice = v; u.lang = v.lang; }
      u.rate = isWord ? Math.min(rate, 0.72) : rate; u.pitch = 1.08;
      speechSynthesis.speak(u);
    }
  } catch (e) {}
}
// Questions follow the read-aloud setting; the word itself is always spoken in Find and Finish (hearing it is the game).
const talk = t => { if (state.voice !== 'off') say(t); };

/* ---------- making problems ---------- */
const plainWord = w => /^[a-z]{2,3}$/.test(w) && !IRREGULAR.has(w) && !/ck|qu/.test(w);
// Most words come from the current lesson; the rest review earlier lessons.
function pickWord(avoid, filter = () => true) {
  const L = state.lesson, cur = wordsOf(lessonAt(L)).filter(filter), all = wordsUpTo(L).filter(filter);
  const fresh = a => a.filter(w => !avoid.has(lc(w)));
  const pool = (cur.length && Math.random() < 0.65 ? fresh(cur) : []).concat();
  const from = pool.length ? pool : fresh(all).length ? fresh(all) : all;
  return from.length ? pick(from) : null;
}
// How alike two words look: same letters in the same places count most.
function alike(a, b) {
  a = lc(a); b = lc(b); let s = 0;
  for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] && a[i] === b[i]) s += 2;
  for (const ch of new Set(a)) if (b.includes(ch)) s += 1;
  return s - Math.abs(a.length - b.length);
}

function makeRead(avoid, given) {
  const L = state.lesson, sents = sentencesUpTo(L), curS = sents.filter(x => x.n === L);
  const sentenceLesson = !lessonAt(L).words;
  let item;
  if (given) item = given;
  else if (sents.length && Math.random() < (curS.length && sentenceLesson ? 0.7 : curS.length ? 0.4 : 0.2)) {
    const from = (curS.length && Math.random() < 0.7 ? curS : sents).filter(x => !avoid.has(lc(x.s)));
    const x = from.length ? pick(from) : pick(sents);
    item = { text: x.s, sentence: true, n: x.n };
  } else {
    const w = pickWord(avoid);
    item = { text: w, sentence: false, n: lessonOfWord(w) };
  }
  return { game: 'read', item, key: lc(item.text), speak: item.sentence ? 'Read this to your grown-up.' : 'Read this word to your grown-up.', explain: item.text };
}
function makeFind(avoid, givenWord) {
  const level = state.levels.find, nChoices = level === 1 ? 2 : 3;
  const w = givenWord || pickWord(avoid, x => !SKIP_FIND.has(x));
  const others = [...new Map(wordsUpTo(state.lesson).filter(x => lc(x) !== lc(w) && !SKIP_FIND.has(x)).map(x => [lc(x), x])).values()];
  let picks;
  if (level >= 3) picks = shuffle(others).sort((a, b) => alike(w, b) - alike(w, a)).slice(0, nChoices - 1);
  else {
    // start with words that look a bit alike, but not the closest, so it's fair at three
    const near = shuffle(others).sort((a, b) => alike(w, b) - alike(w, a)).slice(0, 6);
    picks = shuffle(near).slice(0, nChoices - 1);
  }
  const choices = shuffle([{ text: w, ok: true }, ...picks.map(t => ({ text: t, ok: false }))]);
  return { game: 'find', item: { text: w, n: lessonOfWord(w) }, key: lc(w), choices, speak: ['Find the word:', { w }], explain: w };
}
const SKIP_FIND = new Set(['Jan']);
function makeFinish(avoid, givenWord) {
  const level = state.levels.finish, letters = [...new Set(wordsUpTo(state.lesson).join('').toLowerCase().replace(/[^a-z]/g, ''))];
  const consStart = x => plainWord(x) && !/^[aeiou]/.test(x);
  let first = level === 3 || (level === 4 && Math.random() < 0.5);
  let w = givenWord && plainWord(givenWord) ? givenWord : null;
  if (!w && first) w = pickWord(avoid, consStart);
  if (!w) { first = false; w = pickWord(avoid, plainWord) || 'at'; }
  if (first && !consStart(w)) first = false;
  const at = first ? 0 : w.length - 1, ans = w[at];
  const n = level === 1 ? 2 : level === 4 ? 4 : 3;
  const pool = shuffle(letters.filter(ch => ch !== ans && !/[aeiou]/.test(ch)));
  const choices = shuffle([ans, ...pool.slice(0, n - 1)]).map(ch => ({ text: ch, ok: ch === ans }));
  return { game: 'finish', item: { text: w, n: lessonOfWord(w) }, key: lc(w), at, choices, speak: [{ w }, 'Which letter is missing?'], explain: w };
}
const MAKERS = { read: makeRead, find: makeFind, finish: makeFinish };

/* ---------- rounds ---------- */
const REVIEW_DAYS = [1, 3, 7, 14, 30];
const DAY = 864e5;
const startOfDay = () => new Date().setHours(0, 0, 0, 0);
const dueCards = () => state.cards.filter(c => c.due <= Date.now() && GAMES[c.game]).sort((a, b) => a.due - b.due);

let screen = 'home', sess = null, lastChanges = [], confirmWipe = false, wiped = false, tryN = 0;
function buildSession() {
  let on = GAME_KEYS.filter(k => state.on[k]);
  if (!on.length) on = ['read'];
  const n = state.perSession, probs = [], avoid = new Set();
  for (const c of dueCards().slice(0, Math.floor(n * 0.3))) {
    if (!on.includes(c.game) && c.game !== 'read') continue;
    const p = c.game === 'read' ? makeRead(avoid, { text: c.text, sentence: c.text.includes(' '), n: c.n }) : MAKERS[c.game](avoid, c.text);
    p.kind = 'again'; p.card = c.id; avoid.add(p.key); probs.push(p);
  }
  const rot = shuffle(on);
  for (let i = 0; probs.length < n; i++) {
    const p = MAKERS[rot[i % rot.length]](avoid);
    p.kind = 'current'; avoid.add(p.key); probs.push(p);
  }
  for (const p of probs) Object.assign(p, { wrong: [], tries: 0, done: false, helped: false });
  return { probs: shuffle(probs), i: 0, results: [] };
}
function startSession() { sess = buildSession(); screen = 'play'; show(); }
function show() { render(); talk(sess.probs[sess.i].speak); }

const PRAISE = ['Yes!', 'You read it!', 'Well done!', 'Good reading!', 'That\'s it!'];
function gotIt(p) {
  p.done = true;
  const first = p.tries === 0 && !p.helped;
  p.praise = first ? pick(PRAISE) : 'Yes, that\'s it!';
  record(p, first);
  render();
  say([p.praise, { w: p.explain }]);
  const stage = document.querySelector('.stage');
  // the crab tries to eat the lizard... too big!
  setTimeout(() => stage && Scene.tryEat(stage, tryN++, { bubble: () => say('Too big!', 0.95) }), 350);
}
function reveal(p) {
  p.done = true; p.revealed = true;
  record(p, false);
  render();
  say(['Here it is:', { w: p.explain }]);
}
function answer(idx) {
  const p = sess.probs[sess.i];
  if (p.done || p.wrong.includes(idx)) return;
  if (p.choices[idx].ok) { gotIt(p); return; }
  p.wrong.push(idx); p.tries++;
  if (p.tries >= 2 || p.wrong.length >= p.choices.length - 1) reveal(p);
  else { p.nudge = 'Hmm, look again.'; say(p.game === 'find' ? ['Look again. Find the word:', { w: p.explain }] : ['Look again:', { w: p.explain }]); render(true); }
}
function help() {
  const p = sess.probs[sess.i];
  if (p.done) return;
  p.helped = true;
  say([{ w: p.explain }], 0.7);
  render();
}
function record(p, first) {
  sess.results.push(first);
  state.total++;
  for (const w of p.item.sentence ? [] : [p.item.text]) {
    const s = state.words[w] || (state.words[w] = { n: 0, ok: 0 });
    s.n++; if (first) s.ok++;
  }
  const own = lessonAt(state.lesson);
  if (p.game === 'read' && (p.item.n === state.lesson || !(own.words || own.sentences))) state.readRec = [...state.readRec, first].slice(-10);
  if (p.kind === 'current' && p.game !== 'read') state.rec[p.game] = [...(state.rec[p.game] || []), first].slice(-8);
  if (p.kind === 'again') reviewCard(p.card, first);
  else if (!first) addCard(p);
  save();
}
// A missed word comes back tomorrow, then after 3, 7, 14 and 30 days while it keeps going right.
function addCard(p) {
  const due = startOfDay() + DAY * REVIEW_DAYS[0], text = p.item.text;
  const same = state.cards.find(c => c.text === text && c.game === p.game);
  if (same) { Object.assign(same, { box: 0, due, misses: same.misses + 1 }); return; }
  state.cards.push({ id: Math.floor(Math.random() * 2 ** 31).toString(36), game: p.game, text, n: p.item.n, box: 0, due, misses: 1, added: Date.now() });
  if (state.cards.length > 40) state.cards.sort((a, b) => a.added - b.added).shift();
}
function reviewCard(id, first) {
  const c = state.cards.find(x => x.id === id);
  if (!c) return;
  if (!first) { Object.assign(c, { box: 0, due: startOfDay() + DAY, misses: c.misses + 1 }); return; }
  c.box++;
  if (c.box >= REVIEW_DAYS.length) { state.cards = state.cards.filter(x => x !== c); state.cleared++; return; }
  c.due = startOfDay() + DAY * REVIEW_DAYS[c.box];
}
// The book moves on when the lesson is known: 8 of the last 10 read on the first try.
const readyForNext = () => state.lesson < MAXL && state.readRec.length >= 8 && state.readRec.slice(-10).filter(Boolean).length >= 8;
function next() {
  Scene.reset(document.querySelector('.stage'));
  if (sess.i < sess.probs.length - 1) { sess.i++; show(); return; }
  lastChanges = adjustLevels([...new Set(sess.probs.map(p => p.game))]);
  state.sessions.unshift({ d: new Date().toISOString(), score: sess.results.filter(Boolean).length, n: sess.results.length, lesson: state.lesson });
  state.sessions = state.sessions.slice(0, 40);
  state.crabs++;
  save();
  screen = 'done'; sess.cheer = pick(CHEERS); render();
  finale();
}
function finale() {
  const stage = document.querySelector('.stage');
  if (!stage) return;
  talk('Here comes the crab again!');
  Scene.eat(stage, { gulp: () => setTimeout(() => say(`Gulp! The lizard ate the crab! ${greet(sess.cheer)}`), 150) });
}
// Find and Finish move up after 4 of the last 5 right on the first try, down after 3 misses in 4.
function adjustLevels(used) {
  const changes = [];
  for (const k of used.filter(k => k !== 'read')) {
    const r = state.rec[k] || [], max = GAMES[k].levels.length, last5 = r.slice(-5), last4 = r.slice(-4);
    if (last5.length === 5 && last5.filter(Boolean).length >= 4 && state.levels[k] < max) { state.levels[k]++; state.rec[k] = []; changes.push([k, 'up']); }
    else if (last4.length === 4 && last4.filter(Boolean).length <= 1 && state.levels[k] > 1) { state.levels[k]--; state.rec[k] = []; changes.push([k, 'down']); }
  }
  for (const [k, dir] of changes) state.log.unshift({ d: new Date().toISOString(), k, dir, to: state.levels[k] });
  state.log = state.log.slice(0, 30);
  return changes;
}
function setLesson(n) {
  state.lesson = Math.max(1, Math.min(MAXL, n));
  state.readRec = [];
  state.log.unshift({ d: new Date().toISOString(), k: 'lesson', dir: 'set', to: state.lesson });
  save();
}

/* ---------- rendering ---------- */
const CHEERS = ['Hooray', 'Well done', 'You did it', 'Lovely reading', 'Wonderful'];
const app = document.getElementById('app');
const speakerIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19.5 5.5a9 9 0 0 1 0 13"/></svg>';
const arrowIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7"/></svg>';
const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" fill="currentColor"/></svg>';
const checkIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>';
const againIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v5h5"/></svg>';
const crabMini = '<svg viewBox="-60 -50 120 80" aria-hidden="true"><ellipse cx="0" cy="0" rx="31" ry="20" fill="#f2876f"/><circle cx="-45" cy="-32" r="12" fill="#f2876f"/><circle cx="45" cy="-32" r="12" fill="#f2876f"/><path d="M-22 -8 L-38 -24 M22 -8 L38 -24" stroke="#b8513f" stroke-width="6" stroke-linecap="round"/></svg>';
function fmtDate(iso) { try { return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }); } catch (e) { return ''; } }

// A word as it is shown: irregular words boxed, like the book
const wordHtml = w => IRREGULAR.has(w) ? `<span class="irr">${esc(w)}</span>` : esc(w);
const sentenceHtml = s => s.split(' ').map(t => { const m = t.match(/^([A-Za-z]+)(.*)$/); return m && IRREGULAR.has(lc(m[1])) ? `<span class="irr">${esc(m[1])}</span>${esc(m[2])}` : esc(t); }).join(' ');

function nameForm(label, button) {
  return `<form class="name-form" id="name-form">
    <label for="child-name">${label}</label>
    <div class="row-btns"><input id="child-name" class="pick name-input" maxlength="24" placeholder="First name" autocomplete="off" value="${esc(childName())}"><button class="ghost" type="submit">${button}</button></div>
  </form>`;
}
function crabTally() {
  if (!state.crabs) return '<p class="meta center">The crab keeps trying to eat the lizard. Read words to see what happens!</p>';
  return `<div class="tally" aria-label="${state.crabs} crabs eaten">${crabMini.repeat(Math.min(state.crabs, 20))}${state.crabs > 20 ? `<b>+${state.crabs - 20}</b>` : ''}</div>
    <p class="meta center">The lizard has eaten ${state.crabs} ${state.crabs === 1 ? 'crab' : 'crabs'}. Froggy helped.</p>`;
}

function renderHome() {
  const L = lessonAt(state.lesson);
  return `
  <header class="top"><h1>${esc(greet('Hello'))}</h1><button class="link" data-act="parent">For grown-ups</button></header>
  ${childName() ? '' : nameForm("Who's reading?", 'Save')}
  <div class="scene-wrap">${Scene.svg()}</div>
  ${crabTally()}
  <button class="start big-start" data-act="start" aria-label="Start reading">${playIcon}<span>Let's read</span></button>
  <section>
    <h2>Today's games <small class="note">grown-ups choose</small></h2>
    <div class="chips">${GAME_KEYS.map(k => `<button class="chip" data-act="chip" data-k="${k}" aria-pressed="${!!state.on[k]}"><span class="chip-icon" aria-hidden="true">${GAMES[k].icon}</span><strong>${GAMES[k].name}</strong><small>${esc(k === 'read' ? `Lesson ${L.n}` : GAMES[k].levels[state.levels[k] - 1])}</small></button>`).join('')}</div>
  </section>
  <p class="meta">Alpha-Phonics lesson ${L.n}: ${esc(L.title)}. ${state.perSession} words a round.</p>`;
}

function renderStage(p) {
  if (p.game === 'read') return `<div class="word ${p.item.sentence ? 'sentence' : ''}">${p.item.sentence ? sentenceHtml(p.item.text) : wordHtml(p.item.text)}</div>`;
  if (p.game === 'finish') {
    const w = p.item.text;
    return `<div class="word">${[...w].map((ch, i) => i === p.at ? (p.done ? `<span class="filled">${esc(ch)}</span>` : '<span class="qbox" aria-label="missing letter"></span>') : esc(ch)).join('')}</div>`;
  }
  return p.done ? `<div class="word small">${wordHtml(p.item.text)}</div>` : '';
}
function renderPlay() {
  const p = sess.probs[sess.i];
  const ticks = sess.probs.map((_, j) => `<span class="${j < sess.results.length ? 'done' : j === sess.i ? 'now' : ''}"></span>`).join('');
  let fb = '';
  if (p.done) fb = `<span class="big ${p.revealed ? 'try' : 'good'}">${esc(p.revealed ? 'Here it is.' : p.praise)}</span>`;
  else if (p.nudge) fb = `<span class="big try">${esc(p.nudge)}</span>`;
  else if (p.helped) fb = `<span class="how">Say it back, then tap ✓.</span>`;
  const okIdx = p.choices ? p.choices.findIndex(c => c.ok) : -1;
  const choices = p.choices ? `<div class="choices n${p.choices.length} ${p.game === 'finish' ? 'letters' : ''}">${p.choices.map((c, j) => {
    const cls = p.wrong.includes(j) ? 'no' : (p.done && j === okIdx ? 'ok' : '');
    return `<button class="choice ${cls}" data-act="pick" data-i="${j}" aria-label="${esc(c.text)}" ${p.done || p.wrong.includes(j) ? 'disabled' : ''}>${wordHtml(c.text)}</button>`;
  }).join('')}</div>` : '';
  const grownUp = p.game === 'read' && !p.done ? `<div class="mark-row">
      <button class="start mark-ok" data-act="ok" aria-label="Read it">${checkIcon}<span>Read it!</span></button>
      ${p.helped ? '' : `<button class="ghost mark-help" data-act="help">${speakerIcon}<span>Help</span></button>`}
    </div><p class="note center">For the grown-up: tap ✓ when it's read.</p>` : '';
  const last = sess.i === sess.probs.length - 1;
  return `
  <div class="play-top">
    <div class="ticks" aria-label="Word ${sess.i + 1} of ${sess.probs.length}">${ticks}</div>
    <span class="skill-label">${GAMES[p.game].name} · Lesson ${p.item.n}${p.kind === 'again' ? ' · <b class="tag again">Again</b>' : ''}</span>
    ${canSpeak ? `<button class="say" data-act="say" aria-label="Say it again">${speakerIcon}</button>` : ''}
  </div>
  <div class="scene-wrap play">${Scene.svg({ small: true })}</div>
  <p class="ask">${esc(p.game === 'read' ? p.speak : p.game === 'find' ? 'Find the word you hear.' : 'Which letter is missing?')}</p>
  <div class="problem">${renderStage(p)}</div>
  ${choices}${grownUp}
  <div class="feedback">${fb}</div>
  ${p.done ? `<div class="next-row"><button class="start round-btn" data-act="next" id="next" aria-label="${last ? 'See the lizard' : 'Next'}">${arrowIcon}</button></div>` : ''}
  <button class="link" data-act="home" style="align-self:flex-start">Stop and go home</button>`;
}

function renderDone() {
  const ups = lastChanges.filter(c => c[1] === 'up');
  return `
  <h1 class="done-h">${esc(greet(sess.cheer))}</h1>
  <div class="scene-wrap">${Scene.svg()}</div>
  <div class="row-btns center"><button class="ghost again-btn" data-act="replay">${againIcon}<span>Again!</span></button></div>
  ${crabTally()}
  <div class="row-btns center"><button class="start round-btn" data-act="start" aria-label="Read more">${playIcon}</button><button class="ghost" data-act="home">Home</button></div>
  ${ups.length || readyForNext() ? `<section><h2>For grown-ups</h2><ul class="ups">${ups.map(([k]) => `<li>${GAMES[k].name} moved up: ${esc(GAMES[k].levels[state.levels[k] - 1])}</li>`).join('')}
    ${readyForNext() ? `<li>Lesson ${state.lesson} is going well (${state.readRec.slice(-10).filter(Boolean).length} of the last ${Math.min(10, state.readRec.length)} read on the first try). <button class="ghost small-btn" data-act="lesson-next">Go to lesson ${state.lesson + 1}</button></li>` : ''}</ul></section>` : ''}
  <section class="hands"><h2>Off the screen</h2><ul><li>${esc(pick(HANDS))}</li></ul></section>`;
}

function renderParent() {
  const L = lessonAt(state.lesson), r = state.readRec.slice(-10);
  const lv = GAME_KEYS.filter(k => k !== 'read').map(k => {
    const lvl = state.levels[k], max = GAMES[k].levels.length, rr = state.rec[k] || [];
    return `<div class="lvl"><div><strong>${GAMES[k].icon} ${GAMES[k].name}</strong><small>${esc(GAMES[k].levels[lvl - 1])}${rr.length ? ` · ${rr.filter(Boolean).length} of last ${rr.length} right on the first try` : ''}</small></div>
      <div class="stepper"><button data-act="lvl" data-k="${k}" data-d="-1" aria-label="Lower ${GAMES[k].name} level" ${lvl <= 1 ? 'disabled' : ''}>−</button><span>${lvl}/${max}</span><button data-act="lvl" data-k="${k}" data-d="1" aria-label="Raise ${GAMES[k].name} level" ${lvl >= max ? 'disabled' : ''}>+</button></div></div>`;
  }).join('');
  const tricky = Object.entries(state.words).filter(([, s]) => s.n - s.ok > 0).sort((a, b) => (b[1].n - b[1].ok) - (a[1].n - a[1].ok)).slice(0, 12);
  const cards = state.cards.slice().sort((a, b) => a.due - b.due);
  const when = d => { const days = Math.round((d - startOfDay()) / DAY); return days <= 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`; };
  return `
  <header class="top"><h1>For grown-ups</h1><button class="ghost" data-act="home">${childName() ? `Back to ${esc(childName())}` : 'Back'}</button></header>
  <section>
    <h2>How it works</h2>
    <p class="note">A first reader for a three-year-old, following Samuel Blumenfeld's Alpha-Phonics lesson by lesson, with a grown-up alongside. Only words from lessons already reached are used. Every word read makes the crab try to eat the lizard (too big!), and at the end of a round the lizard eats the crab, with Froggy cheering.</p>
  </section>
  <section>
    <h2>Lesson</h2>
    <div class="lvl"><div><strong>Lesson ${L.n}: ${esc(L.title)}</strong><small>${esc(L.note || '')}</small></div>
      <div class="stepper"><button data-act="lesson" data-d="-1" aria-label="Earlier lesson" ${L.n <= 1 ? 'disabled' : ''}>−</button><span>${L.n}/${MAXL}</span><button data-act="lesson" data-d="1" aria-label="Next lesson" ${L.n >= MAXL ? 'disabled' : ''}>+</button></div></div>
    ${L.words || L.irregular ? `<p class="lesson-words">${wordsOf(L).map(wordHtml).join(' · ')}</p>` : ''}
    ${L.sentences ? `<ul class="tips">${L.sentences.map(s => `<li>${sentenceHtml(s)}</li>`).join('')}</ul>` : ''}
    <p class="note">${r.length ? `${r.filter(Boolean).length} of the last ${r.length} from this lesson read on the first try. ` : ''}${readyForNext() ? `<strong class="good-text">Ready for lesson ${L.n + 1}.</strong>` : 'Move on when 8 of the last 10 are read on the first try; the app will suggest it. Earlier lessons keep coming back for review.'}</p>
  </section>
  <section>
    <h2>Games</h2>
    <p class="note">Find and Finish move up after 4 of the last 5 right on the first try, and back down after 3 misses in 4.</p>
    <div class="levels">${lv}</div>
  </section>
  <section>
    <h2>Settings</h2>
    ${nameForm("Child's name", 'Save')}
    <div class="row-btns"><span>Words per round</span><div class="seg">${[3, 5, 8].map(n => `<button data-act="per" data-n="${n}" aria-pressed="${state.perSession === n}">${n}</button>`).join('')}</div></div>
    <div class="row-btns"><span>Read instructions aloud</span><div class="seg"><button data-act="read" data-v="on" aria-pressed="${state.voice !== 'off'}">On</button><button data-act="read" data-v="off" aria-pressed="${state.voice === 'off'}">Off</button></div></div>
    <p class="note">The words in Find and Finish are always spoken, since hearing them is the game. In Read it, the word is only spoken after it's read or when you tap Help.</p>
    <div class="row-btns"><span>Crunchy sound effects</span><div class="seg"><button data-act="sfx" data-v="on" aria-pressed="${state.sfx !== 'off'}">On</button><button data-act="sfx" data-v="off" aria-pressed="${state.sfx === 'off'}">Off</button></div></div>
    ${canSpeak ? `<div class="row-btns"><label for="voice">Voice</label>
      <select id="voice" class="pick">${['', ...voices.map(v => v.name)].map(nm => `<option value="${esc(nm)}" ${nm === savedVoiceName() ? 'selected' : ''}>${nm ? esc(nm) : `Automatic${chosenVoice() ? ` (${esc(chosenVoice().name)})` : ''}`}</option>`).join('')}</select>
      <button class="ghost" data-act="try-voice">Try it</button></div>
    <p class="note">Voices come from this device. On an iPad, better ones are free under Settings → Accessibility → Spoken Content → System Voice → Manage Voices (look for "Enhanced" English voices).</p>` : ''}
  </section>
  <section>
    <h2>How to help</h2>
    <ul class="tips">${TIPS.map(t => `<li>${t}</li>`).join('')}</ul>
  </section>
  <section>
    <h2>Tricky words</h2>
    ${tricky.length ? `<ul class="list">${tricky.map(([w, s]) => `<li><span>${wordHtml(w)}</span><span>${s.ok} of ${s.n} on the first try</span></li>`).join('')}</ul>` : '<p class="note">None yet.</p>'}
  </section>
  <section>
    <h2>Coming back for review</h2>
    <p class="note">Anything missed comes back tomorrow, then after 3, 7, 14 and 30 days while it keeps going right. ${state.cleared ? `${state.cleared} learned for good so far.` : ''}</p>
    ${cards.length ? `<ul class="list">${cards.slice(0, 10).map(c => `<li><span>${esc(c.text)} · ${GAMES[c.game]?.name || c.game}</span><span>${when(c.due)}</span></li>`).join('')}</ul>` : '<p class="note">Nothing to review yet.</p>'}
  </section>
  <section>
    <h2>Recent rounds</h2>
    ${state.sessions.length ? `<ul class="list">${state.sessions.slice(0, 8).map(s => `<li><span>${fmtDate(s.d)} · Lesson ${s.lesson}</span><span>${s.score}/${s.n} first try</span></li>`).join('')}</ul>` : '<p class="note">No rounds yet.</p>'}
  </section>
  <section>
    <h2>Start over</h2>
    <p class="note">Clears the lesson, crabs, the review list and recent rounds. Keeps the name, settings and sync.</p>
    <div class="row-btns">${confirmWipe ? `<button class="ghost danger" data-act="wipe-yes">Yes, erase all progress</button><button class="link" data-act="wipe-no">Cancel</button>` : `<button class="ghost danger" data-act="wipe">Reset all progress</button>`}</div>
    ${wiped ? '<p class="note">Progress cleared.</p>' : ''}
  </section>
  ${renderSync()}`;
}

function renderSync() {
  if (!syncAvailable) return '<p class="note">Progress is saved on this device.</p>';
  if (!sync.code) return `
  <section>
    <h2>Sync between devices</h2>
    <p class="note">Progress is saved on this device. Turn on sync to share it with another iPad or phone. You get a private code to type in on the other device.</p>
    <div class="row-btns"><button class="ghost" data-act="sync-new">Turn on sync</button></div>
    <div class="row-btns">
      <label for="join-code">Already have a code?</label>
      <input id="join-code" class="pick code-input" placeholder="ABCD-EFGH-JKMN" autocomplete="off" autocapitalize="characters" spellcheck="false">
      <button class="ghost" data-act="sync-join">Join</button>
    </div>
    ${sync.error === 'bad-code' ? '<p class="note danger-text">That code should be 12 letters and numbers, like ABCD-EFGH-JKMN.</p>' : ''}
  </section>`;
  const when = sync.lastAt ? new Date(sync.lastAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : '';
  const status = sync.status === 'ok' ? `Synced${when ? ' at ' + when : ''}.`
    : sync.status === 'syncing' ? 'Syncing…'
    : sync.error === 'offline' ? 'Offline. Progress is safe on this device and will sync when you are back online.'
    : `Could not sync (${esc(sync.error)}). Progress is safe on this device.`;
  return `
  <section>
    <h2>Sync between devices</h2>
    <p class="note">Type this code into the grown-ups page on another device to share progress. Keep it private. (This is separate from the other apps.)</p>
    <div class="row-btns"><strong class="sync-code">${esc(sync.code)}</strong><button class="ghost" data-act="sync-copy">Copy</button></div>
    <p class="note">${status}</p>
    <div class="row-btns"><button class="ghost" data-act="sync-now">Sync now</button><button class="link" data-act="sync-off">Stop syncing on this device</button></div>
  </section>`;
}

function render(shake) {
  Scene.reset(document.querySelector('.stage'));
  Scene.Sfx.on = state.sfx !== 'off';
  app.innerHTML = screen === 'play' ? renderPlay() : screen === 'done' ? renderDone() : screen === 'parent' ? renderParent() : renderHome();
  if (shake) { const el = document.querySelector('.choices'); el && el.classList.add('shake'); }
}

app.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const act = b.dataset.act;
  if (act === 'start') startSession();
  else if (act === 'pick') answer(+b.dataset.i);
  else if (act === 'ok') { const p = sess.probs[sess.i]; if (!p.done) gotIt(p); }
  else if (act === 'help') help();
  else if (act === 'next') next();
  else if (act === 'say') { const p = sess.probs[sess.i]; say(p.speak); }
  else if (act === 'replay') { const stage = document.querySelector('.stage'); Scene.tryEat(stage, tryN++, { bubble: () => say('Too big!', 0.95) }).then(() => { if (stage.isConnected && screen === 'done') finale(); }); }
  else if (act === 'home') { screen = 'home'; confirmWipe = false; wiped = false; render(); }
  else if (act === 'parent') { screen = 'parent'; render(); }
  else if (act === 'chip') { state.on[b.dataset.k] = !state.on[b.dataset.k]; save(); render(); }
  else if (act === 'lvl') { const k = b.dataset.k; state.levels[k] = Math.max(1, Math.min(GAMES[k].levels.length, state.levels[k] + +b.dataset.d)); state.rec[k] = []; save(); render(); }
  else if (act === 'lesson') { setLesson(state.lesson + +b.dataset.d); render(); }
  else if (act === 'lesson-next') { setLesson(state.lesson + 1); lastChanges = []; screen = 'home'; render(); }
  else if (act === 'per') { state.perSession = +b.dataset.n; save(); render(); }
  else if (act === 'read') { state.voice = b.dataset.v; save(); render(); }
  else if (act === 'sfx') { state.sfx = b.dataset.v; save(); render(); if (state.sfx === 'on') Scene.Sfx.gulp(); }
  else if (act === 'try-voice') say([greet('Hello'), 'Find the word:', { w: 'at' }]);
  else if (act === 'sync-new') { startSync(newCode()); render(); }
  else if (act === 'sync-join') {
    const code = cleanCode(document.getElementById('join-code')?.value || '');
    if (!code) { sync.error = 'bad-code'; render(); return; }
    sync.error = ''; startSync(code); render();
  }
  else if (act === 'sync-now') { sync.status = 'syncing'; render(); pullRemote(); }
  else if (act === 'sync-off') { stopSync(); render(); }
  else if (act === 'sync-copy') navigator.clipboard?.writeText(sync.code).then(() => { b.textContent = 'Copied'; }, () => {});
  else if (act === 'wipe') { confirmWipe = true; wiped = false; render(); }
  else if (act === 'wipe-no') { confirmWipe = false; render(); }
  else if (act === 'wipe-yes') {
    const keep = { childName: state.childName, voice: state.voice, sfx: state.sfx, perSession: state.perSession };
    state = Object.assign(defaultState(), keep);
    confirmWipe = false; wiped = true; sess = null; lastChanges = [];
    save(); render();
  }
});
// On the home screen, touching the crab or the lizard makes the crab have a go.
app.addEventListener('pointerup', e => {
  if (screen !== 'home' || !e.target.closest('.stage')) return;
  Scene.tryEat(e.target.closest('.stage'), tryN++, { bubble: () => say('Too big!', 0.95) });
});
app.addEventListener('submit', e => {
  if (e.target.id !== 'name-form') return;
  e.preventDefault();
  state.childName = (document.getElementById('child-name')?.value || '').trim().slice(0, 24);
  save(); render();
});
app.addEventListener('change', e => {
  if (e.target.id !== 'voice') return;
  try { if (e.target.value) localStorage.setItem(VOICE_KEY, e.target.value); else localStorage.removeItem(VOICE_KEY); } catch (err) {}
  render();
  say('How does this voice sound?');
});
render();
initSync();
if (canSpeak) { loadVoices(); try { speechSynthesis.addEventListener('voiceschanged', loadVoices); } catch (e) {} }
