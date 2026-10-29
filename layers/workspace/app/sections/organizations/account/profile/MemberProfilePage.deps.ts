/** How the user is shown in this organization. */
export type MemberProfile = {
  color: string
  displayName: string
}

/** An empty `displayName` takes the name from the user's profile again. */
export type UpdateMemberProfileInput = {
  color: string
  displayName: string
}

export type MemberProfilePageDeps = {
  update: (input: UpdateMemberProfileInput) => Promise<void>
  view: (input: { signal?: AbortSignal }) => Promise<MemberProfile>
}
