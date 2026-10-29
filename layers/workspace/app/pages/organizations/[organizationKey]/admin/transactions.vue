<template>
  <OrganizationTransactionsPage :deps="deps" />
</template>

<script setup lang="ts">
import { useHead } from '#app'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import { createTransactionsPageDeps } from '#layers/workspace/app/sections/organizations/admin/transactions/OrganizationTransactionsPage.deps.impl'
import OrganizationTransactionsPage from '#layers/workspace/app/sections/organizations/admin/transactions/OrganizationTransactionsPage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'

const { t } = useI18n({
  en: { transactions: 'Organization transactions' },
  ru: { transactions: 'Транзакции организации' },
})

const deps = createTransactionsPageDeps(useApiClient({ onUnauthorized: useSignInRedirect() }))

useHead({ title: t('transactions') })
</script>
