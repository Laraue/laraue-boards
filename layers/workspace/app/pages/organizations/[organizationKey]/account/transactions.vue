<template>
  <UserTransactionsPage :deps="deps" />
</template>

<script setup lang="ts">
import { useHead } from '#app'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import { createTransactionsPageDeps } from '#layers/workspace/app/sections/organizations/account/transactions/UserTransactionsPage.deps.impl'
import UserTransactionsPage from '#layers/workspace/app/sections/organizations/account/transactions/UserTransactionsPage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'

const { t } = useI18n({
  en: { transactions: 'Transactions' },
  ru: { transactions: 'Транзакции' },
})

const deps = createTransactionsPageDeps(useApiClient({ onUnauthorized: useSignInRedirect() }))

useHead({ title: t('transactions') })
</script>
