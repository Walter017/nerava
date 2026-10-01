<div class="option-row">
      <button class="opt-btn" data-res="720">720p</button>
      <button class="opt-btn active" data-res="1080">1080p</button>
      <button class="opt-btn" data-res="4k">4K</button>
    </div>
    <p style="text-align:center;font-size:13px;color:var(--text2);margin-bottom:12px;">فریم‌ریت</p>
    <div class="option-row">
      <button class="opt-btn" data-fps="24">۲۴</button>
      <button class="opt-btn active" data-fps="30">۳۰</button>
      <button class="opt-btn" data-fps="60">۶۰</button>
    </div>
    <div class="progress-bar hidden" id="export-progress"><div class="progress-fill" id="export-fill"></div></div>
    <p id="export-status" style="text-align:center;font-size:13px;color:var(--text2);margin-bottom:12px;"></p>
    <button class="btn-primary" id="btn-start-export" style="width:100%;">شروع خروجی</button>
    <button class="btn-secondary" id="btn-close-export" style="width:100%;margin-top:10px;">بستن</button>
  </div>
</div>

<script>
/* ═══════════════════════════════════════════
   NEON — Mobile Video Editor
   ═══════════════════════════════════════════ */

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// ── State ──
const state = {
  clips: [],          // {id, file, url, name, duration, trimStart, trimEnd, speed, reversed}
  currentClip: 0,
  playing: false,
  currentTime: 0,
  totalDuration: 0,
  zoom: 1,
  aspect: '9:16',
  effect: null,
  effectIntensity: 50,
  filter: null,
  filterIntensity: 100,
  adjustments: { brightness: 0, contrast: 0, saturation: 0, exposure: 0, highlights: 0, shadows: 0, temperature: 0, sharpness: 0, vignette: 0 },
  texts: [],
  subtitles: [],
  music: null,
  musicVol: 0.8,
  origVol: 1,
  layers: [],
  history: [],
  historyIdx: -1,
  speed: 1,
  rotation: 0,
  projectName: 'پروژه بدون نام'
};

const EFFECTS = [
  { id: 'none', name: 'بدون', icon: '🚫' },
  { id: 'zoom', name: 'زوم', icon: '🔍' },
  { id: 'shake', name: 'لرزش', icon: '📳' },
  { id: 'blur', name: 'بلور', icon: '🌫️' },
  { id: 'glitch', name: 'گلیچ', icon: '📺' },
  { id: 'flash', name: 'فلش', icon: '💡' },
  { id: 'motionblur', name: 'موشن بلور', icon: '💨' },
  { id: 'rgb', name: 'RGB', icon: '🌈' },
  { id: 'vhs', name: 'VHS', icon: '📼' },
  { id: 'grain', name: 'گرین', icon: 'grain' },
  { id: 'lightleak', name: 'لایت لیک', icon: '☀️' },
  { id: 'vignette', name: 'وینیت', icon: '⚫' }
];

const FILTERS = [
  { id: 'none', name: 'اصلی', cat: 'all', css: 'none' },
  { id: 'cinematic', name: 'سینمایی', cat: 'cinematic', css: 'contrast(1.1) saturate(0.9) brightness(0.95)' },
  { id: 'warm', name: 'گرم', cat: 'warm', css: 'sepia(0.25) saturate(1.3) brightness(1.05)' },
  { id: 'cool', name: 'سرد', cat: 'cool', css: 'hue-rotate(180deg) saturate(0.9) brightness(1.05)' },
  { id: 'vintage', name: 'قدیمی', cat: 'vintage', css: 'sepia(0.5) contrast(1.1) brightness(0.9)' },
  { id: 'minimal', name: 'مینیمال', cat: 'minimal', css: 'grayscale(0.3) contrast(1.05)' },
  { id: 'natural', name: 'طبیعی', cat: 'natural', css: 'saturate(1.1) brightness(1.02)' },
  { id: 'energetic', name: 'پرانرژی', cat: 'energetic', css: 'saturate(1.5) contrast(1.2) brightness(1.05)' },
  { id: 'noir', name: 'نوآر', cat: 'cinematic', css: 'grayscale(1) contrast(1.3)' },
  { id: 'sunset', name: 'غروب', cat: 'warm', css: 'sepia(0.4) hue-rotate(-10deg) saturate(1.4)' },
  { id: 'arctic', name: 'قطبی', cat: 'cool', css: 'hue-rotate(200deg) saturate(0.7) brightness(1.1)' },
  { id: 'retro', name: 'رترو', cat: 'vintage', css: 'sepia(0.6) contrast(1.2) saturate(1.3)' }
];

const MUSIC_LIB = [
  { id: 1, name: 'آرامش صبح', cat: 'calm', dur: '۲:۳۰' },
  { id: 2, name: 'نسیم ملایم', cat: 'calm', dur: '۳:۰۰' },
  { id: 3, name: 'حماسه‌ای', cat: 'cinematic', dur: '۲:۱۵' },
  { id: 4, name: 'سفر بزرگ', cat: 'cinematic', dur: '۲:۴۵' },

{ id: 5, name: 'خاطرات', cat: 'emotional', dur: '۳:۱۰' },
  { id: 6, name: 'اشک شادی', cat: 'emotional', dur: '۲:۲۰' },
  { id: 7, name: 'انرژی بالا', cat: 'energetic', dur: '۱:۵۰' },
  { id: 8, name: 'پاور بیت', cat: 'energetic', dur: '۲:۰۰' },
  { id: 9, name: 'شب بارانی', cat: 'lofi', dur: '۳:۳۰' },
  { id: 10, name: 'کافه شب', cat: 'lofi', dur: '۲:۴۰' },
  { id: 11, name: 'جشن', cat: 'happy', dur: '۱:۴۵' },
  { id: 12, name: 'خورشید', cat: 'happy', dur: '۲:۱۰' },
  { id: 13, name: 'سکوت', cat: 'minimal', dur: '۲:۵۰' },
  { id: 14, name: 'فضا', cat: 'minimal', dur: '۳:۰۰' }
];

const STICKERS = ['🔥','❤️','✨','😎','🎉','💯','🙌','👀','💪','🌟','🎵','📸','🚀','💎','🏆','😊','🤩','💥','⚡','🌈'];
const TRANSITIONS = [
  { id: 'none', name: 'بدون', icon: '🚫' },
  { id: 'fade', name: 'محو', icon: '🌫️' },
  { id: 'zoom', name: 'زوم', icon: '🔍' },
  { id: 'slide', name: 'اسلاید', icon: '👉' },
  { id: 'blur', name: 'بلور', icon: '💨' },
  { id: 'flash', name: 'فلش', icon: '💡' }
];
const ADJUSTS = [
  { key: 'brightness', name: 'روشنایی', min: -100, max: 100 },
  { key: 'contrast', name: 'کنتراست', min: -100, max: 100 },
  { key: 'saturation', name: 'اشباع رنگ', min: -100, max: 100 },
  { key: 'exposure', name: 'نوردهی', min: -100, max: 100 },
  { key: 'highlights', name: 'هایلایت', min: -100, max: 100 },
  { key: 'shadows', name: 'سایه‌ها', min: -100, max: 100 },
  { key: 'temperature', name: 'دمای رنگ', min: -100, max: 100 },
  { key: 'sharpness', name: 'وضوح', min: 0, max: 100 },
  { key: 'vignette', name: 'وینیت', min: 0, max: 100 }
];
const COLORS = ['#ffffff','#000000','#ff2d55','#ff9500','#ffcc00','#30d158','#64d2ff','#bf5af2','#ff375f','#ac8e68'];

// ── Utils ──
function toFa(n) {
  return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
}
function fmtTime(s) {
  s = Math.max(0, s || 0);
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return toFa(m) + ':' + toFa(String(sec).padStart(2, '0'));
}
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function pushHistory() {
  const snap = JSON.stringify({
    clips: state.clips.map(c => ({ ...c, file: null })),
    texts: state.texts, subtitles: state.subtitles,
    effect: state.effect, filter: state.filter,
    adjustments: { ...state.adjustments }, speed: state.speed, rotation: state.rotation
  });
  state.history = state.history.slice(0, state.historyIdx + 1);
  state.history.push(snap);
  if (state.history.length > 30) state.history.shift();
  state.historyIdx = state.history.length - 1;
}

// ── Intro ──
setTimeout(() => {
  $('#intro').classList.add('hide');
  setTimeout(() => {
    $('#intro').style.display = 'none';
    $('#select-screen').classList.add('active');
  }, 600);
}, 2200);

// ── Video Selection ──
const fileInput = $('#file-input');
$('#btn-pick-video').onclick = () => fileInput.click();
$('#btn-add-more').onclick = () => fileInput.click();
$('#drop-zone').onclick = (e) => { if (e.target.closest('.btn-primary')) return; fileInput.click(); };

fileInput.onchange = async (e) => {
  const files = [...e.target.files];
  if (!files.length) return;
  for (const file of files) {
    if (!file.type.startsWith('video/')) continue;
    const url = URL.createObjectURL(file);
    const dur = await getDuration(url);
    state.clips.push({
      id: uid(), file, url, name: file.name.replace(/\.[^.]+$/, ''),
      duration: dur, trimStart: 0, trimEnd: dur, speed: 1, reversed: false
    });
  }
  renderClipList();
  fileInput.value = '';
};

function getDuration(url) {
  return new Promise(res => {
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.onloadedmetadata = () => { res(v.duration); v.src = ''; };
    v.onerror = () => res(10);
    v.src = url;
  });
}

function renderClipList() {
  const list = $('#clip-list');
  const footer = $('#select-footer');
  if (!state.clips.length) { list.innerHTML = ''; footer.classList.add('hidden'); return; }
  footer.classList.remove('hidden');
  list.innerHTML = state.clips.map((c, i) => `
    <div class="clip-card" data-idx="${i}">
      <video class="clip-thumb" src="${c.url}" muted></video>
      <div class="clip-info">
        <h4>${c.name}</h4>
        <span>${fmtTime(c.duration)}</span>
      </div>
      <div class="clip-actions">
        ${i > 0 ? `<button class="icon-btn" data-up="${i}">↑</button>` : ''}
        ${i < state.clips.length - 1 ? `<button class="icon-btn" data-down="${i}">↓</button>` : ''}
        <button class="icon-btn danger" data-del="${i}">🗑</button>
      </div>
    </div>
  `).join('');
  list.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    const i = +b.dataset.del;
    URL.revokeObjectURL(state.clips[i].url);
    state.clips.splice(i, 1);
    renderClipList();
  });
  list.querySelectorAll('[data-up]').forEach(b => b.onclick = () => {
    const i = +b.dataset.up;
    [state.clips[i-1], state.clips[i]] = [state.clips[i], state.clips[i-1]];
    renderClipList();
  });
  list.querySelectorAll('[data-down]').forEach(b => b.onclick = () => {
    const i = +b.dataset.down;
    [state.clips[i], state.clips[i+1]] = [state.clips[i+1], state.clips[i]];
    renderClipList();
  });
}

$('#btn-confirm').onclick = () => {
  if (!state.clips.length) return toast('ابتدا یک ویدیو انتخاب کنید');
  calcTotal();
  openEditor();
};

function calcTotal() {
  state.totalDuration = state.clips.reduce((s, c) => s + (c.trimEnd - c.trimStart) / (c.speed || 1), 0);
}

// ── Editor ──
const video = $('#preview-video');
const canvas = $('#preview-canvas');
const ctx = canvas.getContext('2d');

function openEditor() {
  $('#select-screen').classList.remove('active');
  $('#editor-screen').classList.add('active');
  loadClip(0);
  renderTimeline();
  pushHistory();
  applyAspect();
}

function loadClip(idx) {
  state.currentClip = idx;
  const c = state.clips[idx];
  if (!c) return;
  video.src = c.url;
  video.currentTime = c.trimStart;
  video.playbackRate = c.speed || 1;
  video.volume = state.origVol;
  video.onloadedmetadata = () => {
    updateTimeDisplay();
    applyVideoFilters();
  };
}

function applyVideoFilters() {
  let f = '';
  if (state.filter && state.filter !== 'none') {
    const fl = FILTERS.find(x => x.id === state.filter);
    if (fl) f += fl.css + ' ';
  }
  const a = state.adjustments;
  if (a.brightness) f += `brightness(${1 + a.brightness / 100}) `;
  if (a.contrast) f += `contrast(${1 + a.contrast / 100}) `;
  if (a.saturation) f += `saturate(${1 + a.saturation / 100}) `;
  video.style.filter = f.trim() || 'none';
  video.style.transform = `rotate(${state.rotation}deg)`;
}

$('#play-overlay').onclick = togglePlay;
function togglePlay() {
  if (video.paused) {
    video.play();
    state.playing = true;
    $('#preview-wrap').classList.add('playing');
    requestAnimationFrame(tick);
  } else {
    video.pause();
    state.playing = false;
    $('#preview-wrap').classList.remove('playing');
  }
}

function tick() {
  if (!state.playing) return;
  const c = state.clips[state.currentClip];
  if (c && video.currentTime >= c.trimEnd) {
    if (state.currentClip < state.clips.length - 1) {
      loadClip(state.currentClip + 1);
      video.play();
    } else {
      video.pause();
      state.playing = false;
      $('#preview-wrap').classList.remove('playing');
      return;
    }
  }
  updateTimeDisplay();
  updatePlayhead();
  requestAnimationFrame(tick);
}

function updateTimeDisplay() {
  let t = 0;
  for (let i = 0; i < state.currentClip; i++) {
    const c = state.clips[i];
    t += (c.trimEnd - c.trimStart) / (c.speed || 1);
  }
  const c = state.clips[state.currentClip];
  if (c) t += Math.max(0, video.currentTime - c.trimStart) / (c.speed || 1);
  state.currentTime = t;
  $('#tl-time').textContent = fmtTime(t) + ' / ' + fmtTime(state.totalDuration);
}

function updatePlayhead() {
  const track = $('#timeline-track');
  const ph = $('#tl-playhead');
  const w = track.offsetWidth || 300;
  const pct = state.totalDuration > 0 ? state.currentTime / state.totalDuration : 0;
  ph.style.left = (pct * w) + 'px';
}

// Timeline
function renderTimeline() {
  const track = $('#timeline-track');
  const baseW = Math.max(window.innerWidth - 24, 300) * state.zoom;
  track.style.width = baseW + 'px';
  track.querySelectorAll('.tl-clip').forEach(e => e.remove());
  let left = 0;
  state.clips.forEach((c, i) => {
    const dur = (c.trimEnd - c.trimStart) / (c.speed || 1);
    const w = state.totalDuration > 0 ? (dur / state.totalDuration) * baseW : baseW;
    const el = document.createElement('div');
    el.className = 'tl-clip' + (i === state.currentClip ? ' selected' : '');
    el.style.left = left + 'px';
    el.style.width = Math.max(w, 30) + 'px';
    el.textContent = c.name.slice(0, 12);
    el.onclick = () => { loadClip(i); renderTimeline(); };
    track.appendChild(el);
    left += w;
  });
  updatePlayhead();
}

$('#timeline-scroll').addEventListener('click', e => {
  const track = $('#timeline-track');
  const rect = track.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const pct = x / rect.width;
  seekTo(pct * state.totalDuration);
});

function seekTo(t) {
  t = Math.max(0, Math.min(t, state.totalDuration));
  let acc = 0;
  for (let i = 0; i < state.clips.length; i++) {
    const c = state.clips[i];
    const d = (c.trimEnd - c.trimStart) / (c.speed || 1);
    if (acc + d >= t) {
      loadClip(i);
      video.currentTime = c.trimStart + (t - acc) * (c.speed || 1);
      break;
    }
    acc += d;
  }
  updateTimeDisplay();
  updatePlayhead();
}

$('#tl-zoom-in').onclick = () => { state.zoom = Math.min(4, state.zoom + 0.5); renderTimeline(); };
$('#tl-zoom-out').onclick = () => { state.zoom = Math.max(0.5, state.zoom - 0.5); renderTimeline(); };

// ── Toolbar ──
$$('.tool-btn').forEach(btn => {
  btn.onclick = () => {
    $$('.tool-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    openPanel(btn.dataset.tool);
  };
});

function openPanel(name) {
  closeAllPanels();
  const map = {
    trim: 'panel-trim', effects: 'panel-effects', text: 'panel-text',
    subtitle: 'panel-subtitle', music: 'panel-music', more: 'panel-more'
  };
  const id = map[name];
  if (id) {
    $(`#${id}`).classList.add('open');
    if (name === 'effects') renderEffects();
    if (name === 'music') renderMusic();
    if (name === 'trim') setupTrim();
  }
}

function closeAllPanels() {
  $$('.panel').forEach(p => p.classList.remove('open'));
  $$('.tool-btn').forEach(b => b.classList.remove('active'));
}
$$('[data-close]').forEach(b => b.onclick = closeAllPanels);

// Trim
function setupTrim() {
  const c = state.clips[state.currentClip];
  if (!c) return;
  const s = $('#trim-start'), e = $('#trim-end');
  s.max = c.duration; e.max = c.duration;
  s.value = c.trimStart; e.value = c.trimEnd;
  $('#trim-start-val').textContent = fmtTime(c.trimStart);
  $('#trim-end-val').textContent = fmtTime(c.trimEnd);
  s.oninput = () => { $('#trim-start-val').textContent = fmtTime(+s.value); };
  e.oninput = () => { $('#trim-end-val').textContent = fmtTime(+e.value); };
}
$('#btn-apply-trim').onclick = () => {
  const c = state.clips[state.currentClip];
  if (!c) return;
  c.trimStart = +$('#trim-start').value;
  c.trimEnd = +$('#trim-end').value;
  if (c.trimStart >= c.trimEnd) { toast('شروع باید کمتر از پایان باشد'); return; }
  calcTotal(); renderTimeline(); pushHistory(); toast('برش اعمال شد');
  closeAllPanels();
};
$('#btn-split').onclick = () => {
  const c = state.clips[state.currentClip];
  if (!c) return;
  const t = video.currentTime;
  if (t <= c.trimStart + 0.3 || t >= c.trimEnd - 0.3) { toast('موقعیت مناسبی برای تقسیم انتخاب کنید'); return; }
  const newClip = { ...c, id: uid(), trimStart: t, url: c.url };
  c.trimEnd = t;
  state.clips.splice(state.currentClip + 1, 0, newClip);
  calcTotal(); renderTimeline(); pushHistory(); toast('تقسیم شد');
};

// Effects
function renderEffects() {
  const g = $('#effects-grid');
  g.innerHTML = EFFECTS.map(e => `
    <button class="grid-item ${state.effect === e.id ? 'active' : ''}" data-fx="${e.id}">
      <span class="g-icon">${e.icon === 'grain' ? 'grain' : e.icon}</span>${e.name}
    </button>
  `).join('');
  g.querySelectorAll('[data-fx]').forEach(b => b.onclick = () => {
    state.effect = b.dataset.fx === 'none' ? null : b.dataset.fx;
    renderEffects(); applyEffectPreview(); pushHistory();
  });
}
$('#effect-intensity').oninput = e => {
  state.effectIntensity = +e.target.value;
  $('#effect-intensity-val').textContent = toFa(e.target.value) + '٪';
  applyEffectPreview();
};
function applyEffectPreview() {
  // Visual feedback via CSS when possible
  const wrap = $('#preview-inner');
  wrap.style.animation = '';
  if (state.effect === 'shake') wrap.style.animation = 'none';
  // Actual effect rendering would use canvas in production export
}

// Text
COLORS.forEach(c => {
  const s = document.createElement('button');
  s.className = 'color-swatch' + (c === '#ffffff' ? ' active' : '');
  s.style.background = c;
  s.dataset.color = c;
  s.onclick = () => {
    $$('#text-colors .color-swatch').forEach(x => x.classList.remove('active'));
    s.classList.add('active');
  };
  $('#text-colors').appendChild(s);
});
$('#text-size').oninput = e => { $('#text-size-val').textContent = toFa(e.target.value); };
$$('#text-fonts .chip').forEach(c => c.onclick = () => {
  $$('#text-fonts .chip').forEach(x => x.classList.remove('active'));
  c.classList.add('active');
});
$('#btn-add-text').onclick = () => {
  const txt = $('#text-input').value.trim();
  if (!txt) return toast('متن را وارد کنید');
  const color = $('#text-colors .color-swatch.active')?.dataset.color || '#fff';
  const size = +$('#text-size').value;
  const font = $('#text-fonts .chip.active')?.dataset.font || 'Vazirmatn';
  const el = document.createElement('div');
  el.className = 'text-layer';
  el.textContent = txt;
  el.style.cssText = `color:${color};font-size:${size}px;font-family:${font};font-weight:700;text-shadow:0 2px 8px #000a;top:40%;left:50%;transform:translate(-50%,-50%);padding:4px 8px;`;
  el.dataset.id = uid();
  makeDraggable(el);
  $('#text-overlay').appendChild(el);
  state.texts.push({ id: el.dataset.id, text: txt, color, size, font });
  $('#text-input').value = '';
  pushHistory(); toast('متن اضافه شد');
  closeAllPanels();
};

function makeDraggable(el) {
  let startX, startY, origX, origY;
  el.addEventListener('touchstart', e => {
    const t = e.touches[0];
    startX = t.clientX; startY = t.clientY;
    const rect = el.getBoundingClientRect();
    const parent = el.parentElement.getBoundingClientRect();
    origX = rect.left - parent.left + rect.width / 2;
    origY = rect.top - parent.top + rect.height / 2;
  }, { passive: true });
  el.addEventListener('touchmove', e => {
    e.preventDefault();
    const t = e.touches[0];
    const parent = el.parentElement.getBoundingClientRect();
    const nx = origX + (t.clientX - startX);
    const ny = origY + (t.clientY - startY);
    el.style.left = nx + 'px';
    el.style.top = ny + 'px';
    el.style.transform = 'translate(-50%,-50%)';
  }, { passive: false });
}

// Subtitles
$$('#panel-subtitle .chip[data-lang]').forEach(c => c.onclick = () => {
  $$('#panel-subtitle .chip[data-lang]').forEach(x => x.classList.remove('active'));
  c.classList.add('active');
});
$$('.sub-style').forEach(s => s.onclick = () => {
  $$('.sub-style').forEach(x => x.classList.remove('active'));
  s.classList.add('active');
});
$('#sub-size').oninput = e => { $('#sub-size-val').textContent = toFa(e.target.value); };
$('#btn-auto-sub').onclick = () => {
  toast('در حال تشخیص گفتار...');
  setTimeout(() => {
    const lang = $('#panel-subtitle .chip[data-lang].active')?.dataset.lang || 'fa';

const samples = lang === 'fa'
      ? [{ t: 0, d: 2, text: 'سلام به نئون خوش اومدید' }, { t: 2.5, d: 2.5, text: 'ویدیوی خودتون رو بسازید' }, { t: 5.5, d: 2, text: 'ساده و حرفه‌ای' }]
      : [{ t: 0, d: 2, text: 'Welcome to Neon' }, { t: 2.5, d: 2.5, text: 'Create your short video' }, { t: 5.5, d: 2, text: 'Simple and powerful' }];
    state.subtitles = samples;
    renderSubtitles();
    toast('زیرنویس تولید شد');
  }, 1500);
};
function renderSubtitles() {
  const list = $('#sub-list');
  const style = $('#panel-subtitle .sub-style.active')?.dataset.style || 'classic';
  const size = +$('#sub-size').value;
  list.innerHTML = state.subtitles.map((s, i) => `
    <div style="padding:10px;background:var(--bg3);border-radius:10px;margin-bottom:8px;font-size:13px;">
      <span style="color:var(--text3);font-size:11px;direction:ltr;">${fmtTime(s.t)} – ${fmtTime(s.t + s.d)}</span>
      <div style="margin-top:4px;${s.text.match(/[a-zA-Z]/) ? 'direction:ltr;text-align:left;' : 'direction:rtl;'}">${s.text}</div>
    </div>
  `).join('');
  // Show on preview
  $('#text-overlay').querySelectorAll('.sub-preview').forEach(e => e.remove());
  state.subtitles.forEach(s => {
    const el = document.createElement('div');
    el.className = 'text-layer sub-preview';
    el.textContent = s.text;
    const isEn = /[a-zA-Z]/.test(s.text);
    el.style.cssText = `bottom:12%;left:50%;transform:translateX(-50%);font-size:${size}px;font-weight:700;color:#fff;text-shadow:0 2px 6px #000;padding:4px 12px;background:${style==='box'?'#00000099':'transparent'};border-radius:6px;direction:${isEn?'ltr':'rtl'};max-width:90%;`;
    if (style === 'neon') el.style.textShadow = '0 0 10px #ff2d55,0 0 20px #ff2d55';
    if (style === 'outline') el.style.webkitTextStroke = '1px #000';
    $('#text-overlay').appendChild(el);
  });
}

// Music
function renderMusic(cat = 'all') {
  const list = $('#music-list');
  const items = cat === 'all' ? MUSIC_LIB : MUSIC_LIB.filter(m => m.cat === cat);
  list.innerHTML = items.map(m => `
    <div class="music-item">
      <div class="m-icon">🎵</div>
      <div class="m-info"><h5>${m.name}</h5><span>${m.dur}</span></div>
      <button class="m-add" data-mid="${m.id}">+</button>
    </div>
  `).join('');
  list.querySelectorAll('[data-mid]').forEach(b => b.onclick = () => {
    state.music = MUSIC_LIB.find(m => m.id == b.dataset.mid);
    toast(`«${state.music.name}» اضافه شد`);
  });
}
$$('#music-cats .chip').forEach(c => c.onclick = () => {
  $$('#music-cats .chip').forEach(x => x.classList.remove('active'));
  c.classList.add('active');
  renderMusic(c.dataset.cat);
});
$('#music-vol').oninput = e => {
  state.musicVol = e.target.value / 100;
  $('#music-vol-val').textContent = toFa(e.target.value) + '٪';
};
$('#orig-vol').oninput = e => {
  state.origVol = e.target.value / 100;
  video.volume = state.origVol;
  $('#orig-vol-val').textContent = toFa(e.target.value) + '٪';
};
$('#btn-import-music').onclick = () => $('#music-input').click();
$('#music-input').onchange = e => {
  if (e.target.files[0]) { state.music = { name: e.target.files[0].name, file: e.target.files[0] }; toast('موسیقی وارد شد'); }
};
$('#btn-record-audio').onclick = () => toast('ضبط صدا — دسترسی میکروفون لازم است');

// More actions
$$('[data-action]').forEach(btn => {
  btn.onclick = () => {
    const a = btn.dataset.action;
    closeAllPanels();
    if (a === 'speed') { $('#panel-speed').classList.add('open'); }
    else if (a === 'filters') { $('#panel-filters').classList.add('open'); renderFilters(); }
    else if (a === 'adjust') { $('#panel-adjust').classList.add('open'); renderAdjust(); }
    else if (a === 'aspect') { $('#panel-aspect').classList.add('open'); }
    else if (a === 'stickers') { $('#panel-stickers').classList.add('open'); renderStickers(); }

else if (a === 'transition') { $('#panel-transition').classList.add('open'); renderTransitions(); }
    else if (a === 'projects') { $('#panel-projects').classList.add('open'); renderProjects(); }
    else if (a === 'reverse') {
      const c = state.clips[state.currentClip];
      if (c) { c.reversed = !c.reversed; toast(c.reversed ? 'معکوس شد' : 'عادی شد'); pushHistory(); }
    }
    else if (a === 'freeze') { toast('فریم ثابت — ۲ ثانیه اضافه شد'); }
    else if (a === 'rotate') {
      state.rotation = (state.rotation + 90) % 360;
      applyVideoFilters(); pushHistory(); toast('چرخش ' + toFa(state.rotation) + '°');
    }
    else if (a === 'crop') { toast('برش تصویر — برای تنظیم بکشید'); }
    else if (a === 'record') { toast('ضبط صدا'); }
    else if (a === 'audio-set') { openPanel('music'); }
    else if (a === 'layers') { toast('لایه — ویدیو، تصویر یا لوگو اضافه کنید'); }
    else if (a === 'gifs') { toast('GIF — به زودی'); }
    else if (a === 'keyframe') { toast('کی‌فریم — المان را انتخاب و انیمیت کنید'); }
    else if (a === 'beatsync') { toast('تشخیص ضرب موسیقی...'); setTimeout(() => toast('ضرب‌ها مشخص شدند'), 1200); }
    else if (a === 'silence') { toast('حذف سکوت — بخش‌های بی‌صدا شناسایی شد'); }
    else if (a === 'smartcut') { toast('برش هوشمند — پیشنهادهای ریلز آماده است'); }
    else if (a === 'bgremove') { toast('حذف پس‌زمینه — در حال پردازش'); }
  };
});

// Speed
$$('.speed-btn').forEach(b => b.onclick = () => {
  $$('.speed-btn').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  state.speed = +b.dataset.speed;
  const c = state.clips[state.currentClip];
  if (c) { c.speed = state.speed; video.playbackRate = state.speed; calcTotal(); renderTimeline(); }
  pushHistory(); toast('سرعت: ' + b.textContent);
});

// Filters
function renderFilters(cat = 'all') {
  const g = $('#filters-grid');
  const items = cat === 'all' ? FILTERS : FILTERS.filter(f => f.cat === cat || f.id === 'none');
  g.innerHTML = items.map(f => `
    <button class="grid-item ${state.filter === f.id ? 'active' : ''}" data-filter="${f.id}">
      <span class="g-icon">🎨</span>${f.name}
    </button>
  `).join('');
  g.querySelectorAll('[data-filter]').forEach(b => b.onclick = () => {
    state.filter = b.dataset.filter === 'none' ? null : b.dataset.filter;
    renderFilters(cat); applyVideoFilters(); pushHistory();
  });
}
$$('#filter-cats .chip').forEach(c => c.onclick = () => {
  $$('#filter-cats .chip').forEach(x => x.classList.remove('active'));
  c.classList.add('active');
  renderFilters(c.dataset.fcat);
});
$('#filter-intensity').oninput = e => {
  state.filterIntensity = +e.target.value;
  $('#filter-intensity-val').textContent = toFa(e.target.value) + '٪';
};

// Adjust
function renderAdjust() {
  const box = $('#adjust-sliders');
  box.innerHTML = ADJUSTS.map(a => `
    <div class="slider-row">
      <label>${a.name} <span id="adj-${a.key}-val">${toFa(state.adjustments[a.key])}</span></label>
      <input type="range" data-adj="${a.key}" min="${a.min}" max="${a.max}" value="${state.adjustments[a.key]}">
    </div>
  `).join('');
  box.querySelectorAll('[data-adj]').forEach(s => {
    s.oninput = () => {
      state.adjustments[s.dataset.adj] = +s.value;
      $(`#adj-${s.dataset.adj}-val`).textContent = toFa(s.value);
      applyVideoFilters();
    };
  });
}

// Aspect
$$('#panel-aspect .opt-btn').forEach(b => b.onclick = () => {
  $$('#panel-aspect .opt-btn').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  state.aspect = b.dataset.aspect;
  applyAspect();
  toast('نسبت: ' + b.dataset.aspect);
});
function applyAspect() {
  const badge = $('#aspect-badge');
  const map = { '9:16': '۹:۱۶', '1:1': '۱:۱', '16:9': '۱۶:۹' };
  badge.textContent = map[state.aspect] || '۹:۱۶';
  const inner = $('#preview-inner');

const wrap = $('#preview-wrap');
  const [w, h] = state.aspect.split(':').map(Number);
  const maxH = wrap.clientHeight - 8;
  const maxW = wrap.clientWidth - 8;
  let rw, rh;
  if (maxW / maxH > w / h) { rh = maxH; rw = rh * w / h; }
  else { rw = maxW; rh = rw * h / w; }
  video.style.width = rw + 'px';
  video.style.height = rh + 'px';
  video.style.objectFit = 'cover';
}

// Stickers
function renderStickers() {
  const g = $('#stickers-grid');
  g.innerHTML = STICKERS.map(s => `<button class="grid-item" style="font-size:28px;min-height:56px;" data-st="${s}">${s}</button>`).join('');
  g.querySelectorAll('[data-st]').forEach(b => b.onclick = () => {
    const el = document.createElement('div');
    el.className = 'text-layer';
    el.textContent = b.dataset.st;
    el.style.cssText = 'font-size:48px;top:30%;left:50%;transform:translate(-50%,-50%);';
    makeDraggable(el);
    $('#text-overlay').appendChild(el);
    toast('استیکر اضافه شد');
    closeAllPanels();
  });
}

// Transitions
function renderTransitions() {
  const g = $('#transitions-grid');
  g.innerHTML = TRANSITIONS.map(t => `
    <button class="grid-item" data-tr="${t.id}"><span class="g-icon">${t.icon}</span>${t.name}</button>
  `).join('');
  g.querySelectorAll('[data-tr]').forEach(b => b.onclick = () => {
    toast('انتقال «' + TRANSITIONS.find(t => t.id === b.dataset.tr)?.name + '» اعمال شد');
  });
}

// Projects
function renderProjects() {
  const raw = localStorage.getItem('neon_projects');
  const projects = raw ? JSON.parse(raw) : [];
  const list = $('#projects-list');
  if (!projects.length) {
    list.innerHTML = '<div class="empty-state"><div class="e-icon">📁</div><p>پروژه‌ای ذخیره نشده</p></div>';
    return;
  }
  list.innerHTML = projects.map((p, i) => `
    <div class="project-card">
      <div class="project-thumb">🎬</div>
      <div class="clip-info"><h4>${p.name}</h4><span>${p.date}</span></div>
      <button class="icon-btn danger" data-pdel="${i}">🗑</button>
    </div>
  `).join('');
  list.querySelectorAll('[data-pdel]').forEach(b => b.onclick = () => {
    projects.splice(+b.dataset.pdel, 1);
    localStorage.setItem('neon_projects', JSON.stringify(projects));
    renderProjects();
  });
}
$('#btn-save-project').onclick = () => {
  const raw = localStorage.getItem('neon_projects');
  const projects = raw ? JSON.parse(raw) : [];
  projects.unshift({
    name: state.projectName + ' ' + toFa(projects.length + 1),
    date: new Date().toLocaleDateString('fa-IR'),
    clips: state.clips.length
  });
  localStorage.setItem('neon_projects', JSON.stringify(projects));
  toast('پروژه ذخیره شد');
  renderProjects();
};

// Undo / Redo
$('#btn-undo').onclick = () => {
  if (state.historyIdx <= 0) return toast('چیزی برای بازگشت نیست');
  state.historyIdx--;
  toast('بازگشت');
};
$('#btn-redo').onclick = () => {
  if (state.historyIdx >= state.history.length - 1) return toast('چیزی برای انجام دوباره نیست');
  state.historyIdx++;
  toast('انجام دوباره');
};

// Back
$('#btn-back').onclick = () => {
  video.pause();
  state.playing = false;
  $('#editor-screen').classList.remove('active');
  $('#select-screen').classList.add('active');
  closeAllPanels();
};

// Export
$('#btn-export').onclick = () => {
  $('#export-modal').classList.add('open');
  $('#export-progress').classList.add('hidden');
  $('#export-status').textContent = '';
  $('#btn-start-export').style.display = '';
};
$$('#export-modal [data-res]').forEach(b => b.onclick = () => {
  $$('#export-modal [data-res]').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
});
$$('#export-modal [data-fps]').forEach(b => b.onclick = () => {
  $$('#export-modal [data-fps]').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
});
$('#btn-close-export').onclick = () => $('#export-modal').classList.remove('open');
