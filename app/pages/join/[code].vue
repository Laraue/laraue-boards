<template>
  <JoinOrganizationPage
    :code="code"
    :deps="deps"
    :google-client-id="config.public.googleClientId"
    :on-joined="onJoined"
    :telegram-bot-id="String(config.public.telegramBotId)" />
</template>

<script setup lang="ts">
import { createJoinOrganizationPageDeps } from '~/sections/organizations/join-organization/JoinOrganizationPage.deps.impl'
import JoinOrganizationPage from '~/sections/organizations/join-organization/JoinOrganizationPage.vue'

definePageMeta({ layout: 'public' })

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
