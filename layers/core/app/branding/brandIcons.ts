// Brand icons live on the shared CDN, not in this repo.
const boardsIconsBaseUrl = 'https://laraue.com/static/images/boards/'

export const boardsIconUrl = (name: string): string => `${boardsIconsBaseUrl}boards-${name}.png`

export const boardsLogoUrl = boardsIconUrl('android-chrome-black-192x192')

// The company behind the product, for the organization in structured data.
export const laraueLogoUrl =
  'https://laraue.com/static/images/icons/laraue-android-chrome-black-192x192.png'
