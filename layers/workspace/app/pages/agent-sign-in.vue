<template>
  <AgentSignInPage
    :code="code"
    :deps="deps"
    :on-sign-in-required="signIn" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { navigateTo, useRoute } from '#app'
import { definePageMeta } from '#app/composables/pages'
import { createAgentSignInPageDeps } from '#layers/workspace/app/sections/agent-sign-in/AgentSignInPage.deps.impl'
import AgentSignInPage from '#layers/workspace/app/sections/agent-sign-in/AgentSignInPage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'

definePageMeta({ layout: 'public' })

const route = useRoute()
const code = computed(() => (typeof route.query.code === 'string' ? route.query.code : ''))
const deps = createAgentSignInPageDeps(useApiClient({}))

// Back to this page after signing in, with the same code.
const signIn = async (): Promise<void> => {
  await navigateTo({ path: '/login', query: { redirect: route.fullPath } })
}
</script>
