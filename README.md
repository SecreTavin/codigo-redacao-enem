# Código Redação ENEM 2026 — Página de vendas

Landing page de alta conversão para o ebook **Código Redação ENEM 2026 — O Método Anti-Zero**.

**Stack:** [Astro 7](https://astro.build) (HTML estático, quase zero JS) · Tailwind CSS v4 · TypeScript · fontes self-hosted (Fraunces, Inter, Caveat) · deploy na Cloudflare.

## Rodando

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # gera ./dist
npm run deploy   # build + Cloudflare Pages
```

## Antes de publicar — preencha `src/config/site.ts`

| Campo | O que é |
| --- | --- |
| `checkoutUrl` | **Obrigatório.** Link do checkout da Kiwify. Sem ele, os botões rolam até a oferta. |
| `supportWhatsapp` / `supportEmail` | Aparece no FAQ. |
| `appUrl`, `appName` | Nome/link do app bônus. |
| `anchorPrice` | Preço "de" riscado (opcional). |
| `seller.name` / `seller.document` / `seller.address` | **Obrigatório por lei** (Decreto 7.962/2013): nome/razão social, CPF/CNPJ e endereço do vendedor. O build avisa se estiver vazio. |
| `guaranteeDays` | Prazo de arrependimento exibido (padrão 7 — CDC art. 49). Configure o mesmo prazo na Kiwify. |
| `analytics.metaPixelId` / `ga4Id` | Pixel do Meta e GA4. Os eventos `InitiateCheckout` / `begin_checkout` já disparam nos botões. |

Também troque o domínio em `astro.config.mjs` (ou defina `SITE_URL` no build).

## Decisões de conversão

- **CTA acima da dobra** no mobile e desktop, com preço visível e microcopy de segurança.
- **Barra de compra fixa no mobile**, que aparece após o hero e some na seção de oferta.
- **Diagnóstico Anti-Zero** (5 perguntas): o visitante descobre as próprias lacunas e cada lacuna é ligada ao capítulo que a resolve.
- **Contagem regressiva real** até a redação (8/11/2026, 13h30 BRT) — urgência verdadeira, sem timer falso.
- **UTMs repassados** automaticamente para o checkout (`utm_*`, `src`, `sck`, `fbclid`, `gclid`).
- Conteúdo original enxugado: dor + virada viraram uma só seção, bônus entrou na caixa de oferta.
- SEO: JSON-LD de Produto e FAQ, Open Graph com imagem para WhatsApp/Instagram.
- Acessibilidade: contraste AA, foco visível, `prefers-reduced-motion`, FAQ com `<details>` nativo.

## Segurança, privacidade e normas

- **Cabeçalhos de segurança** gerados no build (`scripts/postbuild.mjs` → `dist/_headers`): CSP estrita com hash SHA-256 dos scripts inline, HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP.
- **LGPD:** Pixel/GA4 só carregam após consentimento explícito (banner aparece apenas se houver ID configurado); Política de Privacidade em `/privacidade`; link "Preferências de cookies" no rodapé.
- **CDC / Decreto 7.962:** Termos de Compra em `/termos` (arrependimento de 7 dias, entrega, licença de uso) e identificação do vendedor no rodapé.
- **Acessibilidade:** contraste WCAG AA verificado, HTML validado (html-validate), Lighthouse 100 em acessibilidade.
- **SEO:** `robots.txt`, `sitemap.xml`, 404 próprio, JSON-LD de Produto e FAQ.

## Estrutura

```
src/
  config/site.ts      # dados do negócio (preço, links, pixels)
  data/content.ts     # todos os textos das seções
  components/         # uma seção por arquivo
  scripts/main.ts     # countdown, contadores, quiz, checkout, sticky bar
  styles/global.css   # tema (tokens) + utilitários
```
