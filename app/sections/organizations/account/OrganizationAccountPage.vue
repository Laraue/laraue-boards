<template>
  <AppPage class="account-page">
    <template #header>
      <PageHeader
        :icon="IconBuilding"
        :title="t('youIn', { organization: organizationName })" />
    </template>
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
        <IconUser />
        {{ t('profile') }}
      </NuxtLink>
      <NuxtLink
        active-class="active"
        class="page-tab"
        :to="planTo">
        <IconCreditCard />
        {{ t('plan') }}
      </NuxtLink>
      <NuxtLink
        class="page-tab"
        exact-active-class="active"
        :to="transactionsTo">
        <IconHistory />
        {{ t('transactions') }}
      </NuxtLink>
      <NuxtLink
        class="page-tab"
        exact-active-class="active"
        :to="apiKeysTo">
        <IconKey />
        {{ t('apiKeys') }}
      </NuxtLink>
    </nav>

    <slot />
  </AppPage>
</template>

<script setup lang="ts">
import { IconBuilding, IconCreditCard, IconHistory, IconKey, IconUser } from '@tabler/icons-vue'
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
.account-page :deep(.app-page-content) {
  align-content: start;
  display: grid;
  gap: var(--space-6);
}

.account-page p {
  margin: 0;
}
</style>
