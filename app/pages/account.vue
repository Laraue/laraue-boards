<template>
  <UserAccountPage
    :back-path="backPath"
    :deps="deps"
    :google-client-id="config.public.googleClientId"
    :on-logged-out="onLoggedOut"
    :on-signed-out="onSignedOut"
    :telegram-bot-id="String(config.public.telegramBotId)" />
</template>

<script setup lang="ts">
import { createUserAccountPageDeps } from '~/sections/account/user-account/deps-impl'
import UserAccountPage from '~/sections/account/user-account/UserAccountPage.vue'

definePageMeta({ layout: false })

const config = useRuntimeConfig()
const deps = createUserAccountPageDeps(useApiClient(), useAppPreferences())

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

const onSignedOut = async (): Promise<void> => {
  await navigateTo({ path: '/login', query: { redirect: '/account' } })
}
</script>
