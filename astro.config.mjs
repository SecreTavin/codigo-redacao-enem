// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Troque pelo domínio final — usado em canonical, og:image e JSON-LD.
  site: process.env.SITE_URL ?? 'https://codigo-redacao-enem.pages.dev',
  build: { format: 'file' }, // /termos em vez de /termos/ (sem redirect no Cloudflare Pages)
  vite: { plugins: [tailwindcss()] },
});
