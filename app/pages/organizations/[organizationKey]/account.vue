<template>
  <section class="account-page">
    <div class="page-heading">
      <Building2 class="page-heading-icon" />
      <div class="page-heading-text">
        <h1>{{ t('youIn', { organization: organizationName }) }}</h1>
        <p class="muted">
          {{ t('scope', { organization: organizationName }) }}
          <NuxtLink to="/account">{{ t('yourAccount') }}</NuxtLink>
        </p>
      </div>
    </div>

    <nav
      :aria-label="t('youIn', { organization: organizationName })"
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
    </nav>

    <NuxtPage />
  </section>
</template>

<script setup lang="ts">
import { Building2, CreditCard, History, KeyRound } from '@lucide/vue'

import type { AppLayoutData } from '~/sections/common/app-layout/AppLayout.types'

const organizationRoutes = useOrganizationRoutes()
const { data } = useNuxtData<{ data?: AppLayoutData }>(appLayoutDataKey)
const organizationName = computed(() => data.value?.data?.organization.name ?? '')
const { t } = useI18n({
  en: {
    apiKeys: 'API keys',
    plan: 'Plan and usage',
    scope: 'Applies only in {organization}. Sign-in methods, language and theme are in',
    transactions: 'Transactions',
    youIn: 'You in {organization}',
    yourAccount: 'your account',
  },
  ru: {
    apiKeys: 'API-ключи',
    plan: 'Тариф и лимиты',
    scope: 'Действует только в {organization}. Способы входа, язык и тема — в',
    transactions: 'Транзакции',
    youIn: 'Вы в организации {organization}',
    yourAccount: 'вашем аккаунте',
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
