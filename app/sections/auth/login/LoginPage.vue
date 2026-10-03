<template>
  <section class="auth">
    <div class="auth-art">
      <div class="auth-copy">
        <h1>{{ t('heroTitle') }}</h1>
        <p>{{ t('heroDescription') }}</p>
        <div class="auth-flow">
          <span class="auth-flow-step">
            <IconMessageCircle aria-hidden="true" />
            {{ t('message') }}
          </span>
          <IconArrowRight
            aria-hidden="true"
            class="auth-flow-arrow" />
          <span class="auth-flow-step">
            <IconLayoutKanban aria-hidden="true" />
            {{ t('issue') }}
          </span>
          <IconArrowRight
            aria-hidden="true"
            class="auth-flow-arrow" />
          <span class="auth-flow-step">
            <IconCircleCheck aria-hidden="true" />
            {{ t('done') }}
          </span>
        </div>
      </div>
      <small>{{ t('heroFooter') }}</small>
    </div>
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
import {
  IconArrowRight,
  IconCircleCheck,
  IconLayoutKanban,
  IconMessageCircle,
} from '@tabler/icons-vue'

import GoogleSignInButton from '~/components/google-sign-in-button/GoogleSignInButton.vue'
import type { TelegramUser } from '~/components/telegram-sign-in-button/TelegramSignInButton.types'
import TelegramSignInButton from '~/components/telegram-sign-in-button/TelegramSignInButton.vue'
import type { LoginPageDeps } from '~/sections/auth/login/LoginPage.deps'
import { laraueUrl } from '~/sections/landing/landingLinks'

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
    done: 'Done',
    heroDescription:
      'Send Telegram messages to organized boards and keep every important request moving.',
    heroFooter: 'Your conversations stay in Telegram. Your work stays clear.',
    heroTitle: 'Turn messages into work.',
    issue: 'Issue',
    message: 'Message',
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
    done: 'Готово',
    heroDescription:
      'Отправляйте сообщения из Telegram на организованные доски и не теряйте важные задачи.',
    heroFooter: 'Ваши разговоры остаются в Telegram, а работа — под контролем.',
    heroTitle: 'Превращайте сообщения в работу.',
    issue: 'Задача',
    message: 'Сообщение',
    privacyAfter: 'и принимаете её условия.',
    privacyBefore: 'Входя в приложение, вы подтверждаете, что ознакомились с',
    privacyPolicy: 'Политикой конфиденциальности',
    signIn: 'Вход',
    signingIn: 'Выполняется вход…',
    welcomeBack: 'С возвращением',
  },
})

// The privacy policy is on laraue.com, in the visitor's language.
const privacyUrl = computed(() => laraueUrl(locale.value, '/privacy'))

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
  grid-template-columns: 1.1fr 0.9fr;
  min-height: 100%;
}

.auth-art {
  background: #172554 radial-gradient(circle at 25% 25%, #3156d3, transparent 45%);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(32px, 5vw, 64px);
}

.auth-copy {
  display: grid;
  gap: var(--space-4);
  max-width: min(900px, 50vw);
  text-wrap: balance;
}

.auth-flow {
  align-items: center;
  display: grid;
  gap: clamp(var(--space-1), 0.8vw, var(--space-3));
  grid-template-columns: repeat(5, auto);
  justify-content: start;
  margin-top: var(--space-4);
}

.auth-flow-step {
  align-items: center;
  background: #ffffff12;
  border: 1px solid #ffffff24;
  border-radius: var(--radius-control);
  display: flex;
  font-size: clamp(12px, 1vw, 14px);
  font-weight: var(--font-weight-semibold);
  gap: var(--space-2);
  padding: var(--space-3);
}

.auth-flow-arrow {
  color: #93c5fd;
}

.auth-art h1 {
  font-size: clamp(42px, 5vw, 72px);
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0;
  overflow: visible;
  white-space: normal;
}

.auth-art p {
  color: #cbd5e1;
  font-size: clamp(15px, 1.2vw, 18px);
}

.auth-card {
  margin: auto;
  width: min(380px, calc(100% - 48px));
}

.auth-card h2 {
  font-size: 28px;
  letter-spacing: -0.02em;
  margin-bottom: var(--space-2);
}

.login-status {
  margin-top: var(--space-6);
  text-align: center;
}

.sign-in-buttons {
  display: grid;
  gap: var(--space-3);
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

@media (max-width: 767px) {
  .auth {
    grid-template-columns: 1fr;
  }

  .auth-art {
    display: none;
  }

  .auth-card {
    width: min(380px, calc(100% - 32px));
  }
}
</style>
