export type OrganizationSelectOption = {
  label: string
  value: string
}

export type OrganizationSelectDeps = {
  // Resolves with the options or rejects with an `ApiError`.
  loadOrganizations: (input: { signal?: AbortSignal }) => Promise<OrganizationSelectOption[]>
}
