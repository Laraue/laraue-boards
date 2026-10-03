<template>
  <ApiKeysPage :deps="deps" />
</template>

<script setup lang="ts">
import { createApiKeysPageDeps } from '~/sections/organizations/account/api-keys/ApiKeysPage.deps.impl'
import ApiKeysPage from '~/sections/organizations/account/api-keys/ApiKeysPage.vue'

const { t } = useI18n({
  en: { apiKeys: 'API keys' },
  ru: { apiKeys: 'API-ключи' },
})

const deps = createApiKeysPageDeps(useApiClient())

usePageTitle(t('apiKeys'))
</script>
