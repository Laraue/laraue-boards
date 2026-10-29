<template>
  <section class="auth">
    <div
      :aria-busy="submitting"
      class="auth-card">
      <h2>{{ t('welcomeBack') }}</h2>
      <p class="muted">
        {{ googleClientId ? t('continueWithTelegramOrGoogle') : t('continueWithTelegram') }}
      </p>
      <p
        v-if="message"
        class="form-error">
        {{ message }}
      </p>
      <p
        v-if="submitting"
        class="muted login-status">
        {{ t('signingIn') }}
      </p>
      <div class="sign-in-buttons">
        <TelegramSignInButton
          v-if="telegramBotId"
          :bot-id="telegramBotId"
          :deps="deps.telegramSignInButton"
          :disabled="submitting"
          :on-sign-in="loginWidget" />
        <GoogleSignInButton
          v-if="googleClientId"
          :client-id="googleClientId"
          :deps="deps.googleSignInButton"
          :disabled="submitting"
          :on-sign-in="loginGoogle" />
      </div>
      <p class="privacy-note">
        {{ t('privacyBefore') }}
        <a
          :href="privacyUrl"
          rel="noopener"
          target="_blank">
          {{ t('privacyPolicy') }}
        </a>
        {{ t('privacyAfter') }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { useHead } from '#app'
import { laraueWebsiteUrl } from '#layers/core/app/constants/links'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import type { LoginPageDeps } from '#layers/workspace/app/sections/auth/login/LoginPage.deps'
import GoogleSignInButton from '#layers/workspace/app/sections/auth/shared/components/GoogleSignInButton/GoogleSignInButton.vue'
import type { TelegramUser } from '#layers/workspace/app/sections/auth/shared/components/TelegramSignInButton/TelegramSignInButton.types'
import TelegramSignInButton from '#layers/workspace/app/sections/auth/shared/components/TelegramSignInButton/TelegramSignInButton.vue'
import { useApiAction } from '#layers/workspace/app/shared/composables/useApiAction'

const props = defineProps<{
  deps: LoginPageDeps
  googleClientId: string
  onLoggedIn: () => Promise<void> | void
  telegramBotId: string
}>()

const { locale, t } = useI18n({
  en: {
    continueWithTelegram: 'Use your Telegram account to continue.',
    continueWithTelegramOrGoogle: 'Use your Telegram or Google account to continue.',
    privacyAfter: 'and accept its terms.',
    privacyBefore: 'By logging in, you confirm that you have read the',
    privacyPolicy: 'Privacy policy',
    signIn: 'Sign in',
    signingIn: 'Signing in…',
    welcomeBack: 'Welcome back',
  },
  ru: {
    continueWithTelegram: 'Используйте аккаунт Telegram, чтобы продолжить.',
    continueWithTelegramOrGoogle: 'Используйте аккаунт Telegram или Google, чтобы продолжить.',
    privacyAfter: 'и принимаете её условия.',
    privacyBefore: 'Входя в приложение, вы подтверждаете, что ознакомились с',
    privacyPolicy: 'Политикой конфиденциальности',
    signIn: 'Вход',
    signingIn: 'Выполняется вход…',
    welcomeBack: 'С возвращением',
  },
})

// The privacy policy is on laraue.com, in the visitor's language.
const privacyUrl = computed(() => laraueWebsiteUrl(locale.value, '/privacy'))

onMounted(async () => {
  const miniApp = await loginViaTelegramMiniApp()
  if (miniApp?.value) {
    await props.onLoggedIn()
  }
})
useHead({ title: t('signIn') })

const {
  execute: loginViaTelegramMiniApp,
  message: miniAppMessage,
  pending: miniAppSubmitting,
} = useApiAction(props.deps.loginViaTelegramMiniApp)

const {
  execute: loginViaTelegramWidget,
  message: widgetMessage,
  pending: widgetSubmitting,
} = useApiAction(props.deps.loginViaTelegramWidget)

const {
  execute: loginViaGoogle,
  message: googleMessage,
  pending: googleSubmitting,
} = useApiAction(props.deps.loginViaGoogle)

const submitting = computed(
  () => miniAppSubmitting.value || widgetSubmitting.value || googleSubmitting.value,
)
const message = computed(() => miniAppMessage.value || widgetMessage.value || googleMessage.value)

const loginWidget = async (input: TelegramUser): Promise<void> => {
  if (submitting.value) {
    return
  }
  if (await loginViaTelegramWidget(input)) {
    await props.onLoggedIn()
  }
}

const loginGoogle = async (code: string): Promise<void> => {
  if (submitting.value) {
    return
  }
  if (await loginViaGoogle({ code, languageCode: navigator.language })) {
    await props.onLoggedIn()
  }
}
</script>

<style scoped>
.auth {
  display: grid;
  min-height: 100%;
  padding: var(--space-6) var(--space-4);
  place-items: center;
}

.auth-card {
  text-align: center;
  width: min(380px, 100%);
}

.auth-card h2 {
  font-size: var(--font-size-4xl);
  letter-spacing: -0.02em;
  margin-bottom: var(--space-2);
}

.login-status {
  margin-top: var(--space-6);
}

.sign-in-buttons {
  display: grid;
  gap: var(--space-3);
  justify-items: center;
  margin-top: var(--space-6);
}

.privacy-note {
  color: var(--color-muted);
  font-size: var(--font-size-small);
  line-height: 1.5;
  margin-top: var(--space-5);
}

.privacy-note a {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
