<template>
  <RetroBoardPage
    :deps="deps"
    :retro-id="retroId" />
</template>

<script setup lang="ts">
import { createRetroBoardPageDeps } from '~/sections/retro/retro-board/deps-impl'
import RetroBoardPage from '~/sections/retro/retro-board/RetroBoardPage.vue'

const route = useRoute('organizations-organizationKey-retro-retroId')
const retroId = computed(() => String(route.params.retroId))
const config = useRuntimeConfig()
const client = useRetroApiClient()
const deps = createRetroBoardPageDeps(client, config.public.retroHubUrl)
</script>
