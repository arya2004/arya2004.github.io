/* ─── THEME DEFINITIONS ─── */
const THEMES = [
  { id: 'bay',         name: 'Bay',         hue: 212, chroma: 100 },
  { id: 'wintergreen', name: 'Wintergreen', hue: 162, chroma: 100 },
  { id: 'peony',       name: 'Peony',       hue: 338, chroma: 95  },
  { id: 'hazel',       name: 'Hazel',       hue:  36, chroma: 88  },
  { id: 'coral',       name: 'Coral',       hue:  14, chroma: 100 },
  { id: 'violet',      name: 'Violet',      hue: 270, chroma: 85  },
  { id: 'sage',        name: 'Sage',        hue: 145, chroma: 65  },
  { id: 'obsidian',    name: 'Obsidian',    hue: 220, chroma: 18  },
];

const MODE_KEY = 'ap-mode';
const LAST_THEME_INDEX_KEY = 'ap-last-theme-index';

let currentTheme = 0;
let isDark = false;

const root = document.documentElement;

function applyTheme(index, { showToast = true } = {}) {
  const t = THEMES[index];
  root.style.setProperty('--h', t.hue);
  root.style.setProperty('--c', t.chroma + '%');
  localStorage.setItem(LAST_THEME_INDEX_KEY, String(index));
  /* update labels */
  document.getElementById('rail-theme-name').textContent = t.name;
  if (showToast) showSnackbar(t.name);
}

function cycleTheme() {
  currentTheme = (currentTheme + 1) % THEMES.length;
  applyTheme(currentTheme);
}

function toggleDark() {
  isDark = !isDark;
  root.setAttribute('data-mode', isDark ? 'dark' : 'light');
  localStorage.setItem(MODE_KEY, isDark ? 'dark' : 'light');
  const icons = ['rail-dark-icon', 'top-dark-icon'];
  icons.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = isDark ? 'light_mode' : 'dark_mode';
  });
}

function applyStoredMode() {
  const savedMode = localStorage.getItem(MODE_KEY);
  if (savedMode === 'dark' || savedMode === 'light') {
    isDark = savedMode === 'dark';
    root.setAttribute('data-mode', savedMode);
  } else {
    isDark = root.getAttribute('data-mode') === 'dark';
  }

  const iconValue = isDark ? 'light_mode' : 'dark_mode';
  ['rail-dark-icon', 'top-dark-icon'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = iconValue;
  });
}

function pickRandomThemeIndex() {
  const lastIndexRaw = localStorage.getItem(LAST_THEME_INDEX_KEY);
  const lastIndex = Number.parseInt(lastIndexRaw ?? '', 10);
  const max = THEMES.length;

  if (max <= 1) return 0;
  if (!Number.isInteger(lastIndex) || lastIndex < 0 || lastIndex >= max) {
    return Math.floor(Math.random() * max);
  }

  let next = lastIndex;
  while (next === lastIndex) {
    next = Math.floor(Math.random() * max);
  }
  return next;
}

/* ─── SNACKBAR ─── */
let snackTimer = null;
function showSnackbar(text) {
  const sb = document.getElementById('snackbar');
  const st = document.getElementById('snackbar-text');
  st.textContent = text;
  sb.classList.add('show');
  clearTimeout(snackTimer);
  snackTimer = setTimeout(() => sb.classList.remove('show'), 2200);
}

/* ─── ATTACH CONTROLS ─── */
['rail-theme-btn', 'top-theme-btn'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', cycleTheme);
});
['rail-dark-btn', 'top-dark-btn'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', toggleDark);
});

/* ─── FAB ─── */
const fab = document.getElementById('fab');
window.addEventListener('scroll', () => {
  fab.classList.toggle('show', window.scrollY > 320);
}, { passive: true });
fab.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ─── ACTIVE NAV ON SCROLL ─── */
const sections = ['hero', 'experience', 'projects', 'skills', 'education', 'achievements'];
const allNavItems = document.querySelectorAll('.nav-item[data-section]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      allNavItems.forEach(item => {
        item.classList.toggle('active', item.dataset.section === id);
      });
    }
  });
}, { threshold: 0.35 });

sections.forEach(id => {
  const el = document.getElementById(id);
  if (el) sectionObserver.observe(el);
});

/* ─── SCROLL REVEAL ─── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ─── SMOOTH SCROLL FOR NAV ─── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = isDark ? 0 : 0;
      const topOffset = window.innerWidth <= 768 ? 64 : 0;
      window.scrollTo({
        top: target.offsetTop - topOffset - 16,
        behavior: 'smooth'
      });
    }
  });
});

/* ─── CHIP RIPPLE (M3 feel) ─── */
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('mousedown', function(e) {
    const r = document.createElement('span');
    r.style.cssText = `
      position:absolute;width:6px;height:6px;border-radius:50%;
      background:currentColor;opacity:0.25;
      left:${e.offsetX - 3}px;top:${e.offsetY - 3}px;
      transform:scale(0);transition:transform 400ms ease,opacity 400ms ease;
      pointer-events:none;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(r);
    requestAnimationFrame(() => {
      r.style.transform = 'scale(20)';
      r.style.opacity = '0';
    });
    setTimeout(() => r.remove(), 500);
  });
});

/* ─── INITIAL THEME ─── */
applyStoredMode();
currentTheme = pickRandomThemeIndex();
applyTheme(currentTheme, { showToast: false });