<template>
  <div class="issue-history-state">
    <HistoryTimeline
      v-if="state.items.length || !state.pending"
      :items="state.items"
      :label="label" />
    <p
      v-if="state.message"
      class="form-error"
      role="alert">
      {{ state.message }}
    </p>
    <div
      v-if="state.pending"
      class="history-loading"
      role="status">
      <LoaderCircle class="spin" />
      <span>Loading history…</span>
    </div>
    <button
      v-else-if="state.message || state.hasNextPage"
      class="secondary small history-more"
      type="button"
      @click="load()">
      {{ state.message ? 'Try again' : 'Load more' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { LoaderCircle } from '@lucide/vue'

import type { HistoryItemViewModel } from '~/components/history-timeline/HistoryTimeline.types'
import HistoryTimeline from '~/components/history-timeline/HistoryTimeline.vue'

import type { IssueHistoryDeps } from './IssueHistory.deps'

const props = withDefaults(
  defineProps<{
    deps: IssueHistoryDeps
    errorMessage?: string
    issueKey: string
    label?: string
  }>(),
  {
    errorMessage: 'Could not load issue history.',
    label: 'Issue history',
  },
)

const state = reactive({
  hasNextPage: false,
  items: [] as HistoryItemViewModel[],
  message: '',
  page: 0,
  pending: false,
  refreshing: false,
})

const load = async (replace = false) => {
  if (state.pending || state.refreshing) {
    return
  }

  const requestedPage = replace ? 0 : state.page
  state[replace ? 'refreshing' : 'pending'] = true
  state.message = ''
  const result = await props.deps.load({ issueKey: props.issueKey, page: requestedPage })
  state.pending = false
  state.refreshing = false

  if (result.status !== 'success') {
    if (!replace) {
      state.message = props.errorMessage
    }
    return
  }

  if (replace) {
    state.items = result.data.items
  } else {
    state.items.push(...result.data.items)
  }

  state.hasNextPage = result.data.hasNextPage
  state.page = requestedPage + 1
}

const refresh = () => load(true)

onMounted(load)
defineExpose({ refresh })
</script>

<style scoped>
.issue-history-state {
  display: grid;
  gap: var(--space-4);
}

.history-loading {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  font-size: var(--font-size-small);
  gap: var(--space-2);
  justify-self: start;
}

.history-loading svg {
  animation: var(--animation-spin);
  height: 14px;
  width: 14px;
}

.history-more {
  justify-self: start;
}
</style>
