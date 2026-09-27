<template>
  <section class="auth">
    <div class="auth-art">
      <div class="logo">
        <img
          alt=""
          class="logo-mark"
          src="/favicon.svg" />
        <span>Laraue Boards</span>
      </div>
      <div class="auth-copy">
        <h1>{{ t('heroTitle') }}</h1>
        <p>{{ t('heroDescription') }}</p>
        <div class="auth-flow">
          <span class="auth-flow-step">
            <MessageCircle aria-hidden="true" />
            {{ t('message') }}
          </span>
          <ArrowRight
            aria-hidden="true"
            class="auth-flow-arrow" />
          <span class="auth-flow-step">
            <SquareKanban aria-hidden="true" />
            {{ t('issue') }}
          </span>
          <ArrowRight
            aria-hidden="true"
            class="auth-flow-arrow" />
          <span class="auth-flow-step">
            <CircleCheck aria-hidden="true" />
            {{ t('done') }}
          </span>
        </div>
      </div>
      <small>{{ t('heroFooter') }}</small>
    </div>
    <div
      :aria-busy="submitting"
      class="auth-card">
      <div class="logo">
        <img
          alt=""
          class="logo-mark"
          src="/favicon.svg" />
        <span>Laraue Boards</span>
      </div>
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
      <div
        ref="widgetContainer"
        class="telegram-widget" />
      <div
        v-if="googleClientId"
        ref="googleButtonContainer"
        class="google-sign-in" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight, CircleCheck, MessageCircle, SquareKanban } from '@lucide/vue'

import type { LoginPageDeps } from '~/sections/auth/login/LoginPage.deps'
import type { TelegramUser } from '~/sections/auth/login/LoginPage.types'
import { mountGoogleSignInButton } from '~/sections/auth/login/mountGoogleSignInButton'
import { mountTelegramLoginWidget } from '~/sections/auth/login/mountTelegramLoginWidget'

const props = defineProps<{
  botName: string
  deps: LoginPageDeps
  googleClientId: string
  onLoggedIn: () => Promise<void> | void
}>()

const { t } = useI18n({
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
    signIn: 'Вход',
    signingIn: 'Выполняется вход…',
    welcomeBack: 'С возвращением',
  },
})

const widgetContainer = useTemplateRef('widgetContainer')
const googleButtonContainer = useTemplateRef('googleButtonContainer')
const telegramWindow = globalThis as typeof globalThis & {
  onTelegramAuth?: (user: TelegramUser) => void
}

onMounted(() => {
  telegramWindow.onTelegramAuth = (user) => void loginWidget(user)
  if (widgetContainer.value) {
    mountTelegramLoginWidget({
      botName: props.botName,
      callbackName: 'onTelegramAuth',
      container: widgetContainer.value,
    })
  }
})

onMounted(() => {
  if (props.googleClientId && googleButtonContainer.value) {
    void mountGoogleSignInButton({
      clientId: props.googleClientId,
      container: googleButtonContainer.value,
      onCredential: (idToken) => void loginGoogle(idToken),
    })
  }
})

onBeforeUnmount(() => delete telegramWindow.onTelegramAuth)
onMounted(() => void loginViaTelegramMiniApp())
useHead({ title: t('signIn') })

const {
  execute: loginViaTelegramMiniApp,
  message: miniAppMessage,
  pending: miniAppSubmitting,
} = useAction(props.deps.loginViaTelegramMiniApp, {
  onSuccess: async ({ authenticated }) => {
    if (authenticated) {
      await props.onLoggedIn()
    }
  },
})

const {
  execute: loginViaTelegramWidget,
  message: widgetMessage,
  pending: widgetSubmitting,
} = useAction(props.deps.loginViaTelegramWidget, {
  onSuccess: props.onLoggedIn,
})

const {
  execute: loginViaGoogle,
  message: googleMessage,
  pending: googleSubmitting,
} = useAction(props.deps.loginViaGoogle, {
  onSuccess: props.onLoggedIn,
})

const submitting = computed(
  () => miniAppSubmitting.value || widgetSubmitting.value || googleSubmitting.value,
)
const message = computed(() => miniAppMessage.value || widgetMessage.value || googleMessage.value)

const loginWidget = async (input: TelegramUser): Promise<void> => {
  if (submitting.value) {
    return
  }
  await loginViaTelegramWidget(input)
}

const loginGoogle = async (idToken: string): Promise<void> => {
  if (submitting.value) {
    return
  }
  await loginViaGoogle({ idToken, languageCode: navigator.language })
}
</script>

<style scoped>
.auth {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  min-height: 100dvh;
}

.auth-art {
  background: #172554 radial-gradient(circle at 25% 25%, #3156d3, transparent 45%);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(32px, 5vw, 64px);
}

.auth-art .logo {
  color: white;
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

.auth-card > .logo {
  display: none;
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

.telegram-widget {
  display: flex;
  margin-top: var(--space-6);
  min-height: 48px;
}

.google-sign-in {
  display: flex;
  margin-top: var(--space-3);
  min-height: 44px;
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

  .auth-card > .logo {
    display: flex;
  }
}
</style>
