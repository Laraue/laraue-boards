export type DataMovementPageData = {
  currentOrganizationId: string
  currentOrganizationName: string
  spaces: Array<{
    boards: Array<{ color: string; id: string; name: string }>
    color: string
    isDefault: boolean
    key: string
    name: string
  }>
}
