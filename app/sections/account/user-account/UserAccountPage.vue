<template>
  <div class="user-account">
    <StandalonePageHeader
      :back-label="backPath ? t('back') : t('backToOrganizations')"
      :back-to="backPath || '/organizations'"
      :title="t('yourAccount')">
      <template #actions>
        <BaseButton
          v-if="data"
          :disabled="loggingOut"
          @click="logout">
          <IconLogout />
          {{ t('logOut') }}
        </BaseButton>
      </template>
    </StandalonePageHeader>
    <p class="muted scope">
      <IconWorld />
      {{ t('scope') }}
    </p>

    <QueryState
      :data="data"
      :error-title="t('loadError')"
      :loading-text="t('loading')"
      :message="message"
      :on-retry="refresh"
      :pending="pending">
      <template #default>
        <div class="user-account-main">
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
import { IconLogout, IconWorld } from '@tabler/icons-vue'

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
  width: min(var(--form-page-max-width), 100%);
}

.scope {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  margin: var(--space-2) 0 var(--space-8);
}

.scope > svg {
  flex: none;
  height: var(--icon-size);
  width: var(--icon-size);
}

.user-account-main {
  display: grid;
  gap: var(--space-8);
}

/* A line between the sections, as between a settings form and its danger zone. */
.user-account-main > * + * {
  border-top: 1px solid var(--color-divider);
  padding-top: var(--space-8);
}
</style>
