const iconsBaseUrl = 'https://laraue.com/static/images/icons/'

// Laraue brand icons live on the shared CDN, not in this repo.
export const laraueIconUrl = (name: string): string => `${iconsBaseUrl}laraue-${name}.png`

export const laraueLogoUrl = laraueIconUrl('android-chrome-black-192x192')
