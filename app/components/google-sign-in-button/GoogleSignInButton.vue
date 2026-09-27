<template>
  <button
    aria-live="polite"
    class="sign-in-button"
    :disabled="disabled || (!state.popup && !state.retry)"
    type="button"
    @click="signIn">
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
        fill="#4285F4" />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
        fill="#34A853" />
      <path
        d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"
        fill="#FBBC05" />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.56 10.56 0 0 0 12 1 11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
        fill="#EA4335" />
    </svg>
    {{ state.retry ? t('retryGoogle') : label || t('continueWithGoogle') }}
  </button>
</template>

<script setup lang="ts">
import type { GoogleSignInButtonDeps } from './GoogleSignInButton.deps'
import type { GoogleSignInPopup } from './GoogleSignInButton.types'

const props = defineProps<{
  clientId: string
  deps: GoogleSignInButtonDeps
  disabled?: boolean
  label?: string
  onSignIn: (code: string) => void
}>()

const { t } = useI18n({
  en: { continueWithGoogle: 'Continue with Google', retryGoogle: 'Google unavailable — retry' },
  ru: { continueWithGoogle: 'Продолжить с Google', retryGoogle: 'Google недоступен — повторить' },
})

const state = reactive({ popup: undefined as GoogleSignInPopup | undefined, retry: false })

const prepare = async (): Promise<void> => {
  state.retry = false
  try {
    state.popup = await props.deps.loadGoogleSignIn({ clientId: props.clientId })
  } catch {
    state.popup = undefined
  }
  state.retry = !state.popup
}

onMounted(() => void prepare())

const signIn = async (): Promise<void> => {
  if (!state.popup) {
    await prepare()
    // A second click keeps popup creation inside a fresh user gesture.
    return
  }
  const code = await state.popup.open()
  if (code) {
    props.onSignIn(code)
  }
}
</script>
