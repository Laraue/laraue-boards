export type UserAccountUser = {
  color: string
  initials: string
  name: string
}

/** The organization the user worked in last - where "Back to …" leads. */
export type UserAccountOrganization = {
  key: string
  name: string
}

export type UserAccountView =
  | { kind: 'signed-in'; lastOrganization: null | UserAccountOrganization; user: UserAccountUser }
  | { kind: 'signed-out' }
