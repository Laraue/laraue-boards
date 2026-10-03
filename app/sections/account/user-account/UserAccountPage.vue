<template>
  <div class="user-account">
    <NuxtLink
      v-if="data"
      class="secondary back"
      :to="backPath || '/organizations'">
      <ArrowLeft />
      {{ backPath ? t('back') : t('backToOrganizations') }}
    </NuxtLink>

    <QueryState
      :data="data"
      :error-title="t('loadError')"
      :loading-text="t('loading')"
      :message="message"
      :on-retry="refresh"
      :pending="pending">
      <template #default="{ data: page }">
        <div class="user-account-main">
          <div class="user-account-title">
            <span
              v-if="page.initials"
              class="avatar user-account-avatar"
              :style="{ background: DEFAULT_COLOR }">
              {{ page.initials }}
            </span>
            <CircleUser
              v-else
              class="user-account-icon" />
            <div>
              <h1>{{ t('yourAccount') }}</h1>
              <p class="muted scope">
                <Globe />
                {{ t('scope') }}
              </p>
            </div>
            <button
              class="secondary danger log-out"
              :disabled="loggingOut"
              type="button"
              @click="logout">
              <LogOut />
              {{ t('logOut') }}
            </button>
          </div>

          <ProfileSection
            :deps="deps.profile"
            :on-updated="refresh" />

          <ConnectedAccountsSection
            :deps="deps.connectedAccounts"
            :google-client-id="googleClientId"
            :telegram-bot-id="telegramBotId" />

          <InterfaceSection :deps="deps.interface" />
        </div>
      </template>
    </QueryState>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, CircleUser, Globe, LogOut } from '@lucide/vue'

import { DEFAULT_COLOR } from '~/constants/colors'

import ConnectedAccountsSection from './components/ConnectedAccountsSection/ConnectedAccountsSection.vue'
import InterfaceSection from './components/InterfaceSection/InterfaceSection.vue'
import ProfileSection from './components/ProfileSection/ProfileSection.vue'
import type { UserAccountPageDeps } from './UserAccountPage.deps'

const props = defineProps<{
  /** Where the user came from in the app; direct visits go to the organization list. */
  backPath?: string
  deps: UserAccountPageDeps
  googleClientId: string
  onLoggedOut: () => Promise<void> | void
  telegramBotId: string
}>()

const { t } = useI18n({
  en: {
    back: 'Back',
    backToOrganizations: 'Back to organizations',
    loadError: 'Could not load your account',
    loading: 'Loading your account…',
    logOut: 'Log out',
    scope: 'One account for all Laraue apps',
    yourAccount: 'Your Laraue account',
  },
  ru: {
    back: 'Назад',
    backToOrganizations: 'К организациям',
    loadError: 'Не удалось загрузить аккаунт',
    loading: 'Загрузка аккаунта…',
    logOut: 'Выйти',
    scope: 'Один аккаунт для всех приложений Laraue',
    yourAccount: 'Ваш аккаунт Laraue',
  },
})

useHead({ title: t('yourAccount') })

const { data, message, pending, refresh } = await useApiQuery('user-account', (signal) =>
  props.deps.view({ signal }),
)

const { execute: executeLogout, pending: loggingOut } = useApiAction(props.deps.logout)

const logout = async (): Promise<void> => {
  if (!loggingOut.value && (await executeLogout())) {
    await props.onLoggedOut()
  }
}
</script>

<style scoped>
.user-account {
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
  width: min(760px, 100%);
}

.back {
  margin-bottom: var(--space-6);
}

.log-out {
  flex: none;
  margin-left: auto;
}

.user-account-main {
  display: grid;
  gap: var(--space-8);
}

.user-account-title {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
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

.user-account-icon {
  color: var(--color-muted);
  flex: none;
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
</style>
