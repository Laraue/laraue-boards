<template>
  <OrganizationTransactionsPage :deps="deps" />
</template>

<script setup lang="ts">
import { createTransactionsPageDeps } from '~/sections/organizations/admin/transactions/deps-impl'
import OrganizationTransactionsPage from '~/sections/organizations/admin/transactions/OrganizationTransactionsPage.vue'

const { t } = useI18n({
  en: { transactions: 'Organization transactions' },
  ru: { transactions: 'Транзакции организации' },
})

const deps = createTransactionsPageDeps(useApiClient())

useHead({ title: t('transactions') })
</script>
