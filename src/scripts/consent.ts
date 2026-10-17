import { site } from '../config/site';

type Choice = 'granted' | 'denied';
const KEY = 'cr-consent-v1';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; callMethod?: Function; loaded?: boolean; version?: string; push?: unknown };
    _fbq?: unknown;
  }
}

const read = (): Choice | null => {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
};

const save = (v: Choice) => {
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* modo privado: vale só para esta visita */
  }
};

function inject(src: string) {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.append(s);
}

function loadAnalytics() {
  const { ga4Id, metaPixelId } = site.analytics;
  if (ga4Id) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', ga4Id, { anonymize_ip: true });
    inject(`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`);
  }
  if (metaPixelId && !window.fbq) {
    const fbq: any = function (...args: unknown[]) {
      fbq.callMethod ? fbq.callMethod(...args) : fbq.queue.push(args);
    };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    window.fbq = window._fbq = fbq;
    inject('https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', metaPixelId);
    fbq('track', 'PageView');
  }
}

export function initConsent() {
  const banner = document.querySelector<HTMLElement>('[data-consent]');
  const choice = read();
  if (choice === 'granted') return loadAnalytics();
  if (choice === 'denied' || !banner) return;

  banner.classList.remove('hidden');
  banner.querySelectorAll<HTMLButtonElement>('[data-consent-choice]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const v = btn.dataset.consentChoice as Choice;
      save(v);
      banner.remove();
      if (v === 'granted') loadAnalytics();
    }),
  );
}

/** Permite reabrir a escolha (link "Preferências de cookies" no rodapé). */
export function resetConsent() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
  location.reload();
}
