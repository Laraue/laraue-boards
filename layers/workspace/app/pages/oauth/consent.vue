<template>
  <OAuthConsentPage
    :deps="deps"
    :error="error"
    :on-redirect="(url) => navigateTo(url, { external: true })"
    :on-sign-in-required="signIn"
    :request-id="requestId" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { navigateTo, useRoute } from '#app'
import { definePageMeta } from '#app/composables/pages'
import { createOAuthConsentPageDeps } from '#layers/workspace/app/sections/oauth-consent/OAuthConsentPage.deps.impl'
import OAuthConsentPage from '#layers/workspace/app/sections/oauth-consent/OAuthConsentPage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'

definePageMeta({ layout: 'public' })

// Boards' OAuth authorize endpoint sends the browser here with ?request=<id>, or ?error=<code> when it
// refused the app before asking (see BRD-362).
const route = useRoute()
const requestId = computed(() =>
  typeof route.query.request === 'string' ? route.query.request : '',
)
const error = computed(() => (typeof route.query.error === 'string' ? route.query.error : ''))
const deps = createOAuthConsentPageDeps(useApiClient({}))

// Back to this page after signing in, with the same request.
const signIn = async (): Promise<void> => {
  await navigateTo({ path: '/login', query: { redirect: route.fullPath } })
}
</script>
