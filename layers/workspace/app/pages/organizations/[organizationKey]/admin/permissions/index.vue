<template>
  <PermissionsPage
    :deps="deps"
    :organization-routes="organizationRoutes" />
</template>

<script setup lang="ts">
import { createPermissionsPageDeps } from '#layers/workspace/app/sections/organizations/permissions/list-members/PermissionsPage.deps.impl'
import PermissionsPage from '#layers/workspace/app/sections/organizations/permissions/list-members/PermissionsPage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'

const client = useApiClient({ onUnauthorized: useSignInRedirect() })
const deps = createPermissionsPageDeps(client)

const organizationRoutes = useOrganizationRoutes()
</script>
