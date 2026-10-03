<template>
  <section class="account-page">
    <PageHeader
      :icon="Building2"
      :title="t('youIn', { organization: organizationName })" />
    <p class="muted">
      {{ t('scope', { organization: organizationName }) }}
      <NuxtLink :to="userAccountTo">{{ t('yourAccount') }}</NuxtLink>
    </p>

    <nav
      :aria-label="t('youIn', { organization: organizationName })"
      class="page-tabs">
      <NuxtLink
        class="page-tab"
        exact-active-class="active"
        :to="profileTo">
        <UserRound />
        {{ t('profile') }}
      </NuxtLink>
      <NuxtLink
        class="page-tab"
        exact-active-class="active"
        :to="planTo">
        <CreditCard />
        {{ t('plan') }}
      </NuxtLink>
      <NuxtLink
        class="page-tab"
        exact-active-class="active"
        :to="transactionsTo">
        <History />
        {{ t('transactions') }}
      </NuxtLink>
      <NuxtLink
        class="page-tab"
        exact-active-class="active"
        :to="apiKeysTo">
        <KeyRound />
        {{ t('apiKeys') }}
      </NuxtLink>
    </nav>

    <slot />
  </section>
</template>

<script setup lang="ts">
import { Building2, CreditCard, History, KeyRound, UserRound } from '@lucide/vue'
import type { RouteLocationRaw } from 'vue-router'

defineProps<{
  apiKeysTo: RouteLocationRaw
  organizationName: string
  planTo: RouteLocationRaw
  profileTo: RouteLocationRaw
  transactionsTo: RouteLocationRaw
  userAccountTo: RouteLocationRaw
}>()

const { t } = useI18n({
  en: {
    apiKeys: 'API keys',
    plan: 'Plan and usage',
    profile: 'Profile',
    scope: 'Applies only in {organization}. Sign-in methods, language and theme are in',
    transactions: 'Transactions',
    youIn: 'You in {organization}',
    yourAccount: 'your account',
  },
  ru: {
    apiKeys: 'API-ключи',
    plan: 'Тариф и лимиты',
    profile: 'Профиль',
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

/* The header keeps its own spacing below it. */
.account-page > .page-header {
  margin-bottom: calc(-1 * var(--space-6) + var(--layout-content-padding, 0px));
}

.account-page > p {
  margin: 0;
}
</style>
