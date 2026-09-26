<template>
  <section class="account-page">
    <div class="page-heading">
      <CircleUser class="page-heading-icon" />
      <div class="page-heading-text">
        <h1>{{ t('account') }}</h1>
        <p class="muted">{{ t('description') }}</p>
      </div>
    </div>

    <nav
      :aria-label="t('account')"
      class="page-tabs">
      <NuxtLink
        class="page-tab"
        exact-active-class="active"
        :to="organizationRoutes.account()">
        <CreditCard />
        {{ t('plan') }}
      </NuxtLink>
      <NuxtLink
        class="page-tab"
        exact-active-class="active"
        :to="organizationRoutes.accountTransactions()">
        <History />
        {{ t('transactions') }}
      </NuxtLink>
      <NuxtLink
        class="page-tab"
        exact-active-class="active"
        :to="organizationRoutes.apiKeys()">
        <KeyRound />
        {{ t('apiKeys') }}
      </NuxtLink>
      <NuxtLink
        class="page-tab"
        exact-active-class="active"
        :to="organizationRoutes.connectedAccounts()">
        <Link2 />
        {{ t('connectedAccounts') }}
      </NuxtLink>
    </nav>

    <NuxtPage />
  </section>
</template>

<script setup lang="ts">
import { CircleUser, CreditCard, History, KeyRound, Link2 } from '@lucide/vue'

const organizationRoutes = useOrganizationRoutes()
const { t } = useI18n({
  en: {
    account: 'Account',
    apiKeys: 'API keys',
    connectedAccounts: 'Connected accounts',
    description: 'Your plan, token activity, API access and sign-in methods.',
    plan: 'Plan and usage',
    transactions: 'Transactions',
  },
  ru: {
    account: 'Аккаунт',
    apiKeys: 'API-ключи',
    connectedAccounts: 'Подключённые аккаунты',
    description: 'Ваш тариф, операции с токенами, доступ к API и способы входа.',
    plan: 'Тариф и лимиты',
    transactions: 'Транзакции',
  },
})
</script>

<style scoped>
.account-page {
  align-content: start;
  display: grid;
  gap: var(--space-6);
}
</style>
