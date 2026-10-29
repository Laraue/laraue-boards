<template>
  <MemberPermissionsPage
    :deps="deps"
    :member-id="memberId"
    :on-saved="onSaved"
    :organization-routes="organizationRoutes" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { navigateTo, useRoute } from '#app'
import { createMemberPermissionsPageDeps } from '#layers/workspace/app/sections/organizations/permissions/member-permissions/MemberPermissionsPage.deps.impl'
import MemberPermissionsPage from '#layers/workspace/app/sections/organizations/permissions/member-permissions/MemberPermissionsPage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'

const route = useRoute('organizations-organizationKey-admin-permissions-id')
const memberId = computed(() => String(route.params.id))
const client = useApiClient({ onUnauthorized: useSignInRedirect() })
const deps = createMemberPermissionsPageDeps(client)
const organizationRoutes = useOrganizationRoutes()
const onSaved = async (): Promise<void> => {
  await navigateTo(organizationRoutes.permissions())
}
</script>
