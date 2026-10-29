export type CreateOrganizationInput = {
  color: string
  name: string
  slug: string
}

export type CreateOrganizationPageDeps = {
  create: (input: CreateOrganizationInput) => Promise<void>
}
