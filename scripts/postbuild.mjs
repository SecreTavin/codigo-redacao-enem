/**
 * Pós-build: gera dist/_headers (Cloudflare Pages) com cabeçalhos de segurança
 * e uma Content-Security-Policy estrita, com o hash SHA-256 de cada script inline.
 */
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

async function htmlFiles(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await htmlFiles(p)));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const hashes = new Set();
for (const file of await htmlFiles(DIST)) {
  const html = await readFile(file, 'utf8');
  for (const [, attrs, body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc=/.test(attrs) || /application\/ld\+json/.test(attrs) || !body.trim()) continue;
    hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
  }
}

// Domínios do Meta Pixel e do GA4 — só são usados após o consentimento.
const analytics = {
  script: 'https://connect.facebook.net https://www.googletagmanager.com',
  connect: 'https://www.facebook.com https://connect.facebook.net https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com',
  img: 'https://www.facebook.com https://*.google-analytics.com https://www.googletagmanager.com',
};

const csp = [
  "default-src 'self'",
  `script-src 'self' ${[...hashes].join(' ')} ${analytics.script}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: ${analytics.img}`,
  "font-src 'self'",
  `connect-src 'self' ${analytics.connect}`,
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://pay.kiwify.com.br",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const headers = `/*
  Content-Security-Policy: ${csp}
  Strict-Transport-Security: max-age=63072000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
  Cross-Origin-Opener-Policy: same-origin
  X-DNS-Prefetch-Control: on

/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/*.png
  Cache-Control: public, max-age=86400
`;

await writeFile(join(DIST, '_headers'), headers);
console.log(`✓ _headers gerado (${hashes.size} script(s) inline com hash)`);

// Aviso legal: identificação do vendedor é obrigatória (Decreto 7.962/2013).
const cfg = await readFile(new URL('../src/config/site.ts', import.meta.url), 'utf8');
const seller = cfg.match(/seller:\s*{([\s\S]*?)}/)?.[1] ?? '';
if (/name:\s*''/.test(seller) || /document:\s*''/.test(seller)) {
  console.warn('⚠ Preencha site.seller (nome e CPF/CNPJ) em src/config/site.ts — exigência do Decreto 7.962/2013.');
}
