lucide.createIcons();

const modal = document.getElementById('contactsModal');
const openBtn = document.getElementById('openContactsBtn');
const closeBtn = document.getElementById('closeModalBtn');
const backdrop = document.getElementById('modalBackdrop');
const title = document.getElementById('heroTitle');

const heroText = 'привет, я здесь';
let index = 0;

function refreshIcons() {
  lucide.createIcons();
}

function wrapHeroTitleChars() {
  const text = title.textContent;
  title.textContent = '';
  [...text].forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'lsd-char';
    span.style.setProperty('--d', `${i * 0.042}s`);
    span.textContent = ch === ' ' ? '\u00a0' : ch;
    if (ch === ' ') {
      span.classList.add('lsd-char--space');
    }
    title.appendChild(span);
  });
}

function typeTitle() {
  if (index < heroText.length) {
    title.textContent += heroText[index];
    index++;
    setTimeout(typeTitle, 55);
  } else {
    title.classList.add('done');
    wrapHeroTitleChars();
  }
}

function openModal() {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

openBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
backdrop.addEventListener('click', closeModal);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal.classList.contains('open')) {
    closeModal();
  }
});

window.addEventListener('load', () => {
  typeTitle();
});
