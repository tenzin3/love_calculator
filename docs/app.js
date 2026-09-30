import { calculateLove, getMessage } from './calculator.mjs';

const form = document.querySelector('#love-form');
const firstInput = document.querySelector('#your-name');
const secondInput = document.querySelector('#their-name');
const formView = document.querySelector('#form-view');
const resultView = document.querySelector('#result-view');
const card = document.querySelector('.card');
const stage = document.querySelector('#match-stage');
const submit = form.querySelector('button');
const error = document.querySelector('#form-error');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let loveNote = '';
let frame;
let pending = false;

for (const input of [firstInput, secondInput]) {
  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    error.textContent = '';
    stage.dataset.mood = firstInput.value.trim() || secondInput.value.trim() ? 'curious' : 'idle';
  });
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (pending) return;
  const invalid = [firstInput, secondInput].find(input => !input.value.trim());
  if (invalid) {
    error.textContent = 'Two names make the magic. Add a name to continue.';
    invalid.setAttribute('aria-invalid', 'true');
    invalid.focus();
    return;
  }
  const first = firstInput.value.trim();
  const second = secondInput.value.trim();
  const score = calculateLove(first, second);
  const [title, description] = getMessage(score);
  pending = true;
  submit.disabled = true;
  card.classList.add('calculating');
  submit.firstElementChild.textContent = 'Looking for a little magic…';
  form.setAttribute('aria-busy', 'true');
  if (!reducedMotion.matches) await new Promise(resolve => setTimeout(resolve, 850));
  document.querySelector('#couple-names').textContent = `${first} & ${second}`;
  stage.dataset.mood = score >= 75 ? 'swoony' : score >= 45 ? 'sweet' : 'shy';
  document.querySelector('#result-title').textContent = title;
  document.querySelector('#result-description').textContent = description;
  document.querySelector('#copy-status').textContent = '';
  document.querySelector('#score').textContent = reducedMotion.matches ? score : '0';
  formView.hidden = true;
  resultView.hidden = false;
  resultView.classList.add('revealed');
  card.classList.remove('calculating');
  document.querySelector('#couple-names').focus({ preventScroll: true });
  document.querySelector('#result-announcement').textContent = `${first} and ${second}: ${score} percent. ${title} ${description}`;
  loveNote = `${first} & ${second}: ${score}% ♡ ${title}\nJust for fun — the real story is yours to write.\n${window.location.origin}${window.location.pathname}`;
  if (!reducedMotion.matches) {
    const start = performance.now();
    const animate = now => {
      const progress = Math.min((now - start) / 1100, 1);
      document.querySelector('#score').textContent = Math.round(score * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    celebrate();
  }
  pending = false;
  submit.disabled = false;
  submit.firstElementChild.textContent = 'Calculate love!';
  form.removeAttribute('aria-busy');
});

function celebrate() {
  const container = document.querySelector('.celebration');
  container.replaceChildren();
  for (let i = 0; i < 22; i++) {
    const heart = document.createElement('span');
    heart.className = 'confetti-heart';
    heart.textContent = i % 3 === 0 ? '✧' : '♡';
    const angle = (i / 22) * Math.PI * 2;
    const distance = 130 + Math.random() * 130;
    heart.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
    heart.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
    heart.style.setProperty('--r', `${Math.random() * 90 - 45}deg`);
    heart.style.animationDelay = `${Math.random() * .2}s`;
    heart.addEventListener('animationend', () => heart.remove(), { once: true });
    container.append(heart);
  }
}

document.querySelector('#try-again').addEventListener('click', () => {
  cancelAnimationFrame(frame);
  resultView.hidden = true;
  resultView.classList.remove('revealed');
  formView.hidden = false;
  stage.dataset.mood = 'idle';
  document.querySelector('.celebration').replaceChildren();
  document.querySelector('#result-announcement').textContent = '';
  firstInput.focus({ preventScroll: true });
  firstInput.select();
});

document.querySelector('#copy-result').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText(loveNote);
    status.textContent = 'Love note copied. Make someone smile.';
  } catch {
    status.textContent = 'Copy isn’t available here. You can select the result above.';
  }
});
