<template>
  <ConnectedAccountsPage
    :bot-name="config.public.botName"
    :deps="deps"
    :google-client-id="config.public.googleClientId" />
</template>

<script setup lang="ts">
import ConnectedAccountsPage from '~/sections/organizations/account/connected-accounts/ConnectedAccountsPage.vue'
import { createConnectedAccountsPageDeps } from '~/sections/organizations/account/connected-accounts/deps-impl'

const config = useRuntimeConfig()
const { t } = useI18n({
  en: { connectedAccounts: 'Connected accounts' },
  ru: { connectedAccounts: 'Подключённые аккаунты' },
})

const deps = createConnectedAccountsPageDeps(useApiClient())

useHead({ title: t('connectedAccounts') })
</script>
