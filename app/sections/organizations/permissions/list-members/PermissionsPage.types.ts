export type PermissionsPageMember = {
  color: string
  id: string
  initials: string
  isAdmin: boolean
  isOwner: boolean
  name: string
}

export type PermissionsPageData = {
  joinCode: string
  members: PermissionsPageMember[]
}
