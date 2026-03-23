import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const html = readFileSync(join(projectRoot, 'index.html'), 'utf8');
const css = readFileSync(join(projectRoot, 'styles.css'), 'utf8');
const mainJs = readFileSync(join(projectRoot, 'main.js'), 'utf8');

test('index.html exposes semantic section anchors #work, #stack, #contact', () => {
  assert.match(html, /\bid=["']work["']/);
  assert.match(html, /\bid=["']stack["']/);
  assert.match(html, /\bid=["']contact["']/);
});

test('index.html has exactly one main landmark and no contact modal markup', () => {
  const mainOpens = html.match(/<main\b/g);
  assert.equal(mainOpens?.length, 1, 'expected a single <main> landmark');

  assert.ok(
    !/\bcontactsModal\b/.test(html),
    'should not include legacy modal id contactsModal',
  );
  assert.ok(
    !/\bmodal-card\b/.test(html),
    'should not include modal card markup',
  );
  assert.ok(
    !/role=["']dialog["']/.test(html),
    'should not include dialog role from the old modal',
  );
});

test('section hooks use stable class tokens (BEM-style), not one long exact class string', () => {
  assert.match(html, /\bsection--work\b/);
  assert.match(html, /\bsection--stack\b/);
  assert.match(html, /\bsection--contact\b/);
});

test('index.html provides a static non-empty h1 fallback and keeps hero separate from #work', () => {
  assert.match(
    html,
    /<section\b[^>]*class=["'][^"']*\bhero\b[^"']*["'][^>]*>/,
    'expected a dedicated hero section',
  );
  assert.match(
    html,
    /<section\b[^>]*id=["']work["'][^>]*class=["'][^"']*\bsection--work\b[^"']*["'][^>]*>/,
  );
  assert.doesNotMatch(
    html,
    /<section\b[^>]*id=["']work["'][^>]*class=["'][^"']*\bhero\b[^"']*["'][^>]*>/,
    '#work should not double as the hero section',
  );
  assert.match(
    html,
    /<h1\b[^>]*id=["']heroTitle["'][^>]*>\s*[^<\s][^<]*<\/h1>/,
    'expected non-empty static h1 fallback content',
  );
});

test('outbound target=_blank links include rel=noopener noreferrer', () => {
  const outboundBlankLinks = [...html.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/g)];
  assert.ok(outboundBlankLinks.length > 0, 'expected at least one outbound target=_blank link');

  for (const [anchor] of outboundBlankLinks) {
    assert.match(anchor, /\brel=["'][^"']*\bnoopener\b[^"']*\bnoreferrer\b[^"']*["']/);
  }
});

test('styles.css defines a prefers-reduced-motion fallback block', () => {
  assert.match(
    css,
    /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{/,
  );
});

test('reduced-motion rules stay targeted instead of globally overriding every element', () => {
  const reducedMotionBlock = css.match(
    /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{([\s\S]*?)\n\}/,
  );
  assert.ok(reducedMotionBlock, 'expected prefers-reduced-motion block');
  assert.doesNotMatch(
    reducedMotionBlock[1],
    /\*,\s*\*::before,\s*\*::after/,
    'should not blanket-disable motion on every element',
  );
  assert.match(reducedMotionBlock[1], /\.atmosphere-layer/);
  assert.match(reducedMotionBlock[1], /h1::after/);
});

test('styles.css defines indigo, amber, and lavender palette tokens', () => {
  assert.match(css, /--(?:color-)?indigo\b/i);
  assert.match(css, /--(?:color-)?amber\b/i);
  assert.match(css, /--(?:color-)?lavender\b/i);
});

test('styles.css defines surface, line, and text tone tokens', () => {
  assert.match(css, /--(?:color-)?surface\b/i);
  assert.match(css, /--(?:color-)?line\b|--line\b/);
  assert.match(css, /--(?:color-)?text\b|--text\b/);
});

test('styles.css uses a native system font stack for base typography', () => {
  assert.match(css, /-apple-system/);
  assert.match(css, /BlinkMacSystemFont/);
  assert.match(css, /system-ui/);
});

test('index.html uses section--hero alongside work, stack, and contact', () => {
  assert.match(html, /\bsection--hero\b/);
  assert.match(html, /\bsection--work\b/);
  assert.match(html, /\bsection--stack\b/);
  assert.match(html, /\bsection--contact\b/);
});

test('styles.css wires project-card hooks and decorative atmosphere layers', () => {
  assert.match(css, /\.project-card\b/);
  assert.match(css, /\.project-card__(?:title|summary|role|stack|link)\b/);
  assert.match(css, /\.(?:atmosphere|atmosphere-layer)\b/);
});

test('styles.css includes a faint structural grid rhythm under the atmosphere', () => {
  assert.match(css, /repeating-linear-gradient\s*\(/);
});

test('styles.css defines grid shell and section primitives', () => {
  assert.match(css, /\.page-main\b/);
  assert.match(css, /\.section\b/);
  assert.match(css, /\.panel\b/);
});

test('styles.css sizes contact icons using the lucide i > svg shape', () => {
  assert.match(css, /\.contact-link i svg\s*\{/);
  assert.match(css, /\.contact-link:hover i svg\s*\{/);
});

test('main.js defines bootstrap hooks for reveal and pointer-driven interaction', () => {
  assert.match(mainJs, /\bfunction\s+bootstrapReveal\b/);
  assert.match(mainJs, /\bfunction\s+bootstrapPointerInteraction\b/);
});

test('main.js implements scroll reveal via IntersectionObserver or equivalent', () => {
  assert.match(mainJs, /IntersectionObserver/);
  assert.match(mainJs, /observe\s*\(/);
});

test('main.js tracks pointer position for CSS-driven effects', () => {
  assert.match(mainJs, /setProperty\s*\(\s*['"]--pointer-(?:x|y)/);
  assert.match(mainJs, /\bpointermove\b/);
});

test('styles.css hooks interaction visuals to data-revealed and pointer custom properties', () => {
  assert.match(css, /\[data-revealed/);
  assert.match(css, /--pointer-x\b/);
  assert.match(css, /--pointer-y\b/);
});

test('styles.css only hides unrevealed sections when JavaScript enhancement is active', () => {
  assert.match(css, /html\[data-js=["']true["']\]\s+#work\[data-revealed=["']false["']\]/);
  assert.match(css, /html\[data-js=["']true["']\]\s+#stack\[data-revealed=["']false["']\]/);
  assert.match(css, /html\[data-js=["']true["']\]\s+#contact\[data-revealed=["']false["']\]/);
  assert.doesNotMatch(css, /(^|\n)#work\[data-revealed=["']false["']\],/);
});

test('main.js enables JS-only reveal styling without timed hero typing', () => {
  assert.match(mainJs, /document\.documentElement\.setAttribute\(\s*['"]data-js['"],\s*['"]true['"]\s*\)/);
  assert.doesNotMatch(mainJs, /\bfunction\s+typeTitle\b/);
  assert.doesNotMatch(mainJs, /title\.textContent\s*=\s*['"][^'"]*['"]/);
  assert.doesNotMatch(mainJs, /setTimeout\s*\(\s*typeTitle/);
});

function extractMainInner(htmlStr) {
  const m = htmlStr.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  return m ? m[1] : '';
}

function extractSectionById(htmlStr, id) {
  const re = new RegExp(
    `<section\\b[^>]*\\bid=["']${id}["'][^>]*>[\\s\\S]*?<\\/section>`,
    'i',
  );
  const m = htmlStr.match(re);
  return m ? m[0] : '';
}

test('document is English-first: html lang and locale-facing metadata', () => {
  assert.match(html, /<html\b[^>]*\blang=["']en["']/i);
  assert.match(html, /<meta\s+property=["']og:locale["']\s+content=["']en_US["']\s*\/?>/i);
});

test('main content order: hero section before work, stack, and contact', () => {
  const inner = extractMainInner(html);
  const heroPos = inner.search(/<section\b[^>]*\bhero\b[^>]*>/i);
  const workPos = inner.search(/\bid=["']work["']/i);
  const stackPos = inner.search(/\bid=["']stack["']/i);
  const contactPos = inner.search(/\bid=["']contact["']/i);
  assert.ok(heroPos !== -1 && workPos !== -1 && stackPos !== -1 && contactPos !== -1);
  assert.ok(heroPos < workPos && workPos < stackPos && stackPos < contactPos);
});

test('progressive sections start hidden in HTML so reveal does not jump on load', () => {
  assert.match(html, /<section\b[^>]*id=["']work["'][^>]*data-revealed=["']false["']/i);
  assert.match(html, /<section\b[^>]*id=["']stack["'][^>]*data-revealed=["']false["']/i);
  assert.match(html, /<section\b[^>]*id=["']contact["'][^>]*data-revealed=["']false["']/i);
});

test('heading hierarchy: one h1 in hero and h2 section headings (no h2 before h1)', () => {
  assert.equal((html.match(/<h1\b/gi) || []).length, 1);
  const h1Pos = html.search(/<h1\b/i);
  const h2Pos = html.search(/<h2\b/i);
  assert.ok(h1Pos !== -1 && h2Pos !== -1 && h1Pos < h2Pos);

  const inner = extractMainInner(html);
  const heroChunk = inner.match(/<section\b[^>]*\bhero\b[^>]*>[\s\S]*?<\/section>/i);
  assert.ok(heroChunk, 'expected hero section');
  assert.match(heroChunk[0], /<h1\b/i);
  assert.doesNotMatch(heroChunk[0], /<h2\b/i);

  assert.match(extractSectionById(html, 'work'), /<h2\b/i);
  assert.match(extractSectionById(html, 'stack'), /<h2\b/i);
  assert.match(extractSectionById(html, 'contact'), /<h2\b/i);
});

test('hero states backend role (or approved equivalent)', () => {
  const inner = extractMainInner(html);
  const heroChunk = inner.match(/<section\b[^>]*\bhero\b[^>]*>[\s\S]*?<\/section>/i);
  assert.ok(heroChunk);
  assert.match(
    heroChunk[0],
    /\bBackend\b/i,
    'hero should mention backend role (e.g. Backend engineer)',
  );
});

test('work section has exactly three project cards with structured fields and links', () => {
  const sectionHtml = extractSectionById(html, 'work');
  assert.ok(sectionHtml);
  const cards = [...sectionHtml.matchAll(/<article\b[^>]*\bproject-card\b[^>]*>/gi)];
  assert.equal(cards.length, 3, 'expected exactly three project cards');

  for (const cardMatch of cards) {
    const start = cardMatch.index;
    const rest = sectionHtml.slice(start);
    const endTag = rest.search(/<\/article>/i);
    assert.ok(endTag !== -1);
    const cardHtml = rest.slice(0, endTag + '</article>'.length);
    assert.match(cardHtml, /\bproject-card__title\b/);
    assert.match(cardHtml, /\bproject-card__summary\b/);
    assert.match(cardHtml, /\bproject-card__role\b/);
    assert.match(cardHtml, /\bproject-card__stack\b/);
    assert.match(cardHtml, /<a\b[^>]*\bproject-card__link\b[^>]*\bhref=["'][^"']+["']/i);
  }
});

test('project card links use honest destinations instead of three identical external placeholders', () => {
  const sectionHtml = extractSectionById(html, 'work');
  const hrefs = [...sectionHtml.matchAll(
    /<a\b[^>]*\bproject-card__link\b[^>]*\bhref=["']([^"']+)["']/gi,
  )].map(([, href]) => href);

  assert.equal(hrefs.length, 3, 'expected exactly three project-card links');
  assert.notDeepEqual(
    hrefs,
    [hrefs[0], hrefs[0], hrefs[0]],
    'project links should not all point to the same destination',
  );
});

test('stack section lists grouped categories: Languages, Frameworks, Data and messaging, Infrastructure and tooling', () => {
  const inner = extractMainInner(html);
  const stackChunk = inner.match(
    /<section\b[^>]*\bid=["']stack["'][^>]*>[\s\S]*?<\/section>/i,
  );
  assert.ok(stackChunk);
  const s = stackChunk[0];
  assert.match(s, /\bLanguages\b/);
  assert.match(s, /\bFrameworks\b/);
  assert.match(s, /\bData and messaging\b/);
  assert.match(s, /\bInfrastructure and tooling\b/);
});

test('contact section is link-based and includes mailto, GitHub, and Telegram', () => {
  const inner = extractMainInner(html);
  const contactChunk = inner.match(
    /<section\b[^>]*\bid=["']contact["'][^>]*>[\s\S]*?<\/section>/i,
  );
  assert.ok(contactChunk);
  const c = contactChunk[0];
  assert.match(c, /href=["']mailto:[^"']+["']/i);
  assert.match(c, /href=["']https?:\/\/[^"']*github\.com[^"']*["']/i);
  assert.match(c, /href=["']https?:\/\/t\.me\/[^"']+["']/i);
});

test('hero exposes primary work CTA and secondary contact anchor', () => {
  const inner = extractMainInner(html);
  const heroChunk = inner.match(/<section\b[^>]*\bhero\b[^>]*>[\s\S]*?<\/section>/i);
  assert.ok(heroChunk);
  const h = heroChunk[0];
  assert.match(h, /href=["']#work["']/);
  assert.match(h, /href=["']#contact["']/);
});

test('decorative lucide icon hosts are hidden from assistive tech when text labels already exist', () => {
  const iconHosts = [...html.matchAll(/<i\b[^>]*data-lucide=["'][^"']+["'][^>]*>/g)].map(([tag]) => tag);
  assert.ok(iconHosts.length > 0, 'expected lucide icon hosts');

  for (const iconHost of iconHosts) {
    assert.match(iconHost, /\baria-hidden=["']true["']/);
  }
});

test('main.js removes dead icon refresh and lsd-char DOM wrapping', () => {
  assert.doesNotMatch(mainJs, /\bfunction\s+refreshIcons\b/);
  assert.doesNotMatch(mainJs, /\bfunction\s+wrapHeroTitleChars\b/);
  assert.doesNotMatch(mainJs, /\blsd-char\b/);
});

test('index.html includes noscript fallback so progressive sections stay readable without JavaScript', () => {
  assert.match(html, /<noscript\b/i, 'expected a noscript block for no-JS users');
  const noscriptMatch = html.match(/<noscript\b[^>]*>([\s\S]*?)<\/noscript>/i);
  assert.ok(noscriptMatch, 'expected parseable noscript content');
  const nos = noscriptMatch[1];
  assert.match(nos, /#work/, 'noscript fallback should target #work');
  assert.match(nos, /#stack/, 'noscript fallback should target #stack');
  assert.match(nos, /#contact/, 'noscript fallback should target #contact');
});

test('main.js reveals progressive sections when bootstrap fails (runtime error fallback)', () => {
  assert.match(
    mainJs,
    /\bfunction\s+revealProgressiveSectionsFallback\b/,
    'expected a named fallback when interaction bootstrap throws',
  );
  assert.match(mainJs, /\btry\s*\{[\s\S]*\bcatch\b/, 'expected try/catch around fragile bootstrap paths');
  assert.match(mainJs, /revealProgressiveSectionsFallback\s*\(/);
});
