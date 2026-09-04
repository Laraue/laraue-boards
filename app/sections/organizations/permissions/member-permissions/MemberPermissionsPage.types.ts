export type AdminPermissions = {
  canDeleteOrganization: boolean
  canManageAttributes: boolean
  canManageMembers: boolean
  canMoveData: boolean
  canUpdateOrganization: boolean
}

export type GlobalPermissions = {
  canCreateBoards: boolean
  canCreateIssues: boolean
  canCreateSpaces: boolean
  canDeleteBoards: boolean
  canDeleteIssues: boolean
  canDeleteSpaces: boolean
  canManageRetros: boolean
  canRead: boolean
  canUpdateBoards: boolean
  canUpdateIssues: boolean
  canUpdateSpaces: boolean
}

export type DirectSpacePermissions = {
  canCreateBoards: boolean
  canCreateIssues: boolean
  canDelete: boolean
  canDeleteBoards: boolean
  canDeleteIssues: boolean
  canManageRetros: boolean
  canRead: boolean
  canUpdate: boolean
  canUpdateBoards: boolean
  canUpdateIssues: boolean
}

export type MemberPermissions = {
  admin: AdminPermissions
  direct: Record<string, DirectSpacePermissions>
  global: GlobalPermissions
}

export type MemberPermissionsPageData = {
  member: {
    color: string
    id: string
    initials: string
    isAdmin: boolean
    isOwner: boolean
    name: string
  }
  permissions: MemberPermissions
  spaces: Array<{
    color: string
    id: string
    isDefault: boolean
    name: string
  }>
}
