/**
 * Configuração central da página de vendas.
 * Tudo que é "dado do negócio" (preço, links, contato, pixels) mora aqui.
 * Campos vazios são tratados com segurança: o botão de compra rola até a oferta
 * em vez de abrir um link quebrado.
 */
export const site = {
  productName: 'Código Redação ENEM 2026',
  tagline: 'O Método Anti-Zero',
  description:
    'Ebook direto ao ponto para evitar os erros que zeram a redação do ENEM e treinar do jeito que a banca corrige. Método de 4 parágrafos, fórmulas ECT e TARP e checklist de autocorreção.',

  price: 49.9,
  /** Preço "âncora" opcional (ex.: 97). Deixe null para não exibir. */
  anchorPrice: null as number | null,

  /** Link do checkout Kiwify. UTMs da URL atual são repassados automaticamente. */
  checkoutUrl: 'https://pay.kiwify.com.br/OvSDrOL',
  /** Link do app bônus (opcional). */
  appUrl: '',
  appName: 'app de estudos',

  /** Direito de arrependimento (CDC, art. 49) — 7 dias para compras online. */
  guaranteeDays: 7,

  /** WhatsApp (só dígitos, com DDI) ou e-mail de suporte. */
  supportWhatsapp: '',
  supportEmail: '',

  examDateIso: '2026-11-08T13:30:00-03:00',
  examDateLabel: '8 de novembro de 2026, às 13h30 (Brasília)',

  analytics: {
    /** ID do Meta Pixel (ex.: '1234567890'). */
    metaPixelId: '',
    /** ID do GA4 (ex.: 'G-XXXXXXX'). */
    ga4Id: '',
  },
} as const;

export const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
