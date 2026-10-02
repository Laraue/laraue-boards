<template>
  <LoginPage
    :deps="deps"
    :google-client-id="config.public.googleClientId"
    :on-logged-in="onLoggedIn"
    :telegram-bot-id="String(config.public.telegramBotId)" />
</template>

<script setup lang="ts">
import { createLoginPageDeps } from '~/sections/auth/login/LoginPage.deps.impl'
import LoginPage from '~/sections/auth/login/LoginPage.vue'

definePageMeta({ layout: false })
const config = useRuntimeConfig()
const route = useRoute()
const client = useApiClient()
const deps = createLoginPageDeps(client, import.meta.dev ? config.public.testUserToken : undefined)
const onLoggedIn = async (): Promise<void> => {
  const { redirect } = route.query

  await navigateTo(typeof redirect === 'string' ? redirect : '/organizations')
}
</script>
