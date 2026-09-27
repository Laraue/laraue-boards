<template>
  <section class="connected-accounts-section">
    <p class="muted">{{ t('description') }}</p>

    <p
      v-if="outcomeMessage"
      :class="state.outcome === 'linked' ? 'connect-success' : 'form-error'"
      role="status">
      {{ outcomeMessage }}
    </p>

    <QueryState
      :data="data"
      :error-title="t('loadError')"
      :loading-text="t('loading')"
      :message="sectionMessage"
      :on-retry="refresh"
      :pending="pending">
      <template #default="{ data: accounts }">
        <div class="account-list">
          <article class="account-card">
            <div class="account-info">
              <strong>Telegram</strong>
              <small class="muted">{{ t('telegramHint') }}</small>
            </div>
            <span
              v-if="accounts.telegram"
              class="account-status">
              <Check aria-hidden="true" />
              {{ t('connected') }}
            </span>
            <div
              v-else
              ref="telegramContainer"
              class="account-connect" />
          </article>

          <article class="account-card">
            <div class="account-info">
              <strong>Google</strong>
              <small class="muted">{{ t('googleHint') }}</small>
            </div>
            <span
              v-if="accounts.google"
              class="account-status">
              <Check aria-hidden="true" />
              {{ t('connected') }}
            </span>
            <small
              v-else-if="isTelegramMiniApp"
              class="muted account-unavailable">
              {{ t('googleInMiniApp') }}
            </small>
            <div
              v-else-if="googleClientId"
              ref="googleContainer"
              class="account-connect" />
          </article>
        </div>
      </template>
    </QueryState>
  </section>
</template>

<script setup lang="ts">
import { Check } from '@lucide/vue'

import type { TelegramUser } from '~/sections/auth/login/LoginPage.types'
import { mountGoogleSignInButton } from '~/sections/auth/login/mountGoogleSignInButton'
import { mountTelegramLoginWidget } from '~/sections/auth/login/mountTelegramLoginWidget'

import type { ConnectedAccountsPageDeps } from './ConnectedAccountsPage.deps'
import type { ConnectOutcome } from './ConnectedAccountsPage.types'

type Provider = 'google' | 'telegram'

const props = defineProps<{
  botName: string
  deps: ConnectedAccountsPageDeps
  googleClientId: string
}>()

const { t } = useI18n({
  en: {
    connected: 'Connected',
    description:
      'Sign in with any connected account. Connect Telegram to save chat messages as issues, use /save and inline search.',
    googleHint: 'Sign in with your Google account.',
    googleInMiniApp:
      'Open Laraue Boards in a browser to connect Google - Google does not allow signing in inside Telegram.',
    linkedGoogle: 'Google is connected. You can now sign in with it.',
    linkedTelegram: 'Telegram is connected. The bot now recognizes your account.',
    loadError: 'Could not load connected accounts',
    loading: 'Loading connected accounts…',
    ownerHasData:
      'This {provider} account is already used by another Laraue Boards account that has its own data, so it can’t be connected here.',
    ownerUsedByAnotherService:
      'This {provider} account is already used in another Laraue app, so it can’t be connected here yet.',
    telegramHint: 'Use the Telegram bot: save chat messages as issues, /save, inline search.',
    userHasOtherAccount: 'A different {provider} account is already connected to your account.',
  },
  ru: {
    connected: 'Подключён',
    description:
      'Входите через любой подключённый аккаунт. Подключите Telegram, чтобы сохранять сообщения из чатов как задачи, использовать /save и встроенный поиск.',
    googleHint: 'Вход через аккаунт Google.',
    googleInMiniApp:
      'Откройте Laraue Boards в браузере, чтобы подключить Google, - Google не разрешает вход внутри Telegram.',
    linkedGoogle: 'Google подключён. Теперь через него можно входить.',
    linkedTelegram: 'Telegram подключён. Теперь бот узнаёт ваш аккаунт.',
    loadError: 'Не удалось загрузить подключённые аккаунты',
    loading: 'Загрузка подключённых аккаунтов…',
    ownerHasData:
      'Этот аккаунт {provider} уже используется другим аккаунтом Laraue Boards со своими данными, поэтому его нельзя подключить здесь.',
    ownerUsedByAnotherService:
      'Этот аккаунт {provider} уже используется в другом приложении Laraue, поэтому пока его нельзя подключить здесь.',
    telegramHint:
      'Работа с Telegram-ботом: сохранение сообщений как задач, /save, встроенный поиск.',
    userHasOtherAccount: 'К вашему аккаунту уже подключён другой аккаунт {provider}.',
  },
})

const state = reactive({
  googleMounted: false,
  outcome: null as ConnectOutcome | null,
  provider: null as null | Provider,
  telegramMounted: false,
})
const telegramContainer = useTemplateRef('telegramContainer')
const googleContainer = useTemplateRef('googleContainer')
const telegramWindow = globalThis as typeof globalThis & {
  onTelegramConnect?: (user: TelegramUser) => void
  Telegram?: { WebApp?: { initData?: string } }
}
const isTelegramMiniApp = Boolean(telegramWindow.Telegram?.WebApp?.initData)

const {
  data,
  message: queryMessage,
  pending,
  refresh,
} = await useQuery('account-connected-accounts', (_nuxtApp, { signal }) =>
  props.deps.view({ signal }),
)

const onConnected = async (provider: Provider, outcome: ConnectOutcome): Promise<void> => {
  state.provider = provider
  state.outcome = outcome
  if (outcome === 'linked') {
    state.telegramMounted = false
    state.googleMounted = false
    await refresh()
  }
}

const {
  execute: connectTelegram,
  message: telegramMessage,
  pending: connectingTelegram,
} = useAction(props.deps.connectTelegram, {
  onSuccess: (outcome) => onConnected('telegram', outcome),
})
const {
  execute: connectGoogle,
  message: googleMessage,
  pending: connectingGoogle,
} = useAction(props.deps.connectGoogle, {
  onSuccess: (outcome) => onConnected('google', outcome),
})

const busy = computed(() => connectingTelegram.value || connectingGoogle.value)

const outcomeMessage = computed(() => {
  if (!state.outcome || !state.provider) {
    return ''
  }

  const provider = state.provider === 'google' ? 'Google' : 'Telegram'
  switch (state.outcome) {
    case 'linked':
      return state.provider === 'google' ? t('linkedGoogle') : t('linkedTelegram')
    case 'owner-has-data':
      return t('ownerHasData', { provider })
    case 'owner-used-by-another-service':
      return t('ownerUsedByAnotherService', { provider })
    case 'user-has-other-account':
      return t('userHasOtherAccount', { provider })
  }
})

const sectionMessage = computed(
  () => telegramMessage.value || googleMessage.value || queryMessage.value,
)

const mountConnectButtons = (): void => {
  if (telegramContainer.value && !state.telegramMounted) {
    mountTelegramLoginWidget({
      botName: props.botName,
      callbackName: 'onTelegramConnect',
      container: telegramContainer.value,
    })
    state.telegramMounted = true
  }

  if (googleContainer.value && !state.googleMounted) {
    void mountGoogleSignInButton({
      clientId: props.googleClientId,
      container: googleContainer.value,
      onCredential: (idToken) => {
        if (!busy.value) {
          void connectGoogle({ idToken })
        }
      },
    })
    state.googleMounted = true
  }
}

onMounted(() => {
  telegramWindow.onTelegramConnect = (user) => {
    if (!busy.value) {
      void connectTelegram(user)
    }
  }
  mountConnectButtons()
})
watch(data, () => void nextTick(mountConnectButtons))
onBeforeUnmount(() => delete telegramWindow.onTelegramConnect)
</script>

<style scoped>
.connected-accounts-section {
  align-content: start;
  display: grid;
  gap: var(--space-5);
}

.connected-accounts-section > p {
  margin: 0;
}

.connect-success {
  color: var(--color-accent);
}

.account-list {
  display: grid;
  gap: var(--space-3);
}

.account-card {
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
  padding: var(--space-4);
}

.account-info {
  display: grid;
  gap: var(--space-1);
}

.account-status {
  align-items: center;
  color: var(--color-accent);
  display: inline-flex;
  flex-shrink: 0;
  font-weight: var(--font-weight-semibold);
  gap: var(--space-1);
}

.account-status .lucide {
  height: 16px;
  width: 16px;
}

.account-connect {
  display: flex;
  flex-shrink: 0;
  min-height: 44px;
}

.account-unavailable {
  max-width: 280px;
  text-align: right;
}

@media (max-width: 767px) {
  .account-card {
    align-items: stretch;
    flex-direction: column;
  }

  .account-unavailable {
    text-align: left;
  }
}
</style>
