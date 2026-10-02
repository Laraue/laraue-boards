<template>
  <div class="issue-history-state">
    <HistoryTimeline
      v-if="state.items.length || !pending"
      :items="state.items"
      :label="label ?? t('label')" />
    <div
      v-if="pending"
      class="history-loading"
      role="status">
      <LoaderCircle class="spin" />
      <span>{{ t('loading') }}</span>
    </div>
    <button
      v-else-if="state.failed || state.hasNextPage"
      class="secondary small history-more"
      type="button"
      @click="load()">
      {{ state.failed ? t('tryAgain') : t('loadMore') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { LoaderCircle } from '@lucide/vue'

import type { HistoryItemViewModel } from '~/components/history-timeline/HistoryTimeline.types'
import HistoryTimeline from '~/components/history-timeline/HistoryTimeline.vue'

import type { IssueHistoryDeps } from './IssueHistory.deps'

const props = defineProps<{
  deps: IssueHistoryDeps
  issueKey: string
  label?: string
}>()

const { t } = useI18n({
  en: {
    label: 'Issue history',
    loading: 'Loading history…',
    loadMore: 'Load more',
    tryAgain: 'Try again',
  },
  ru: {
    label: 'История задачи',
    loading: 'Загрузка истории…',
    loadMore: 'Загрузить ещё',
    tryAgain: 'Повторить попытку',
  },
})

const state = reactive({
  failed: false,
  hasNextPage: false,
  items: [] as HistoryItemViewModel[],
  page: 0,
})

const { execute: loadPage, pending } = useApiAction(props.deps.load)

// `replace` reloads from the first page, e.g. after the issue was saved.
const load = async (replace = false) => {
  if (pending.value) {
    return
  }
  const requestedPage = replace ? 0 : state.page
  const loaded = await loadPage({ issueKey: props.issueKey, page: requestedPage })
  state.failed = !loaded
  if (!loaded) {
    return
  }
  state.items = replace ? loaded.value.items : [...state.items, ...loaded.value.items]
  state.hasNextPage = loaded.value.hasNextPage
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
