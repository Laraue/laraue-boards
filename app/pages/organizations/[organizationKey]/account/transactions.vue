<template>
  <UserTransactionsPage :deps="deps" />
</template>

<script setup lang="ts">
import { createTransactionsPageDeps } from '~/sections/organizations/account/transactions/deps-impl'
import UserTransactionsPage from '~/sections/organizations/account/transactions/UserTransactionsPage.vue'

const { t } = useI18n({
  en: { transactions: 'Transactions' },
  ru: { transactions: 'Транзакции' },
})

const deps = createTransactionsPageDeps(useApiClient())

useHead({ title: t('transactions') })
</script>
