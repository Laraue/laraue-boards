import type { TelegramSignInButtonDeps } from '../TelegramSignInButton.deps'
import { createLoadTelegramSignIn } from './loadTelegramSignIn'

export const createTelegramSignInButtonDeps = (): TelegramSignInButtonDeps => ({
  loadTelegramSignIn: createLoadTelegramSignIn(),
})
