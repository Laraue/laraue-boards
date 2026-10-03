<template>
  <UserAccountPage
    :back-path="backPath"
    :deps="deps"
    :google-client-id="config.public.googleClientId"
    :on-logged-out="onLoggedOut"
    :telegram-bot-id="String(config.public.telegramBotId)" />
</template>

<script setup lang="ts">
import { createUserAccountPageDeps } from '~/sections/account/user-account/UserAccountPage.deps.impl'
import UserAccountPage from '~/sections/account/user-account/UserAccountPage.vue'

definePageMeta({ layout: 'account' })

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
</script>
