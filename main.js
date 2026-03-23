document.documentElement.setAttribute('data-js', 'true');

function revealProgressiveSectionsFallback() {
  document.querySelectorAll('#work, #stack, #contact').forEach((el) => {
    el.setAttribute('data-revealed', 'true');
  });
}

try {
  lucide.createIcons();
} catch {
  revealProgressiveSectionsFallback();
}

/** Real viewport height in px — WebKit often caches 100dvh / -webkit-fill-available after resize */
function setViewportHeightUnit() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}
setViewportHeightUnit();
window.addEventListener('resize', setViewportHeightUnit);
window.addEventListener('orientationchange', () => {
  setTimeout(setViewportHeightUnit, 50);
});

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function bootstrapReveal() {
  const selector = '#work, #stack, #contact';
  const nodes = document.querySelectorAll(selector);

  if (prefersReducedMotion()) {
    nodes.forEach((el) => el.setAttribute('data-revealed', 'true'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-revealed', 'true');
          observer.unobserve(entry.target);
        }
      }
    },
    { root: null, rootMargin: '0px 0px -12% 0px', threshold: [0, 0.06, 0.12] },
  );

  nodes.forEach((el) => {
    el.setAttribute('data-revealed', 'false');
    observer.observe(el);
  });
}

function bootstrapPointerInteraction() {
  const root = document.documentElement;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const reduced = prefersReducedMotion();

  function applyPointer(clientX, clientY) {
    if (reduced || coarsePointer) {
      root.style.setProperty('--pointer-x', '0.5');
      root.style.setProperty('--pointer-y', '0.5');
      return;
    }
    const x = Math.min(1, Math.max(0, clientX / window.innerWidth));
    const y = Math.min(1, Math.max(0, clientY / window.innerHeight));
    root.style.setProperty('--pointer-x', String(x));
    root.style.setProperty('--pointer-y', String(y));
  }

  applyPointer(window.innerWidth * 0.32, window.innerHeight * 0.26);

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'touch') {
        return;
      }
      applyPointer(e.clientX, e.clientY);
    },
    { passive: true },
  );
}

function bootstrapPage() {
  try {
    bootstrapReveal();
    bootstrapPointerInteraction();
  } catch {
    revealProgressiveSectionsFallback();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapPage, { once: true });
} else {
  bootstrapPage();
}
