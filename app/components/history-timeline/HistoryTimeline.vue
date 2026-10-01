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
            <div class="history-rail">
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
                  <KeyRound />
                </span>
              </span>
              <time
                class="history-time"
                :datetime="item.createdAt"
                :title="formatDateTime(item.createdAt)">
                {{ formatTime(item.createdAt) }}
              </time>
            </div>
            <div class="history-content">
              <div
                v-if="item.link || isIssueDeleted(item)"
                class="history-head"
                :class="{ 'history-head--deleted': isIssueDeleted(item) }">
                <span class="history-issue">
                  <Trash2
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
import { KeyRound, Trash2 } from '@lucide/vue'

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
    yesterday: 'Yesterday',
  },
  ru: {
    empty: 'Изменений пока нет.',
    history: 'История',
    issueDeleted: 'Задача удалена',
    today: 'Сегодня',
    viaApiKey: '{name} через API-ключ {key}',
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
.issue-history {
  display: grid;
  gap: var(--space-4);
  padding-bottom: var(--space-1);
}

.history-list {
  display: grid;
  gap: var(--space-2);
}

.history-day-items {
  display: grid;
  gap: var(--space-3);
}

/* "YESTERDAY": the day's label in the app's section-label look, left-aligned over the avatars. */
.history-day + .history-day {
  margin-top: var(--space-5);
}

.history-day-label {
  color: var(--color-muted);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.04em;
  margin: 0 0 var(--space-3);
  text-transform: uppercase;
}

/* Every entry is a card, like the other cards in the app. */
.history-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  display: grid;
  gap: var(--space-3);
  grid-template-columns: 56px minmax(0, 1fr);
  padding: var(--space-4);
  position: relative;
}

/* The avatar with the time of the change under it, centered in a fixed-width column. */
.history-rail {
  align-content: start;
  display: grid;
  gap: var(--space-1);
  justify-items: center;
  position: relative;
  z-index: 1;
}

.history-time {
  color: var(--color-muted);
  font-size: var(--font-size-caption);
  white-space: nowrap;
}

.history-avatar {
  height: 28px;
  position: relative;
  width: 28px;
}

.history-avatar > .avatar {
  font-size: var(--font-size-caption);
  height: 28px;
  width: 28px;
}

/* A change made through an API key: a small key on the avatar's corner. */
.history-avatar-key {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  bottom: -4px;
  color: var(--color-muted);
  display: grid;
  height: 15px;
  place-items: center;
  position: absolute;
  right: -4px;
  width: 15px;
}

.history-avatar-key .lucide {
  height: 9px;
  width: 9px;
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

/* The issue key and title as one link. The author is the avatar, with a key on it for an API key. */
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

/* Inline with the title, so it sits on the same text line. */
.history-deleted-icon {
  color: var(--color-danger);
  height: 16px;
  margin-right: var(--space-2);
  vertical-align: -3px;
  width: 16px;
}

/* The issue key and the title share one size, weight and color; only the key is uppercase. Both are the link. */
.history-issue {
  font-size: calc(var(--font-size-body) * 1.1);
  font-weight: var(--font-weight-medium);
}

/* The key and the title are one link to the issue, in the text color. */
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
