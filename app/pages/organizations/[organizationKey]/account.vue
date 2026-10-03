<template>
  <OrganizationAccountPage
    :api-keys-to="organizationRoutes.apiKeys()"
    :organization-name="organizationName"
    :plan-to="organizationRoutes.accountPlan()"
    :profile-to="organizationRoutes.account()"
    :transactions-to="organizationRoutes.accountTransactions()"
    user-account-to="/account">
    <NuxtPage />
  </OrganizationAccountPage>
</template>

<script setup lang="ts">
import OrganizationAccountPage from '~/sections/organizations/account/OrganizationAccountPage.vue'

const organizationRoutes = useOrganizationRoutes()
const layout = useAppLayoutData()
const organizationName = computed(() => layout.value?.organization.name ?? '')
</script>
