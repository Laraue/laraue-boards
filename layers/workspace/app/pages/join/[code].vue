<template>
  <JoinOrganizationPage
    :code="code"
    :deps="deps"
    :google-client-id="config.public.googleClientId"
    :on-joined="onJoined"
    :telegram-bot-id="String(config.public.telegramBotId)" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { clearNuxtData, navigateTo, useRoute, useRuntimeConfig } from '#app'
import { definePageMeta } from '#app/composables/pages'
import { createJoinOrganizationPageDeps } from '#layers/workspace/app/sections/organizations/join-organization/JoinOrganizationPage.deps.impl'
import JoinOrganizationPage from '#layers/workspace/app/sections/organizations/join-organization/JoinOrganizationPage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'

definePageMeta({ layout: 'public' })

const route = useRoute('join-code')
const config = useRuntimeConfig()
const code = computed(() => String(route.params.code))
const deps = createJoinOrganizationPageDeps(
  useApiClient({}),
  import.meta.dev ? config.public.testUserToken : undefined,
)

const onJoined = async (): Promise<void> => {
  clearNuxtData()
  await navigateTo('/organizations')
}
</script>
