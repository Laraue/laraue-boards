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

export type PermissionsPageDeps = {
  // Resolves with the new join code.
  regenerateJoinCode: () => Promise<string>
  view: (input: { signal?: AbortSignal }) => Promise<PermissionsPageData>
}
