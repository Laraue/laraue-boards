import type { GoogleSignInPopup } from './GoogleSignInButton.types'

/** Prepares Google's OAuth popup; undefined when Google's script can't be loaded. */
export type LoadGoogleSignIn = (input: {
  clientId: string
}) => Promise<GoogleSignInPopup | undefined>

export type GoogleSignInButtonDeps = {
  loadGoogleSignIn: LoadGoogleSignIn
}
