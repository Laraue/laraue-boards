<template>
  <LoginPage
    :deps="deps"
    :google-client-id="config.public.googleClientId"
    :on-logged-in="onLoggedIn"
    :telegram-bot-id="String(config.public.telegramBotId)" />
</template>

<script setup lang="ts">
import { navigateTo, useRoute, useRuntimeConfig } from '#app'
import { definePageMeta } from '#app/composables/pages'
import { createLoginPageDeps } from '#layers/workspace/app/sections/auth/login/LoginPage.deps.impl'
import LoginPage from '#layers/workspace/app/sections/auth/login/LoginPage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'

definePageMeta({ layout: 'public' })
const config = useRuntimeConfig()
const route = useRoute()
const client = useApiClient({})
const deps = createLoginPageDeps(client, import.meta.dev ? config.public.testUserToken : undefined)
const onLoggedIn = async (): Promise<void> => {
  const { redirect } = route.query

  await navigateTo(typeof redirect === 'string' ? redirect : '/organizations')
}
</script>
