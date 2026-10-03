<template>
  <section class="settings-page">
    <PageHeader
      :icon="Settings"
      :title="t('admin')" />
    <nav
      :aria-label="t('admin')"
      class="page-tabs">
      <NuxtLink
        v-if="organization?.canUpdate"
        class="page-tab"
        :class="{ active: route.name === 'organizations-organizationKey-admin' }"
        :to="organizationRoutes.admin()">
        <IconSettings />
        {{ t('general') }}
      </NuxtLink>
      <NuxtLink
        v-if="organization?.canManage"
        class="page-tab"
        :class="{ active: within('organizations-organizationKey-admin-permissions') }"
        :to="organizationRoutes.permissions()">
        <IconShieldCheck />
        {{ t('permissions') }}
      </NuxtLink>
      <NuxtLink
        v-if="organization?.canManageAttributes"
        class="page-tab"
        :class="{ active: within('organizations-organizationKey-admin-attributes') }"
        :to="organizationRoutes.attributes()">
        <IconTags />
        {{ t('attributes') }}
      </NuxtLink>
      <NuxtLink
        v-if="organization?.canMassMove"
        class="page-tab"
        :class="{ active: within('organizations-organizationKey-admin-data-movement') }"
        :to="organizationRoutes.dataMovement()">
        <IconArrowsLeftRight />
        {{ t('dataMovement') }}
      </NuxtLink>
      <NuxtLink
        v-if="organization?.canViewBilling"
        class="page-tab"
        :class="{ active: within('organizations-organizationKey-admin-transactions') }"
        :to="organizationRoutes.adminTransactions()">
        <IconHistory />
        {{ t('transactions') }}
      </NuxtLink>
    </nav>

    <NuxtPage />
  </section>
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

/* The header keeps its own spacing below it. */
.settings-page > .page-header {
  margin-bottom: calc(-1 * var(--space-6) + var(--layout-content-padding, 0px));
}
</style>
