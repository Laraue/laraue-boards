export type LandingTariff = {
  billing: { duration: number; period: 'forever' | 'month' }
  currencyCode: string
  formattedPrice: string
  // Team organizations a personal plan allows: a number, `null` when it has no limit, `undefined`
  // when the plan has none to show (team plans).
  freeOrganizations?: null | number
  id: string
  issuesPerMonth?: number
  price: number
  // File storage the plan includes, in binary megabytes (1024 is 1 GB).
  storageMegabytes: number
  title: string
  tokens: number
}

// Extra storage sold with the paid plans, priced per month.
export type LandingStorageAddon = {
  formattedPrice: string
  id: string
  storageMegabytes: number
}

export type LandingTariffs = {
  personal: LandingTariff[]
  storageAddons: LandingStorageAddon[]
  team: LandingTariff[]
}

export type LandingPageDeps = {
  getTariffs: () => Promise<LandingTariffs>
}
