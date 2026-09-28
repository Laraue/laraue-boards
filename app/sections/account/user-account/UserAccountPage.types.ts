// The initials come from the user's global profile (null when it couldn't be read); there's no
// global color - a person is shown per organization.
export type UserAccountView =
  | { initials: null | string; kind: 'signed-in' }
  | { kind: 'signed-out' }
