<template>
  <AttributesPage :deps="deps" />
</template>

<script setup lang="ts">
import AttributesPage from '~/sections/organizations/attributes/list-attributes/AttributesPage.vue'
import { createAttributesPageDeps } from '~/sections/organizations/attributes/list-attributes/deps-impl'

const client = useApiClient()
const deps = createAttributesPageDeps(client)
</script>
