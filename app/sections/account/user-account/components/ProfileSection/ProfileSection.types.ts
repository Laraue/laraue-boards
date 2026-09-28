/**
 * The user's global profile. Organizations keep their own copy of the name, taken when the user
 * joined, so a change here reaches only organizations joined later.
 */
export type GlobalProfile = {
  displayName: string
  familyName: string
  givenName: string
}

/** Empty given/family names are cleared. */
export type UpdateGlobalProfileInput = {
  displayName: string
  familyName: string
  givenName: string
}
