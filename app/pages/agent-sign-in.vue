<template>
  <AgentSignInPage
    :code="code"
    :deps="deps"
    :on-sign-in-required="signIn" />
</template>

<script setup lang="ts">
import { createAgentSignInPageDeps } from '~/sections/agent-sign-in/AgentSignInPage.deps.impl'
import AgentSignInPage from '~/sections/agent-sign-in/AgentSignInPage.vue'

definePageMeta({ layout: 'public' })

const route = useRoute()
const code = computed(() => (typeof route.query.code === 'string' ? route.query.code : ''))
const deps = createAgentSignInPageDeps(useApiClient())

// Back to this page after signing in, with the same code.
const signIn = async (): Promise<void> => {
  await navigateTo({ path: '/login', query: { redirect: route.fullPath } })
}
</script>
