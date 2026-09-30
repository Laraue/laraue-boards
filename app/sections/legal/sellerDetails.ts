// The seller's details, as Robokassa and the law require them to be published: on the offer page
// and in the footer of the site.
export const sellerDetails = {
  email: 'info@laraue.com',
  inn: '344714008567',
  name: {
    en: 'Ilya A. Belyansky',
    ru: 'Белянский Илья Александрович',
  },
  phone: '+7-995-599-48-42',
  phoneHref: '+79955994842',
  status: {
    en: 'self-employed (tax on professional income)',
    ru: 'самозанятый (налог на профессиональный доход)',
  },
} as const
