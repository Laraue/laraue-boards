<template>
  <section class="settings-page">
    <div class="page-heading">
      <Settings class="page-heading-icon" />
      <div class="page-heading-text">
        <h1>{{ t('admin') }}</h1>
        <p class="muted">{{ t('description') }}</p>
      </div>
    </div>

    <nav
      :aria-label="t('admin')"
      class="page-tabs">
      <NuxtLink
        v-if="organization?.canUpdate"
        class="page-tab"
        :class="{ active: route.name === 'organizations-organizationKey-admin' }"
        :to="organizationRoutes.admin()">
        <Settings />
        {{ t('general') }}
      </NuxtLink>
      <NuxtLink
        v-if="organization?.canManage"
        class="page-tab"
        :class="{ active: within('organizations-organizationKey-admin-permissions') }"
        :to="organizationRoutes.permissions()">
        <ShieldCheck />
        {{ t('permissions') }}
      </NuxtLink>
      <NuxtLink
        v-if="organization?.canManageAttributes"
        class="page-tab"
        :class="{ active: within('organizations-organizationKey-admin-attributes') }"
        :to="organizationRoutes.attributes()">
        <Tags />
        {{ t('attributes') }}
      </NuxtLink>
      <NuxtLink
        v-if="organization?.canMassMove"
        class="page-tab"
        :class="{ active: within('organizations-organizationKey-admin-data-movement') }"
        :to="organizationRoutes.dataMovement()">
        <ArrowRightLeft />
        {{ t('dataMovement') }}
      </NuxtLink>
      <NuxtLink
        v-if="organization?.canViewBilling"
        class="page-tab"
        :class="{ active: within('organizations-organizationKey-admin-transactions') }"
        :to="organizationRoutes.adminTransactions()">
        <History />
        {{ t('transactions') }}
      </NuxtLink>
    </nav>

    <NuxtPage />
  </section>
</template>

<script setup lang="ts">
import { ArrowRightLeft, History, Settings, ShieldCheck, Tags } from '@lucide/vue'

import type { AppLayoutData } from '~/sections/common/app-layout/AppLayout.types'

const route = useRoute<OrganizationRouteName>()
const organizationRoutes = useOrganizationRoutes()
const { data } = useNuxtData<{ data?: AppLayoutData }>(appLayoutDataKey)
const organization = computed(() => data.value?.data?.organization)
const within = (name: OrganizationRouteName) =>
  typeof route.name === 'string' && route.name.startsWith(name)
const { t } = useI18n({
  en: {
    admin: 'Administration',
    attributes: 'Attributes',
    dataMovement: 'Data movement',
    description: 'Organization settings, members and usage.',
    general: 'General',
    permissions: 'Permissions',
    transactions: 'Transactions',
  },
  ru: {
    admin: 'Администрирование',
    attributes: 'Атрибуты',
    dataMovement: 'Перенос данных',
    description: 'Настройки организации, участники и расходы.',
    general: 'Общие',
    permissions: 'Права доступа',
    transactions: 'Транзакции',
  },
})
</script>

<style scoped>
.settings-page {
  align-content: start;
  display: grid;
  gap: var(--space-6);
}
</style>
