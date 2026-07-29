export type AppLayoutData = {
  organization: {
    canCreateSpaces: boolean
    canManage: boolean
    canManageAttributes: boolean
    canMassMove: boolean
    canUpdate: boolean
    color: string
    id: string
    initial: string
    name: string
  }
  spaces: Array<{
    color: string
    key: string
    name: string
  }>
  user: { color: string; initials: string; name: string }
}
