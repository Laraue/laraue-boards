export type BillingTokenPackViewModel = {
  currencyCode: string
  expirationMonths: null | number
  formattedPrice: string
  id: string
  title: string
  tokens: number
}

export type TokenPacksPageDeps = {
  getTokenPacks: (input: { signal?: AbortSignal }) => Promise<BillingTokenPackViewModel[]>
  startCheckout: (input: {
    currencyCode: string
    itemId: string
    kind: 'TokenPack'
  }) => Promise<{ url: string }>
  view: (input: { signal?: AbortSignal }) => Promise<{ canPay: boolean }>
}
