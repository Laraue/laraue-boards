<template>
  <JoinOrganizationPage
    :bot-name="config.public.botName"
    :code="code"
    :deps="deps"
    :on-joined="onJoined" />
</template>

<script setup lang="ts">
import { createJoinOrganizationPageDeps } from '~/sections/organizations/join-organization/deps-impl'
import JoinOrganizationPage from '~/sections/organizations/join-organization/JoinOrganizationPage.vue'

definePageMeta({ layout: false })

const route = useRoute('join-code')
const config = useRuntimeConfig()
const code = computed(() => String(route.params.code))
const deps = createJoinOrganizationPageDeps(
  useApiClient(),
  import.meta.dev ? config.public.testUserToken : undefined,
)

const onJoined = async (): Promise<void> => {
  clearNuxtData()
  await navigateTo('/organizations')
}
</script>
