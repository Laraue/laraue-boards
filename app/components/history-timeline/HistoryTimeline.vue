<template>
  <section
    :aria-label="label ?? t('history')"
    class="issue-history">
    <div
      v-if="groups.length"
      class="history-list">
      <section
        v-for="day in days"
        :key="day.key"
        class="history-day">
        <h3 class="history-day-label">
          {{ day.label }}
        </h3>
        <div class="history-day-items">
          <article
            v-for="(item, index) in day.items"
            :key="`${item.createdAt}-${index}`"
            class="history-item">
            <div class="history-content">
              <div
                v-if="item.link || isIssueDeleted(item)"
                class="history-head"
                :class="{ 'history-head--deleted': isIssueDeleted(item) }">
                <span class="history-issue">
                  <IconTrash
                    v-if="isIssueDeleted(item)"
                    :aria-label="t('issueDeleted')"
                    class="history-deleted-icon"
                    role="img" />
                  <NuxtLink
                    v-if="item.link"
                    class="history-issue-link"
                    :to="item.link.to">
                    <span class="history-issue-key">{{ item.link.label }}</span>
                    {{ ' ' }}
                    <span
                      v-if="item.issueTitle"
                      class="history-issue-title">
                      {{ item.issueTitle }}
                    </span>
                  </NuxtLink>
                </span>
              </div>
              <div
                v-if="item.changes.length"
                class="history-changes">
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
                  <HistoryTitleChange
                    v-else-if="change.kind === 'title'"
                    :change="change" />
                </div>
              </div>
            </div>
            <!-- Who, how and when, on the right, so they take no line of their own. -->
            <div class="history-aside">
              <span
                :aria-label="ownerHint(item.owner)"
                class="history-avatar"
                role="img"
                :title="ownerHint(item.owner)">
                <span
                  aria-hidden="true"
                  class="avatar"
                  :style="{ background: item.owner.color }">
                  {{ item.owner.initials }}
                </span>
                <span
                  v-if="item.owner.apiKeyName"
                  aria-hidden="true"
                  class="history-avatar-key">
                  <IconKey />
                </span>
              </span>
              <span class="history-owner">{{ item.owner.name }}</span>
              <span
                v-if="item.owner.apiKeyName"
                class="history-key">
                <IconKey />
                {{ t('viaKey', { key: item.owner.apiKeyName }) }}
              </span>
              <time
                class="history-time"
                :datetime="item.createdAt"
                :title="formatDateTime(item.createdAt)">
                {{ formatTime(item.createdAt) }}
              </time>
            </div>
          </article>
        </div>
      </section>
    </div>
    <p
      v-else
      class="history-empty">
      {{ t('empty') }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { IconKey, IconTrash } from '@tabler/icons-vue'

import HistoryAssigneeChange from './components/HistoryAssigneeChange.vue'
import HistoryAttachmentChange from './components/HistoryAttachmentChange.vue'
import HistoryBoardChange from './components/HistoryBoardChange.vue'
import HistoryDescriptionChange from './components/HistoryDescriptionChange.vue'
import HistoryEventChange from './components/HistoryEventChange.vue'
import HistoryPropertyChange from './components/HistoryPropertyChange.vue'
import HistorySpaceChange from './components/HistorySpaceChange.vue'
import HistoryStatusChange from './components/HistoryStatusChange.vue'
import HistoryTitleChange from './components/HistoryTitleChange.vue'
import type { HistoryItemViewModel } from './HistoryTimeline.types'

const props = defineProps<{
  items: HistoryItemViewModel[]
  label?: string
}>()

const { t } = useI18n({
  en: {
    empty: 'No changes yet.',
    history: 'History',
    issueDeleted: 'Issue deleted',
    today: 'Today',
    viaApiKey: '{name} via API key {key}',
    viaKey: 'via {key}',
    yesterday: 'Yesterday',
  },
  ru: {
    empty: 'Изменений пока нет.',
    history: 'История',
    issueDeleted: 'Задача удалена',
    today: 'Сегодня',
    viaApiKey: '{name} через API-ключ {key}',
    viaKey: 'через {key}',
    yesterday: 'Вчера',
  },
})

const { formatDate, formatDateTime, formatTime } = useFormatters()

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

// "Today" and "Yesterday" for the last two days, the date for older ones.
const dayLabel = (value: string): string => {
  const date = new Date(value)
  const sameDay = (other: Date) =>
    date.getFullYear() === other.getFullYear() &&
    date.getMonth() === other.getMonth() &&
    date.getDate() === other.getDate()
  const now = new Date()
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)

  if (sameDay(now)) {
    return t('today')
  }

  return sameDay(yesterday) ? t('yesterday') : formatDate(value)
}

// Entries are grouped by the day they were made on (in the viewer's time zone), newest day first.
const days = computed(() =>
  groups.value.reduce<{ items: HistoryItemViewModel[]; key: string; label: string }[]>(
    (result, item) => {
      const date = new Date(item.createdAt)
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      const last = result.at(-1)

      if (last?.key === key) {
        last.items.push(item)
        return result
      }

      return [...result, { items: [item], key, label: dayLabel(item.createdAt) }]
    },
    [],
  ),
)

// A deleted issue gets a trash icon and a struck-through title on top of its "Issue deleted" line.
const isIssueDeleted = (item: HistoryItemViewModel): boolean =>
  item.changes.some(
    (change) =>
      change.kind === 'event' && change.entityType === 'Issue' && change.action === 'Delete',
  )

// The author as a hint: "John Kevin", or "John Kevin via API key MCP" for a change made through a key.
const ownerHint = (owner: HistoryItemViewModel['owner']): string =>
  owner.apiKeyName ? t('viaApiKey', { key: owner.apiKeyName, name: owner.name }) : owner.name
</script>

<style scoped>
/* An activity feed, each save in a card tinted like the comments. */
.issue-history {
  display: grid;
  gap: var(--space-4);
}

.history-list {
  display: grid;
  gap: var(--space-5);
}

.history-day-label {
  color: var(--color-muted);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.04em;
  margin: 0 0 var(--space-2);
  text-transform: uppercase;
}

.history-day-items {
  display: grid;
  gap: var(--space-2);
}

/* One row: the changes, then who, how and when; no line of its own for the author. */
.history-item {
  align-items: start;
  background: var(--color-feed);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-card);
  display: grid;
  gap: var(--space-3);
  grid-template-columns: minmax(0, 1fr) auto;
  padding: var(--space-3) var(--space-4);
}

.history-owner {
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
}

.history-aside {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  font-size: var(--font-size-small);
  gap: var(--space-2);
  min-height: 20px;
}

/* Changed through an API key: its name, so a change by an agent is not taken for the person's. */
.history-key {
  align-items: center;
  display: inline-flex;
  gap: var(--space-1);
}

.history-key svg {
  height: 12px;
  width: 12px;
}

.history-time {
  white-space: nowrap;
}

.history-avatar {
  flex: none;
  height: 20px;
  position: relative;
  width: 20px;
}

.history-avatar > .avatar {
  font-size: 9px;
  height: 20px;
  width: 20px;
}

/* A change made through an API key: a small key on the avatar's corner. */
.history-avatar-key {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  bottom: -4px;
  color: var(--color-muted);
  display: grid;
  height: 12px;
  place-items: center;
  position: absolute;
  right: -4px;
  width: 12px;
}

.history-avatar-key .tabler-icon {
  height: 8px;
  width: 8px;
}

.history-content {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

.history-changes {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

/* The issue key and title as one link (on the organization's history, across issues). */
.history-head {
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

/* A deleted issue: a red trash icon, and the key and title struck through and muted. */
.history-head--deleted .history-issue {
  color: var(--color-muted);
  text-decoration: line-through;
}

/* The key and the title are one inline run, so the strike-through is a single unbroken line. */
.history-head--deleted .history-issue a {
  color: inherit;
  text-decoration: none;
}

.history-deleted-icon {
  color: var(--color-danger);
  height: 14px;
  margin-right: var(--space-1);
  vertical-align: -2px;
  width: 14px;
}

.history-issue {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
}

.history-issue-link {
  color: inherit;
  text-decoration: none;
}

.history-issue-link:hover {
  text-decoration: underline;
}

.history-issue-key {
  text-transform: uppercase;
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
  font-size: 8px;
  height: 16px;
  width: 16px;
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
