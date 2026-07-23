<template>
  <AttributePage
    :attribute-id="attributeId"
    :deps="deps"
    :on-finished="onFinished" />
</template>

<script setup lang="ts">
import AttributePage from '~/sections/organizations/attributes/attribute/AttributePage.vue'
import { createAttributePageDeps } from '~/sections/organizations/attributes/attribute/deps-impl'

const route = useRoute('organizations-organizationKey-settings-attributes-id')
const attributeId = computed(() => String(route.params.id))
const client = useApiClient()
const deps = createAttributePageDeps(client)
const organizationRoutes = useOrganizationRoutes()
const onFinished = async (): Promise<void> => {
  await navigateTo(organizationRoutes.attributes())
}
</script>
