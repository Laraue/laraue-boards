<template>
  <AppPage>
    <template #header>
      <PageHeader
        :icon="IconSettings"
        :title="t('admin')" />
    </template>
    <section class="settings-page">
      <BaseNavTabs
        :items="tabs"
        :label="t('admin')" />

      <NuxtPage />
    </section>
  </AppPage>
</template>

<script setup lang="ts">
import {
  IconArrowsLeftRight,
  IconHistory,
  IconSettings,
  IconShieldCheck,
  IconTags,
} from '@tabler/icons-vue'

const route = useRoute<OrganizationRouteName>()
const organizationRoutes = useOrganizationRoutes()
const layout = useAppLayoutData()
const organization = computed(() => layout.value?.organization)
const within = (name: OrganizationRouteName) =>
  typeof route.name === 'string' && route.name.startsWith(name)
const tabs = computed(() =>
  [
    organization.value?.canUpdate && {
      active: route.name === 'organizations-organizationKey-admin',
      icon: IconSettings,
      label: t('general'),
      to: organizationRoutes.admin(),
    },
    organization.value?.canManage && {
      active: within('organizations-organizationKey-admin-permissions'),
      icon: IconShieldCheck,
      label: t('permissions'),
      to: organizationRoutes.permissions(),
    },
    organization.value?.canManageAttributes && {
      active: within('organizations-organizationKey-admin-attributes'),
      icon: IconTags,
      label: t('attributes'),
      to: organizationRoutes.attributes(),
    },
    organization.value?.canMassMove && {
      active: within('organizations-organizationKey-admin-data-movement'),
      icon: IconArrowsLeftRight,
      label: t('dataMovement'),
      to: organizationRoutes.dataMovement(),
    },
    organization.value?.canViewBilling && {
      active: within('organizations-organizationKey-admin-transactions'),
      icon: IconHistory,
      label: t('transactions'),
      to: organizationRoutes.adminTransactions(),
    },
  ].filter((tab) => tab !== false && tab !== undefined),
)
const { t } = useI18n({
  en: {
    admin: 'Administration',
    attributes: 'Attributes',
    dataMovement: 'Data movement',
    general: 'General',
    permissions: 'Permissions',
    transactions: 'Transactions',
  },
  ru: {
    admin: 'Администрирование',
    attributes: 'Атрибуты',
    dataMovement: 'Перенос данных',
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
