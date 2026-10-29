<template>
  <RetroBoardPage
    :deps="deps"
    :retro-id="retroId" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useRoute, useRuntimeConfig } from '#app'
import { createRetroBoardPageDeps } from '#layers/workspace/app/sections/retro/retro-board/RetroBoardPage.deps.impl'
import RetroBoardPage from '#layers/workspace/app/sections/retro/retro-board/RetroBoardPage.vue'
import { useRetroApiClient } from '#layers/workspace/app/shared/composables/useRetroApiClient'

const route = useRoute('organizations-organizationKey-retro-retroId')
const retroId = computed(() => String(route.params.retroId))
const config = useRuntimeConfig()
const client = useRetroApiClient()
const deps = createRetroBoardPageDeps(client, config.public.retroHubUrl)
</script>
