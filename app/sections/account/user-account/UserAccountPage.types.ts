export type UserAccountUser = {
  color: string
  initials: string
  name: string
}

export type UserAccountView =
  | { kind: 'signed-in'; user: UserAccountUser }
  | { kind: 'signed-out' }
