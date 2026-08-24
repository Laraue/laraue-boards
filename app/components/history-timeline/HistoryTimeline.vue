<template>
  <section
    :aria-label="label"
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
            <NuxtLink
              v-if="item.link"
              :to="item.link.to">
              {{ item.link.label }}
            </NuxtLink>
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
      No changes yet.
    </p>
  </section>
</template>

<script setup lang="ts">
import HistoryAssigneeChange from './components/HistoryAssigneeChange.vue'
import HistoryAttachmentChange from './components/HistoryAttachmentChange.vue'
import HistoryBoardChange from './components/HistoryBoardChange.vue'
import HistoryDescriptionChange from './components/HistoryDescriptionChange.vue'
import HistoryEventChange from './components/HistoryEventChange.vue'
import HistoryPropertyChange from './components/HistoryPropertyChange.vue'
import HistorySpaceChange from './components/HistorySpaceChange.vue'
import HistoryStatusChange from './components/HistoryStatusChange.vue'
import type { HistoryItemViewModel } from './HistoryTimeline.types'

const props = withDefaults(
  defineProps<{
    items: HistoryItemViewModel[]
    label?: string
  }>(),
  { label: 'History' },
)

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
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
  props.items.reduce<HistoryItemViewModel[]>((result, item) => {
    const last = result.at(-1)

    if (
      last &&
      last.owner.name === item.owner.name &&
      last.issueKey === item.issueKey &&
      utc(last.createdAt).slice(0, 16) === utc(item.createdAt).slice(0, 16)
    ) {
      last.changes = [...last.changes, ...item.changes]

      return result
    }

    return [...result, { ...item, changes: [...item.changes] }]
  }, []),
)

const formatDate = (date: string) => dateTimeFormatter.format(new Date(date))

const formatTime = (date: string) =>
  utc(date).slice(0, 10) === new Date().toISOString().slice(0, 10)
    ? timeFormatter.format(new Date(date))
    : dateTimeFormatter.format(new Date(date))
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
