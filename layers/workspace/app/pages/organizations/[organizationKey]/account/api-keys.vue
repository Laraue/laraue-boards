<template>
  <ApiKeysPage :deps="deps" />
</template>

<script setup lang="ts">
import { useHead } from '#app'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import { createApiKeysPageDeps } from '#layers/workspace/app/sections/organizations/account/api-keys/ApiKeysPage.deps.impl'
import ApiKeysPage from '#layers/workspace/app/sections/organizations/account/api-keys/ApiKeysPage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'

const { t } = useI18n({
  en: { apiKeys: 'API keys' },
  ru: { apiKeys: 'API-ключи' },
})

const deps = createApiKeysPageDeps(useApiClient({ onUnauthorized: useSignInRedirect() }))

useHead({ title: t('apiKeys') })
</script>
