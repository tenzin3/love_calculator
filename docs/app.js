import { calculateLove, getMessage, getMood, toTibetanNumerals } from './calculator.mjs';

const $ = selector => document.querySelector(selector);
const form = $('#love-form');
const firstInput = $('#your-name');
const secondInput = $('#their-name');
const formView = $('#form-view');
const resultView = $('#result-view');
const card = $('.card');
const stage = $('#match-stage');
const submit = form.querySelector('button');
const error = $('#form-error');
const scoreEl = $('#score');
const gaugeFill = $('.gauge-fill');
const boy = $('.character--boy');
const girl = $('.character--girl');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const FLAG_COLORS = ['blue', 'white', 'red', 'green', 'yellow'];
let frame;
let pending = false;
let bubbleTimer;

/* ── Mood: drives every character, sky and flag animation via CSS ── */
function setMood(mood) {
  stage.dataset.mood = mood;
  document.body.dataset.mood = mood;
  updateGaze();
}

/* ── Prayer flags strung across the top of the page ── */
function buildFlags() {
  const container = $('.flags--top');
  const width = container.clientWidth;
  const count = Math.max(8, Math.round(width / 52));
  const sag = Math.min(70, width * 0.06);
  const yAt = t => 14 + sag * 4 * t * (1 - t);
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.classList.add('string');
  svg.setAttribute('viewBox', `0 0 ${width} 120`);
  svg.setAttribute('preserveAspectRatio', 'none');
  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d', `M0 ${yAt(0)} Q${width / 2} ${14 + sag * 2} ${width} ${yAt(1)}`);
  svg.append(path);
  container.replaceChildren(svg);
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const flag = document.createElement('span');
    flag.className = `flag flag--${FLAG_COLORS[i % 5]}`;
    flag.style.left = `${t * 100}%`;
    flag.style.top = `${yAt(t) - 1}px`;
    // flags hang slightly tilted along the slope of the string
    const slope = sag * 4 * (1 - 2 * t) / width;
    flag.style.setProperty('--hang', `${Math.atan(slope) * 57}deg`);
    flag.style.setProperty('--delay', `${-(i * 0.23).toFixed(2)}s`);
    flag.style.setProperty('--speed', `${(2.2 + Math.random() * 0.9).toFixed(2)}s`);
    container.append(flag);
  }
}

/* ── Lotus petals around the score ── */
function buildPetals() {
  const group = $('.petals');
  const petals = [];
  for (let i = 0; i < 16; i++) {
    petals.push(`<path transform="rotate(${i * 22.5} 110 110)" d="M110 4C121 14 124 26 110 36C96 26 99 14 110 4Z"/>`);
  }
  group.innerHTML = petals.join('');
}

/* ── Eyes: follow the pointer while waiting, otherwise look where the mood says ── */
let pointer = null;
function updateGaze() {
  const mood = stage.dataset.mood;
  for (const character of [boy, girl]) {
    const dir = character === boy ? 1 : -1;
    let x = 0;
    let y = 0;
    if ((mood === 'idle' || mood === 'curious') && pointer) {
      const box = character.querySelector('.char-svg').getBoundingClientRect();
      const dx = pointer.x - (box.left + box.width / 2);
      const dy = pointer.y - (box.top + box.height * 0.27);
      const len = Math.hypot(dx, dy) || 1;
      x = (dx / len) * 3.2;
      y = (dy / len) * 2.6;
    } else if (mood === 'curious' || mood === 'calculating') { x = 3 * dir; y = 1.5; }
    else if (mood === 'sweet') { x = 3.2 * dir; y = 0.5; }
    else if (mood === 'sad') { x = -1 * dir; y = 3; }
    character.querySelector('.gaze').style.transform = `translate(${x}px, ${y}px)`;
  }
}
window.addEventListener('pointermove', event => {
  pointer = { x: event.clientX, y: event.clientY };
  if (!reducedMotion.matches) requestAnimationFrame(updateGaze);
}, { passive: true });

/* ── Speech bubbles ── */
const LINES = {
  ecstatic: [['Lha gyalo!', 'Kiki soso!'], ['Lha gyalo!', 'I knew it!']],
  happy: [['Yakpo red!', 'Yay!'], ['Hehe…', 'Yakpo red!']],
  sweet: [['Hmm… maybe?', 'Oh?'], ['…hi', '…hello']],
  sad: [['A-kha-kha…', 'Oh no…'], ['Hmm…', 'A-kha…']],
  heartbroken: [['A-kha-kha!', 'Hmph.'], ['…', 'A-kha…']],
};
function speak(mood) {
  clearTimeout(bubbleTimer);
  const options = LINES[mood];
  const [boyLine, girlLine] = options[Math.floor(Math.random() * options.length)];
  const boyBubble = boy.querySelector('.bubble');
  const girlBubble = girl.querySelector('.bubble');
  boyBubble.textContent = boyLine;
  girlBubble.textContent = girlLine;
  boyBubble.classList.add('show');
  bubbleTimer = setTimeout(() => {
    girlBubble.classList.add('show');
    bubbleTimer = setTimeout(hideBubbles, 2600);
  }, 650);
}
function hideBubbles() {
  clearTimeout(bubbleTimer);
  for (const bubble of document.querySelectorAll('.bubble')) bubble.classList.remove('show');
}

/* ── Typing: the person whose name is being written leans in and blushes ── */
for (const [input, character] of [[firstInput, boy], [secondInput, girl]]) {
  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    error.textContent = '';
    if (stage.dataset.mood === 'idle' || stage.dataset.mood === 'curious') {
      setMood(firstInput.value.trim() || secondInput.value.trim() ? 'curious' : 'idle');
    }
  });
  input.addEventListener('focus', () => character.classList.add('is-typing'));
  input.addEventListener('blur', () => character.classList.remove('is-typing'));
}

/* ── Submit ── */
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (pending) return;
  const invalid = [firstInput, secondInput].find(input => !input.value.trim());
  if (invalid) {
    error.textContent = 'Two names make the magic — add the missing one.';
    invalid.setAttribute('aria-invalid', 'true');
    invalid.focus();
    return;
  }
  const first = firstInput.value.trim();
  const second = secondInput.value.trim();
  const score = calculateLove(first, second);
  const mood = getMood(score);
  const [title, description] = getMessage(score);

  pending = true;
  submit.disabled = true;
  submit.firstElementChild.textContent = 'The wind is carrying it…';
  form.setAttribute('aria-busy', 'true');
  boy.classList.remove('is-typing');
  girl.classList.remove('is-typing');
  setMood('calculating');
  card.classList.add('calculating');
  if (!reducedMotion.matches) await wait(1500);
  card.classList.remove('calculating');

  $('#couple-names').textContent = `${first} & ${second}`;
  $('#result-title').textContent = title;
  $('#result-description').textContent = description;
  $('#score-tib').textContent = '';
  formView.hidden = true;
  resultView.hidden = false;
  resultView.classList.remove('revealed');
  void resultView.offsetWidth; // restart the reveal animation
  resultView.classList.add('revealed');
  $('#couple-names').focus({ preventScroll: true });
  $('#result-announcement').textContent = `${first} and ${second}: ${score} percent. ${title} ${description}`;

  // Bring the reacting characters into view (top on phones, whole stage on wider screens).
  const narrow = window.matchMedia('(max-width: 860px)').matches;
  stage.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: narrow ? 'start' : 'nearest' });

  if (reducedMotion.matches) {
    showScore(score, score);
    setMood(mood);
  } else {
    // Count up — the characters hold their breath, then react when the number lands.
    const start = performance.now();
    const duration = 1400;
    const animate = now => {
      const progress = Math.min((now - start) / duration, 1);
      showScore(Math.round(score * (1 - Math.pow(1 - progress, 3))), score);
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setMood(mood);
        speak(mood);
        celebrate(mood);
      }
    };
    frame = requestAnimationFrame(animate);
  }

  pending = false;
  submit.disabled = false;
  submit.firstElementChild.textContent = 'Send it on the wind';
  form.removeAttribute('aria-busy');
});

function showScore(value, final) {
  scoreEl.textContent = value;
  gaugeFill.style.strokeDashoffset = String(100 - value);
  if (value === final) $('#score-tib').textContent = toTibetanNumerals(final);
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

/* ── Burst of tiny prayer flags (more joy = more flags) ── */
function celebrate(mood) {
  const container = $('.celebration');
  container.replaceChildren();
  const amount = { ecstatic: 46, happy: 26, sweet: 10 }[mood] || 0;
  for (let i = 0; i < amount; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.background = `var(--flag-${FLAG_COLORS[i % 5]})`;
    const angle = (i / amount) * Math.PI * 2 + Math.random() * 0.3;
    const distance = 120 + Math.random() * (mood === 'ecstatic' ? 220 : 130);
    piece.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
    piece.style.setProperty('--y', `${Math.sin(angle) * distance - 60}px`);
    piece.style.setProperty('--r', `${Math.random() * 720 - 360}deg`);
    piece.style.animationDelay = `${Math.random() * 0.15}s`;
    piece.addEventListener('animationend', () => piece.remove(), { once: true });
    container.append(piece);
  }
}

/* ── Try again ── */
$('#try-again').addEventListener('click', () => {
  cancelAnimationFrame(frame);
  hideBubbles();
  resultView.hidden = true;
  resultView.classList.remove('revealed');
  formView.hidden = false;
  showScore(0, -1);
  setMood('curious');
  $('.celebration').replaceChildren();
  $('#result-announcement').textContent = '';
  firstInput.focus({ preventScroll: true });
  firstInput.select();
});


buildFlags();
buildPetals();
let resizeTimer;
window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(buildFlags, 150); });
