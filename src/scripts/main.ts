import { site } from '../config/site';

import './consent';

const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Contagem regressiva até a redação ---------- */
function initCountdown() {
  const target = new Date(site.examDateIso).getTime();
  const nodes = $$('[data-cd]');
  if (!nodes.length) return;
  const pad = (n: number) => String(n).padStart(2, '0');

  const tick = () => {
    const diff = Math.max(0, target - Date.now());
    const parts = {
      d: Math.floor(diff / 864e5),
      h: Math.floor((diff / 36e5) % 24),
      m: Math.floor((diff / 6e4) % 60),
      s: Math.floor((diff / 1e3) % 60),
    };
    for (const el of nodes) {
      const k = el.dataset.cd as keyof typeof parts;
      el.textContent = k === 'd' ? String(parts.d) : pad(parts[k]);
    }
  };
  tick();
  setInterval(tick, 1000);
}

/* ---------- Revelação ao rolar + contadores numéricos ---------- */
function animateCount(el: HTMLElement) {
  const end = Number(el.dataset.count);
  const decimals = Number(el.dataset.decimals ?? 0);
  const suffix = el.dataset.suffix ?? '';
  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
  if (reduceMotion) return void (el.textContent = fmt(end));
  const start = performance.now();
  const dur = 1400;
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / dur);
    el.textContent = fmt(end * (1 - Math.pow(1 - t, 4)));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        el.classList.add('is-in');
        $$('[data-count]', el).forEach(animateCount);
        io.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
  );
  $$('[data-reveal]').forEach((el) => io.observe(el));
}

/* ---------- Checkout: repassa UTMs e dispara eventos ---------- */
function initCheckout() {
  const params = new URLSearchParams(location.search);
  const passthrough = [...params].filter(([k]) => /^(utm_|src|sck|fbclid|gclid)/.test(k));

  for (const a of $$<HTMLAnchorElement>('a[data-checkout]')) {
    if (site.checkoutUrl && passthrough.length) {
      const url = new URL(site.checkoutUrl);
      passthrough.forEach(([k, v]) => url.searchParams.set(k, v));
      a.href = url.toString();
    }
    a.addEventListener('click', () => {
      const source = a.dataset.source ?? 'cta';
      window.gtag?.('event', 'begin_checkout', { currency: 'BRL', value: site.price, source });
      window.fbq?.('track', 'InitiateCheckout', { currency: 'BRL', value: site.price });
      if (!site.checkoutUrl) console.warn('[checkout] Preencha checkoutUrl em src/config/site.ts');
    });
  }
}

/* ---------- Barra fixa no mobile ---------- */
function initStickyBar() {
  const bar = document.querySelector<HTMLElement>('[data-sticky]');
  const hero = document.getElementById('hero-cta');
  const offer = document.getElementById('oferta');
  if (!bar || !hero || !offer) return;
  let pastHero = false;
  let inOffer = false;
  const update = () => {
    const show = pastHero && !inOffer;
    bar.dataset.show = String(show);
    bar.setAttribute('aria-hidden', String(!show));
    bar.querySelector('a')?.setAttribute('tabindex', show ? '0' : '-1');
  };
  new IntersectionObserver(([e]) => {
    pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
    update();
  }).observe(hero);
  new IntersectionObserver(([e]) => {
    inOffer = e.isIntersecting;
    update();
  }).observe(offer);
}

/* ---------- Diagnóstico Anti-Zero ---------- */
function initQuiz() {
  const form = document.querySelector<HTMLElement>('[data-quiz]');
  if (!form) return;
  const rows = $$('li[data-fix]', form);
  const result = form.querySelector<HTMLElement>('[data-quiz-result]')!;
  const hint = form.querySelector<HTMLElement>('[data-quiz-hint]')!;
  const q = (s: string) => form.querySelector<HTMLElement>(s)!;
  let tracked = false;

  form.addEventListener('change', () => {
    const answers = rows.map((_, i) => form.querySelector<HTMLInputElement>(`input[name=q${i}]:checked`)?.value ?? '');
    const answered = answers.filter(Boolean).length;
    if (answered < rows.length) {
      hint.textContent = `${answered} de ${rows.length} respondidas`;
      return;
    }
    const gaps = rows.filter((_, i) => answers[i] !== 'sim');
    const score = rows.length - gaps.length;
    q('[data-quiz-score]').textContent = `${score}/${rows.length}`;

    const [title, text] =
      score === rows.length
        ? ['Base sólida. Agora é subir a nota.', 'Você já evita o básico. O material te ajuda a lapidar repertório, conectivos e a Competência 1.']
        : score >= 3
          ? ['Quase lá — mas ainda perdendo pontos.', 'Estas lacunas custam pontos em silêncio. E são exatamente as que o método resolve:']
          : ['Alerta vermelho: risco real de nota baixa.', 'Ainda dá tempo. Comece por aqui, na ordem certa:'];
    q('[data-quiz-title]').textContent = title;
    q('[data-quiz-text]').textContent = text;
    q('[data-quiz-fixes]').innerHTML = gaps
      .map((r) => `<li class="flex gap-2"><span class="text-hl">→</span>${r.dataset.fix}</li>`)
      .join('');

    hint.hidden = true;
    result.classList.remove('hidden');
    if (!tracked) {
      tracked = true;
      window.gtag?.('event', 'quiz_complete', { score });
      result.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
    }
  });
}

/* ---------- FAQ: um aberto por vez ---------- */
function initFaq() {
  const items = $$<HTMLDetailsElement>('[data-faq] details');
  items.forEach((d) =>
    d.addEventListener('toggle', () => {
      if (d.open) items.forEach((o) => o !== d && (o.open = false));
    }),
  );
}

initCountdown();
initReveal();
initCheckout();
initStickyBar();
initQuiz();
initFaq();
