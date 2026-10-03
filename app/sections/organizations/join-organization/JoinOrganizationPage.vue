<template>
  <section class="join-page">
    <div class="join-card">
      <span class="join-badge"><UserPlus /></span>
      <div class="join-intro">
        <h1>{{ t('joinOrganization') }}</h1>
        <p class="muted">{{ t('invitationDescription') }}</p>
      </div>
      <button
        v-if="!state.loginRequired"
        class="primary join-action"
        :disabled="busy"
        type="button"
        @click="accept">
        <Loader
          v-if="busy"
          class="spinning" />
        {{ busy ? t('pleaseWait') : message ? t('tryAgain') : t('acceptInvitation') }}
      </button>
      <div
        v-else
        aria-live="polite"
        class="inline-login">
        <strong>{{ googleClientId ? t('signIn') : t('signInTelegram') }}</strong>
        <p class="muted">{{ t('signInToAccept') }}</p>
        <div class="sign-in-buttons">
          <TelegramSignInButton
            v-if="telegramBotId"
            :bot-id="telegramBotId"
            :deps="deps.telegramSignInButton"
            :disabled="busy"
            :on-sign-in="loginWidget" />
          <GoogleSignInButton
            v-if="googleClientId"
            :client-id="googleClientId"
            :deps="deps.googleSignInButton"
            :disabled="busy"
            :on-sign-in="loginGoogle" />
        </div>
      </div>
      <p
        v-if="message"
        aria-live="polite"
        class="form-error">
        {{ message }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Loader, UserPlus } from '@lucide/vue'

import GoogleSignInButton from '~/components/google-sign-in-button/GoogleSignInButton.vue'
import type { TelegramUser } from '~/components/telegram-sign-in-button/TelegramSignInButton.types'
import TelegramSignInButton from '~/components/telegram-sign-in-button/TelegramSignInButton.vue'

import type { JoinOrganizationPageDeps } from './JoinOrganizationPage.deps'

const props = defineProps<{
  code: string
  deps: JoinOrganizationPageDeps
  googleClientId: string
  onJoined: () => Promise<void> | void
  telegramBotId: string
}>()

const { t } = useI18n({
  en: {
    acceptInvitation: 'Accept invitation',
    invitationDescription: 'You have been invited to work with a team.',
    joinOrganization: 'Join an organization',
    pleaseWait: 'Please wait…',
    signIn: 'Sign in',
    signInTelegram: 'Sign in with Telegram',
    signInToAccept: 'Sign in to accept this invitation.',
    tryAgain: 'Try again',
  },
  ru: {
    acceptInvitation: 'Принять приглашение',
    invitationDescription: 'Вас пригласили работать вместе с командой.',
    joinOrganization: 'Присоединиться к организации',
    pleaseWait: 'Подождите…',
    signIn: 'Вход',
    signInTelegram: 'Войти через Telegram',
    signInToAccept: 'Войдите, чтобы принять приглашение.',
    tryAgain: 'Повторить попытку',
  },
})

const state = reactive({ loginRequired: false })

useHead({ title: t('joinOrganization') })

const { execute: join, message: joinMessage, pending } = useApiAction(props.deps.join)

const {
  execute: loginViaTelegramMiniApp,
  message: miniAppMessage,
  pending: miniAppPending,
} = useApiAction(props.deps.loginViaTelegramMiniApp)

const {
  execute: loginViaTelegramWidget,
  message: widgetMessage,
  pending: widgetPending,
} = useApiAction(props.deps.loginViaTelegramWidget)

const {
  execute: loginViaGoogle,
  message: googleMessage,
  pending: googlePending,
} = useApiAction(props.deps.loginViaGoogle)

const busy = computed(
  () => pending.value || miniAppPending.value || widgetPending.value || googlePending.value,
)
const message = computed(
  () =>
    widgetMessage.value ||
    googleMessage.value ||
    miniAppMessage.value ||
    (!state.loginRequired ? joinMessage.value : undefined),
)

const showLogin = async (): Promise<void> => {
  const miniApp = await loginViaTelegramMiniApp()
  if (miniApp?.value) {
    await accept()
    return
  }

  state.loginRequired = true
}

const accept = async (): Promise<void> => {
  const outcome = await join({ code: props.code })
  if (outcome?.value === 'joined') {
    await props.onJoined()
  } else if (outcome?.value === 'sign-in-required') {
    await showLogin()
  }
}

const continueAfterLogin = async (): Promise<void> => {
  state.loginRequired = false
  await accept()
}

const loginWidget = async (user: TelegramUser): Promise<void> => {
  const loggedIn = await loginViaTelegramWidget(user)
  if (loggedIn) {
    await continueAfterLogin()
  }
}

const loginGoogle = async (code: string): Promise<void> => {
  if (busy.value) {
    return
  }
  const loggedIn = await loginViaGoogle({ code, languageCode: navigator.language })
  if (loggedIn) {
    await continueAfterLogin()
  }
}
</script>

<style scoped>
.join-page {
  display: grid;
  min-height: 100%;
  padding: var(--space-8) var(--space-4);
  place-items: center;
}

.join-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-dialog);
  box-shadow: var(--shadow-card);
  display: grid;
  gap: var(--space-5);
  justify-items: center;
  padding: var(--space-8) var(--space-6);
  text-align: center;
  width: min(420px, 100%);
}

.join-badge {
  background: var(--color-accent-soft);
  border-radius: var(--radius-card);
  color: var(--color-accent);
  display: grid;
  height: 56px;
  place-items: center;
  width: 56px;
}

.join-badge .lucide {
  height: 28px;
  width: 28px;
}

.join-intro {
  display: grid;
  gap: var(--space-2);
}

.join-action {
  width: 100%;
}

.spinning {
  animation: var(--animation-spin);
}

.form-error {
  margin-top: 0;
}

.inline-login {
  background: var(--color-workspace);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  display: grid;
  gap: var(--space-1);
  justify-items: center;
  padding: var(--space-4);
  width: 100%;
}

.sign-in-buttons {
  display: grid;
  gap: var(--space-2);
  margin-top: var(--space-3);
  width: 100%;
}
</style>
