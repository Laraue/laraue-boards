<template>
  <section
    aria-label="Issue history"
    class="issue-history">
    <div
      v-if="groups.length"
      class="history-list">
      <article
        v-for="(item, index) in groups"
        :key="`${item.createdAt}-${index}`"
        class="history-item">
        <span
          class="avatar"
          :style="{ background: item.owner.color }">
          {{ item.owner.initials }}
        </span>
        <div class="history-content">
          <div class="history-head">
            <strong>{{ item.owner.name }}</strong>
            <time
              :datetime="item.createdAt"
              :title="formatDate(item.createdAt)">
              {{ formatTime(item.createdAt) }}
            </time>
          </div>
          <div class="history-changes">
            <div
              v-for="(change, changeIndex) in item.changes"
              :key="changeIndex"
              class="history-change"
              :class="{ 'history-change--description': change.kind === 'description' }">
              <IssueDescriptionDiff
                v-if="change.kind === 'description'"
                :diff="change.diff ?? []"
                :label="change.label" />
              <span v-else>{{ change.label }}{{ hasValues(change) ? ':' : '' }}</span>
              <div
                v-if="change.kind !== 'description' && hasValues(change)"
                class="history-values">
                <span
                  v-if="change.oldValue !== undefined"
                  :title="change.oldValue">
                  <BoardIcon
                    v-if="change.kind === 'board'"
                    :style="{ color: change.oldColor ?? undefined }" />
                  <SpaceIcon
                    v-else-if="change.kind === 'space'"
                    :style="{ color: change.oldColor ?? undefined }" />
                  <span
                    v-else-if="change.kind === 'assignee' && change.oldValue !== 'None'"
                    class="avatar"
                    :style="{ background: change.oldColor ?? 'var(--color-border)' }">
                    {{ initials(change.oldValue) }}
                  </span>
                  <i
                    v-else-if="change.oldColor"
                    :style="{ background: change.oldColor }" />
                  {{ change.oldValue }}
                </span>
                <ArrowRight v-if="change.oldValue !== undefined" />
                <span
                  v-if="change.newValue !== undefined"
                  class="history-new-value"
                  :title="change.newValue">
                  <BoardIcon
                    v-if="change.kind === 'board'"
                    :style="{ color: change.newColor ?? undefined }" />
                  <SpaceIcon
                    v-else-if="change.kind === 'space'"
                    :style="{ color: change.newColor ?? undefined }" />
                  <span
                    v-else-if="change.kind === 'assignee' && change.newValue !== 'None'"
                    class="avatar"
                    :style="{ background: change.newColor ?? 'var(--color-border)' }">
                    {{ initials(change.newValue) }}
                  </span>
                  <i
                    v-else-if="change.newColor"
                    :style="{ background: change.newColor }" />
                  {{ change.newValue }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
    <p
      v-else-if="!state.pending && !state.message"
      class="history-empty">
      No changes yet.
    </p>
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
  </section>
</template>

<script setup lang="ts">
import { ArrowRight, LoaderCircle } from '@lucide/vue'

import { BoardIcon, SpaceIcon } from '~/constants/icons'

import IssueDescriptionDiff from '../IssueDescription/components/IssueDescriptionDiff/IssueDescriptionDiff.vue'
import type { IssueHistoryDeps } from './IssueHistory.deps'
import type { IssueHistoryChangeViewModel, IssueHistoryItemViewModel } from './IssueHistory.types'

const props = defineProps<{ deps: IssueHistoryDeps; issueKey: string }>()

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})

const state = reactive({
  hasNextPage: false,
  items: [] as IssueHistoryItemViewModel[],
  message: '',
  page: 0,
  pending: false,
  refreshing: false,
})

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  timeStyle: 'short',
  timeZone: 'UTC',
})

const utc = (date: string) => new Date(date).toISOString()

// Entries written by one save land in the same minute — show them as a single event.
// ponytail: minute buckets also merge two separate saves a few seconds apart; group by a
// server-side save id if that ever matters.
const groups = computed(() =>
  state.items.reduce<IssueHistoryItemViewModel[]>((result, item) => {
    const last = result.at(-1)

    if (
      last &&
      last.owner.name === item.owner.name &&
      utc(last.createdAt).slice(0, 16) === utc(item.createdAt).slice(0, 16)
    ) {
      last.changes = [...last.changes, ...item.changes]

      return result
    }

    return [...result, { ...item, changes: [...item.changes] }]
  }, []),
)

const hasValues = (change: IssueHistoryChangeViewModel) =>
  change.oldValue !== undefined || change.newValue !== undefined

const formatDate = (date: string) => dateTimeFormatter.format(new Date(date))

const formatTime = (date: string) =>
  utc(date).slice(0, 10) === new Date().toISOString().slice(0, 10)
    ? timeFormatter.format(new Date(date))
    : dateTimeFormatter.format(new Date(date))

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

const load = async (replace = false) => {
  if (state.pending || state.refreshing) {
    return
  }

  const requestedPage = replace ? 0 : state.page
  if (replace) {
    state.refreshing = true
  } else {
    state.pending = true
  }

  state.message = ''
  const result = await props.deps.load({ issueKey: props.issueKey, page: requestedPage })
  state.pending = false
  state.refreshing = false

  if (result.status !== 'success') {
    if (!replace) {
      state.message = 'Could not load issue history.'
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
.issue-history {
  display: grid;
  gap: var(--space-4);
  padding-bottom: var(--space-1);
}

.history-list {
  display: grid;
}

.history-item {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: auto minmax(0, 1fr);
  padding-bottom: var(--space-5);
  position: relative;
}

.history-item:not(:last-child)::before {
  background: var(--color-border);
  bottom: 4px;
  content: '';
  left: 14px;
  position: absolute;
  top: 32px;
  width: 1px;
}

.history-item > .avatar {
  font-size: var(--font-size-caption);
  height: 28px;
  position: relative;
  width: 28px;
  z-index: 1;
}

.history-content {
  display: grid;
  gap: var(--space-2);
  min-width: 0;
}

.history-changes {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

.history-head {
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.history-head time {
  color: var(--color-muted);
  font-size: var(--font-size-small);
}

.history-change {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  gap: var(--space-2);
  min-width: 0;
}

.history-change--description {
  display: block;
}

.history-values {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  flex: 1;
  gap: var(--space-2);
  min-width: 0;
}

.history-values > span {
  align-items: center;
  display: flex;
  gap: var(--space-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-values i:not(.avatar) {
  border-radius: 50%;
  flex: 0 0 auto;
  height: 8px;
  width: 8px;
}

.history-values .avatar {
  font-size: 9px;
  height: 20px;
  width: 20px;
}

.history-new-value {
  color: var(--color-text);
}

.history-values svg,
.history-loading svg {
  flex: 0 0 auto;
  height: 14px;
  width: 14px;
}

.history-empty {
  color: var(--color-muted);
  margin: var(--space-5) 0;
  text-align: center;
}

.history-more {
  justify-self: start;
}

.history-loading {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  font-size: var(--font-size-small);
  gap: var(--space-2);
  justify-self: start;
}

.history-loading .spin {
  animation: var(--animation-spin);
}
</style>
