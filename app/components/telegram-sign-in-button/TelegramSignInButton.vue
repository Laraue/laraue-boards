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
      <circle
        cx="12"
        cy="12"
        fill="#2AABEE"
        r="12" />
      <path
        d="M5.43 11.87c3.5-1.52 5.83-2.53 7-3.02 3.33-1.39 4.02-1.63 4.47-1.64.1 0 .32.02.47.14.12.1.15.23.17.33.01.09.03.3.02.47-.18 1.9-.96 6.52-1.36 8.65-.17.9-.5 1.2-.82 1.23-.7.07-1.23-.46-1.9-.9-1.06-.7-1.66-1.13-2.69-1.8-1.19-.79-.42-1.22.26-1.93.18-.18 3.25-2.98 3.31-3.23.01-.03.01-.15-.06-.21-.07-.06-.17-.04-.25-.02-.1.02-1.79 1.14-5.06 3.34-.48.33-.91.49-1.3.48-.43-.01-1.25-.24-1.86-.44-.75-.24-1.35-.37-1.3-.79.03-.22.33-.44.9-.66z"
        fill="#fff" />
    </svg>
    {{ state.retry ? t('retryTelegram') : label || t('continueWithTelegram') }}
  </button>
</template>

<script setup lang="ts">
import type { TelegramSignInButtonDeps } from './TelegramSignInButton.deps'
import type { TelegramSignInPopup, TelegramUser } from './TelegramSignInButton.types'

const props = defineProps<{
  botId: string
  deps: TelegramSignInButtonDeps
  disabled?: boolean
  label?: string
  onSignIn: (user: TelegramUser) => void
}>()

const { locale, t } = useI18n({
  en: {
    continueWithTelegram: 'Continue with Telegram',
    retryTelegram: 'Telegram unavailable — retry',
  },
  ru: {
    continueWithTelegram: 'Продолжить с Telegram',
    retryTelegram: 'Telegram недоступен — повторить',
  },
})

const state = reactive({ popup: undefined as TelegramSignInPopup | undefined, retry: false })

const prepare = async (): Promise<void> => {
  state.retry = false
  try {
    state.popup = await props.deps.loadTelegramSignIn({ botId: props.botId, locale: locale.value })
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
  const user = await state.popup.open()
  if (user) {
    props.onSignIn(user)
  }
}
</script>
