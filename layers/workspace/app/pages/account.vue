<template>
  <UserAccountPage
    :back-path="backPath"
    :deps="deps"
    :google-client-id="config.public.googleClientId"
    :on-logged-out="onLoggedOut"
    :telegram-bot-id="String(config.public.telegramBotId)" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { clearNuxtData, navigateTo, useRouter, useRuntimeConfig } from '#app'
import { definePageMeta } from '#app/composables/pages'
import { useAppPreferences } from '#layers/core/app/preferences/useAppPreferences'
import { createUserAccountPageDeps } from '#layers/workspace/app/sections/account/user-account/UserAccountPage.deps.impl'
import UserAccountPage from '#layers/workspace/app/sections/account/user-account/UserAccountPage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'

definePageMeta({ layout: 'account' })

const config = useRuntimeConfig()
const deps = createUserAccountPageDeps(
  useApiClient({ onUnauthorized: useSignInRedirect() }),
  useAppPreferences(),
)

// The page the user came from inside the app; unknown on the server and when /account is opened
// directly, so it is read after mounting.
const router = useRouter()
const backPath = ref<string>()
onMounted(() => {
  const back = router.options.history.state.back
  backPath.value = typeof back === 'string' && back !== '/account' ? back : undefined
})

const onLoggedOut = async (): Promise<void> => {
  clearNuxtData()
  await navigateTo('/login')
}
</script>
