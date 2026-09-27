<template>
  <div class="user-account">
    <header class="user-account-header">
      <div class="logo">
        <img
          alt=""
          class="logo-mark"
          src="/favicon.svg" />
        <span>Laraue Boards</span>
      </div>
      <NuxtLink
        v-if="account"
        class="secondary"
        :to="backPath || '/organizations'">
        <ArrowLeft />
        {{ backPath ? t('back') : t('backToOrganizations') }}
      </NuxtLink>
    </header>

    <QueryState
      :data="account"
      :error-title="t('loadError')"
      :loading-text="t('loading')"
      :message="message"
      :on-retry="refresh"
      :pending="pending || data?.kind === 'signed-out'">
      <template #default="{ data: page }">
        <main class="user-account-main">
          <div class="user-account-title">
            <span
              class="avatar user-account-avatar"
              :style="{ background: page.user.color }">
              {{ page.user.initials }}
            </span>
            <div>
              <h1>{{ t('yourAccount') }}</h1>
              <p class="muted scope">
                <Globe />
                {{ t('scope') }}
              </p>
            </div>
          </div>

          <ConnectedAccountsSection
            :deps="deps.connectedAccounts"
            :google-client-id="googleClientId"
            :telegram-bot-id="telegramBotId" />

          <InterfaceSection :deps="deps.interface" />
        </main>
      </template>
    </QueryState>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Globe } from '@lucide/vue'

import ConnectedAccountsSection from './components/ConnectedAccountsSection/ConnectedAccountsSection.vue'
import InterfaceSection from './components/InterfaceSection/InterfaceSection.vue'
import type { UserAccountPageDeps } from './UserAccountPage.deps'

const props = defineProps<{
  /** Where the user came from in the app; direct visits go to the organization list. */
  backPath?: string
  deps: UserAccountPageDeps
  googleClientId: string
  onSignedOut: () => Promise<void> | void
  telegramBotId: string
}>()

const { t } = useI18n({
  en: {
    back: 'Back',
    backToOrganizations: 'Back to organizations',
    loadError: 'Could not load your account',
    loading: 'Loading your account…',
    scope: 'Settings on this page apply in all your organizations',
    yourAccount: 'Your account',
  },
  ru: {
    back: 'Назад',
    backToOrganizations: 'К организациям',
    loadError: 'Не удалось загрузить аккаунт',
    loading: 'Загрузка аккаунта…',
    scope: 'Настройки на этой странице действуют во всех ваших организациях',
    yourAccount: 'Ваш аккаунт',
  },
})

useHead({ title: t('yourAccount') })

const { data, message, pending, refresh } = await useQuery('user-account', (_nuxtApp, { signal }) =>
  props.deps.view({ signal }),
)

const account = computed(() => (data.value?.kind === 'signed-in' ? data.value : undefined))

watch(
  () => data.value?.kind,
  (kind) => {
    if (kind === 'signed-out') {
      void props.onSignedOut()
    }
  },
  { immediate: true },
)
</script>

<style scoped>
/* The same frame as the app layout's workspace, so /account doesn't stretch to the window. */
.user-account {
  background: var(--color-workspace);
  border-inline: 1px solid var(--color-divider);
  box-shadow: var(--shadow-workspace);
  margin-inline: auto;
  max-width: var(--workspace-max-width);
  min-height: 100dvh;
}

.user-account-header {
  align-items: center;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-divider);
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
  min-height: 60px;
  padding: 0 var(--space-8);
}

.user-account-main {
  display: grid;
  gap: var(--space-8);
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
  width: min(760px, 100%);
}

.user-account-title {
  align-items: center;
  display: flex;
  gap: var(--space-4);
}

.user-account-title h1 {
  font-size: var(--font-size-title);
  margin: 0 0 var(--space-1);
}

.user-account-avatar {
  flex: none;
  font-size: 22px;
  height: 56px;
  width: 56px;
}

.scope {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  margin: 0;
}

.scope > svg {
  flex: none;
  height: 16px;
  width: 16px;
}

@media (max-width: 767px) {
  .user-account-header {
    padding: 0 var(--space-4);
  }
}
</style>
