import type { GoogleSignInButtonDeps } from '../GoogleSignInButton.deps'
import { createLoadGoogleSignIn } from './loadGoogleSignIn'

export const createGoogleSignInButtonDeps = (): GoogleSignInButtonDeps => ({
  loadGoogleSignIn: createLoadGoogleSignIn(),
})
