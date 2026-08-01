<template>
  <section class="join-page">
    <div class="join-card">
      <div class="logo">
        <img
          alt=""
          class="logo-mark"
          src="/favicon.svg" />
        <span>Laraue Boards</span>
      </div>
      <span class="join-badge"><UserPlus /></span>
      <div class="join-intro">
        <h1>Join an organization</h1>
        <p class="muted">You have been invited to work with a team.</p>
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
        {{ busy ? 'Please wait…' : message ? 'Try again' : 'Accept invitation' }}
      </button>
      <div
        v-else
        aria-live="polite"
        class="inline-login">
        <strong>Sign in with Telegram</strong>
        <p class="muted">Sign in to accept this invitation.</p>
        <div
          ref="widgetContainer"
          class="telegram-widget" />
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

import type { TelegramUser } from '~/sections/auth/login/LoginPage.types'
import { mountTelegramLoginWidget } from '~/sections/auth/login/mountTelegramLoginWidget'

import type { JoinOrganizationPageDeps } from './JoinOrganizationPage.deps'

const props = defineProps<{
  botName: string
  code: string
  deps: JoinOrganizationPageDeps
  onJoined: () => Promise<void> | void
}>()
const state = reactive({ loginRequired: false, widgetMounted: false })
const widgetContainer = useTemplateRef('widgetContainer')
const telegramWindow = globalThis as typeof globalThis & {
  onTelegramJoinAuth?: (user: TelegramUser) => void
}

useHead({ title: 'Join organization' })

const {
  execute: join,
  message: joinMessage,
  pending,
} = useAction(props.deps.join)

const {
  execute: loginViaTelegramMiniApp,
  message: miniAppMessage,
  pending: miniAppPending,
} = useAction(props.deps.loginViaTelegramMiniApp)

const {
  execute: loginViaTelegramWidget,
  message: widgetMessage,
  pending: widgetPending,
} = useAction(props.deps.loginViaTelegramWidget)

const busy = computed(() => pending.value || miniAppPending.value || widgetPending.value)
const message = computed(
  () =>
    widgetMessage.value ||
    miniAppMessage.value ||
    (!state.loginRequired ? joinMessage.value : undefined),
)

const showLogin = async (): Promise<void> => {
  const miniApp = await loginViaTelegramMiniApp()
  if (miniApp?.authenticated) {
    await accept()
    return
  }

  state.loginRequired = true
  await nextTick()
  if (widgetContainer.value && !state.widgetMounted) {
    mountTelegramLoginWidget({
      botName: props.botName,
      callbackName: 'onTelegramJoinAuth',
      container: widgetContainer.value,
    })
    state.widgetMounted = true
  }
}

const accept = async (): Promise<void> => {
  const outcome = await join({ code: props.code })
  if (outcome === 'joined') {
    await props.onJoined()
  } else if (outcome === 'sign-in-required') {
    await showLogin()
  }
}

const loginWidget = async (user: TelegramUser): Promise<void> => {
  const loggedIn = await loginViaTelegramWidget(user)
  if (loggedIn) {
    state.loginRequired = false
    state.widgetMounted = false
    await nextTick()
    await accept()
  }
}

onMounted(() => {
  telegramWindow.onTelegramJoinAuth = (user) => void loginWidget(user)
})
onBeforeUnmount(() => delete telegramWindow.onTelegramJoinAuth)
</script>

<style scoped>
.join-page {
  display: grid;
  min-height: 100dvh;
  padding: var(--space-6);
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

.telegram-widget {
  display: flex;
  justify-content: center;
  margin-top: var(--space-3);
  min-height: 48px;
}
</style>
