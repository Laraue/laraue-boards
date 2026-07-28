export type DataMovementPageData = {
  currentOrganizationId: string
  currentOrganizationName: string
  spaces: Array<{
    boards: Array<{ color: string; id: string; name: string }>
    color: string
    id: string
    isDefault: boolean
    name: string
  }>
}
