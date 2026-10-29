<template>
  <AppPage>
    <template #header>
      <PageHeader
        :icon="IconSettings"
        :title="t('admin')" />
    </template>
    <BaseSettingsLayout
      :items="tabs"
      :label="t('admin')">
      <NuxtPage />
    </BaseSettingsLayout>
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
import { computed } from 'vue'

import { useRoute } from '#app'
import { NuxtPage } from '#components'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseSettingsLayout from '#layers/core/app/ui/components/BaseSettingsLayout.vue'
import AppPage from '#layers/workspace/app/shared/components/AppPage.vue'
import PageHeader from '#layers/workspace/app/shared/components/PageHeader.vue'
import {
  type OrganizationRouteName,
  useOrganizationRoutes,
} from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useAppLayoutData } from '#layers/workspace/app/shells/organization/useAppLayoutData'

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
