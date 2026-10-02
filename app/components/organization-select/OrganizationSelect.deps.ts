export type OrganizationSelectOption = {
  label: string
  value: string
}

export type OrganizationSelectDeps = {
  loadOrganizations: (input: { signal?: AbortSignal }) => Promise<OrganizationSelectOption[]>
}
