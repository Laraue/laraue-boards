<template>
  <details class="description-diff">
    <summary>
      <span>{{ label }}</span>
      <span
        v-if="stats.added"
        class="description-diff-added">
        +{{ stats.added }}
      </span>
      <span
        v-if="stats.removed"
        class="description-diff-removed">
        −{{ stats.removed }}
      </span>
      <IconChevronDown />
    </summary>
    <!-- One column, as text is read: a line changed in place shows its words struck out and added. -->
    <div
      :aria-label="t('changes')"
      class="description-diff-body">
      <template
        v-for="(row, rowIndex) in rows"
        :key="rowIndex">
        <div
          v-if="row.kind === 'separator'"
          class="diff-separator">
          {{ t('unchangedLines') }}
        </div>
        <p
          v-else
          class="diff-line"
          :class="`diff-line--${row.kind}`">
          <template
            v-for="(part, partIndex) in row.parts"
            :key="partIndex">
            <del v-if="part.kind === 'removed'">{{ part.text }}</del>
            <ins v-else-if="part.kind === 'added'">{{ part.text }}</ins>
            <template v-else>{{ part.text }}</template>
          </template>
        </p>
      </template>
    </div>
  </details>
</template>

<script setup lang="ts">
import { IconChevronDown } from '@tabler/icons-vue'
import { diffWordsWithSpace } from 'diff'

import type { IssueDescriptionDiffLine } from './IssueDescriptionDiff.types'

const props = defineProps<{ diff: IssueDescriptionDiffLine[]; label: string }>()

const { t } = useI18n({
  en: {
    changes: 'Description changes',
    unchangedLines: '··· unchanged lines',
  },
  ru: {
    changes: 'Изменения описания',
    unchangedLines: '··· строки без изменений',
  },
})

type Part = { kind: 'added' | 'removed' | 'same'; text: string }
type Row = { kind: 'added' | 'changed' | 'removed'; parts: Part[] } | { kind: 'separator' }

const stats = computed(() => ({
  added: props.diff.filter((line) => line.kind === 'added').length,
  removed: props.diff.filter((line) => line.kind === 'removed').length,
}))

const wholeLine = (line: IssueDescriptionDiffLine): Row => ({
  kind: line.kind === 'added' ? 'added' : 'removed',
  parts: [{ kind: line.kind === 'added' ? 'added' : 'removed', text: line.text || ' ' }],
})

// A removed line and the added one in its place become one line with the changed words marked;
// the lines left over stay whole.
const rows = computed(() => {
  const result: Row[] = []
  let added: IssueDescriptionDiffLine[] = []
  let removed: IssueDescriptionDiffLine[] = []

  const flush = () => {
    const paired = Math.min(added.length, removed.length)
    for (let index = 0; index < paired; index++) {
      result.push({
        kind: 'changed',
        parts: diffWordsWithSpace(removed[index]!.text, added[index]!.text).map((change) => ({
          kind: change.added ? 'added' : change.removed ? 'removed' : 'same',
          text: change.value,
        })),
      })
    }
    result.push(...removed.slice(paired).map(wholeLine), ...added.slice(paired).map(wholeLine))
    added = []
    removed = []
  }

  for (const line of props.diff) {
    if (line.kind === 'separator') {
      flush()
      result.push({ kind: 'separator' })
    } else if (line.kind === 'added') {
      added.push(line)
    } else {
      removed.push(line)
    }
  }
  flush()

  return result
})
</script>

<style scoped>
.description-diff {
  min-width: 0;
}

.description-diff summary {
  align-items: center;
  color: var(--color-muted);
  cursor: pointer;
  display: flex;
  gap: var(--space-2);
  list-style: none;
  width: fit-content;
}

.description-diff summary:hover {
  color: var(--color-text);
}

.description-diff-added {
  color: var(--color-success);
}

.description-diff-removed {
  color: var(--color-danger);
}

.description-diff summary::-webkit-details-marker {
  display: none;
}

.description-diff summary::marker {
  content: '';
}

.description-diff summary svg {
  height: 16px;
  transition: rotate var(--duration-fast) var(--ease-standard);
  width: 16px;
}

.description-diff[open] summary svg {
  rotate: 180deg;
}

.description-diff-body {
  background: var(--color-surface);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-control);
  display: grid;
  margin-top: var(--space-2);
  max-height: 320px;
  overflow-y: auto;
  padding: var(--space-1) 0;
}

/* The text as written, a line each; a bar on the left tells a whole line added or removed. */
.diff-line {
  color: var(--color-text);
  /* Whole pixels, so the tinted lines meet without hairline seams. */
  line-height: var(--space-5);
  margin: 0;
  overflow-wrap: anywhere;
  padding: 0 var(--space-3);
  white-space: pre-wrap;
}

.diff-line--added {
  background: color-mix(in srgb, var(--color-success) 8%, transparent);
  box-shadow: inset 2px 0 var(--color-success);
}

.diff-line--removed {
  background: color-mix(in srgb, var(--color-danger) 8%, transparent);
  box-shadow: inset 2px 0 var(--color-danger);
}

/* Not by color alone: removed is struck out, added is underlined. */
.diff-line del {
  background: color-mix(in srgb, var(--color-danger) 16%, transparent);
  color: var(--color-danger);
  text-decoration: line-through;
}

.diff-line ins {
  background: color-mix(in srgb, var(--color-success) 16%, transparent);
  color: var(--color-success);
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* A whole line is already marked by its bar: added reads as plain text, removed stays struck out. */
.diff-line--added ins {
  background: none;
  color: inherit;
  text-decoration: none;
}

.diff-line--removed del {
  background: none;
  color: var(--color-muted);
}

.diff-separator {
  color: var(--color-muted);
  font-size: var(--font-size-small);
  padding: var(--space-1) var(--space-3);
}
</style>
