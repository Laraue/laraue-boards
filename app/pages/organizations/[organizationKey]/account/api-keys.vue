<template>
  <ApiKeysPage :deps="deps" />
</template>

<script setup lang="ts">
import ApiKeysPage from '~/sections/organizations/account/api-keys/ApiKeysPage.vue'
import { createApiKeysPageDeps } from '~/sections/organizations/account/api-keys/deps-impl'

const { t } = useI18n({
  en: { apiKeys: 'API keys' },
  ru: { apiKeys: 'API-ключи' },
})

const deps = createApiKeysPageDeps(useApiClient())

useHead({ title: t('apiKeys') })
</script>
