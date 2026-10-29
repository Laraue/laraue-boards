<template>
  <AttributesPage
    :deps="deps"
    :organization-routes="organizationRoutes" />
</template>

<script setup lang="ts">
import { createAttributesPageDeps } from '#layers/workspace/app/sections/organizations/attributes/list-attributes/AttributesPage.deps.impl'
import AttributesPage from '#layers/workspace/app/sections/organizations/attributes/list-attributes/AttributesPage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'

const client = useApiClient({ onUnauthorized: useSignInRedirect() })
const deps = createAttributesPageDeps(client)

const organizationRoutes = useOrganizationRoutes()
</script>
