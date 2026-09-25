<template>
  <section
    :aria-label="label ?? t('history')"
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
            <span
              v-if="item.owner.apiKeyName"
              class="history-api-key"
              :title="t('madeWithApiKey', { name: item.owner.apiKeyName })">
              <KeyRound aria-hidden="true" />
              {{ t('viaApiKey', { name: item.owner.apiKeyName }) }}
            </span>
            <NuxtLink
              v-if="item.link"
              :to="item.link.to">
              {{ item.link.label }}
            </NuxtLink>
            <time
              :datetime="item.createdAt"
              :title="formatDateTime(item.createdAt)">
              {{ formatHistoryTime(item.createdAt) }}
            </time>
          </div>
          <div class="history-changes">
            <div
              v-for="(change, changeIndex) in item.changes"
              :key="changeIndex"
              class="history-change"
              :class="{ 'history-change--description': change.kind === 'description' }">
              <HistoryDescriptionChange
                v-if="change.kind === 'description'"
                :change="change" />
              <HistoryEventChange
                v-else-if="change.kind === 'event'"
                :change="change" />
              <HistoryAttachmentChange
                v-else-if="change.kind === 'attachment'"
                :change="change" />
              <HistoryAssigneeChange
                v-else-if="change.kind === 'assignee'"
                :change="change" />
              <HistoryBoardChange
                v-else-if="change.kind === 'board'"
                :change="change" />
              <HistoryPropertyChange
                v-else-if="change.kind === 'property'"
                :change="change" />
              <HistorySpaceChange
                v-else-if="change.kind === 'space'"
                :change="change" />
              <HistoryStatusChange
                v-else-if="change.kind === 'status'"
                :change="change" />
            </div>
          </div>
        </div>
      </article>
    </div>
    <p
      v-else
      class="history-empty">
      {{ t('empty') }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { KeyRound } from '@lucide/vue'

import HistoryAssigneeChange from './components/HistoryAssigneeChange.vue'
import HistoryAttachmentChange from './components/HistoryAttachmentChange.vue'
import HistoryBoardChange from './components/HistoryBoardChange.vue'
import HistoryDescriptionChange from './components/HistoryDescriptionChange.vue'
import HistoryEventChange from './components/HistoryEventChange.vue'
import HistoryPropertyChange from './components/HistoryPropertyChange.vue'
import HistorySpaceChange from './components/HistorySpaceChange.vue'
import HistoryStatusChange from './components/HistoryStatusChange.vue'
import type { HistoryItemViewModel } from './HistoryTimeline.types'

const props = defineProps<{
  items: HistoryItemViewModel[]
  label?: string
}>()

const { t } = useI18n({
  en: {
    empty: 'No changes yet.',
    history: 'History',
    madeWithApiKey: 'Made through the API key “{name}”',
    viaApiKey: 'via API key {name}',
  },
  ru: {
    empty: 'Изменений пока нет.',
    history: 'История',
    madeWithApiKey: 'Изменено через API-ключ «{name}»',
    viaApiKey: 'через API-ключ {name}',
  },
})

const { formatDateTime, formatTime } = useFormatters()

const utc = (date: string) => new Date(date).toISOString()
const isToday = (date: string) => {
  const value = new Date(date)
  const now = new Date()

  return (
    value.getFullYear() === now.getFullYear() &&
    value.getMonth() === now.getMonth() &&
    value.getDate() === now.getDate()
  )
}

// Entries written by one save land in the same minute — show them as a single event.
// ponytail: minute buckets also merge two separate saves a few seconds apart; group by a
// server-side save id if that ever matters.
const groups = computed(() =>
  props.items.reduce<HistoryItemViewModel[]>((result, item) => {
    const last = result.at(-1)

    if (
      last &&
      last.owner.name === item.owner.name &&
      last.owner.apiKeyName === item.owner.apiKeyName &&
      last.issueKey === item.issueKey &&
      utc(last.createdAt).slice(0, 16) === utc(item.createdAt).slice(0, 16)
    ) {
      last.changes = [...last.changes, ...item.changes]

      return result
    }

    return [...result, { ...item, changes: [...item.changes] }]
  }, []),
)

const formatHistoryTime = (date: string) =>
  isToday(date) ? formatTime(date) : formatDateTime(date)
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

.history-api-key {
  align-items: center;
  align-self: center;
  background: var(--color-soft);
  border-radius: var(--radius-control);
  color: var(--color-muted);
  display: inline-flex;
  font-size: var(--font-size-small);
  gap: var(--space-1);
  padding: 0 var(--space-2);
}

.history-api-key .lucide {
  height: 12px;
  width: 12px;
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

:deep(.history-value-change) {
  align-items: center;
  display: flex;
  flex: 1;
  gap: var(--space-2);
  min-width: 0;
}

:deep(.history-value-change > span) {
  align-items: center;
  display: flex;
  gap: var(--space-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.history-value-change svg) {
  flex: 0 0 auto;
  height: 14px;
  width: 14px;
}

:deep(.history-value-change i) {
  border-radius: 50%;
  flex: 0 0 auto;
  height: 8px;
  width: 8px;
}

:deep(.history-value-change .avatar) {
  font-size: 9px;
  height: 20px;
  width: 20px;
}

:deep(.history-new-value) {
  color: var(--color-text);
}

.history-empty {
  color: var(--color-muted);
  margin: var(--space-5) 0;
  text-align: center;
}
</style>
