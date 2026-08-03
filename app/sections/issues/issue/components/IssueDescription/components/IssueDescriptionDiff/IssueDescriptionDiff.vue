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
      <ChevronDown />
    </summary>
    <div class="description-diff-body">
      <div
        aria-label="Description changes split view"
        class="diff-split">
        <div class="diff-split-head">
          <span>Before</span>
          <span>After</span>
        </div>
        <div
          v-for="(row, rowIndex) in splitRows"
          :key="rowIndex"
          class="diff-split-row">
          <div
            v-if="row.separator"
            class="diff-split-separator">
            @@ unchanged lines
          </div>
          <template v-else>
            <div
              class="diff-split-side"
              :class="{ 'diff-line--removed': row.oldLine }">
              <span class="diff-number">{{ row.oldLine?.oldLine }}</span>
              <span class="diff-marker">{{ row.oldLine ? '−' : '' }}</span>
              <IssueDiffText :line="row.oldLine" />
            </div>
            <div
              class="diff-split-side"
              :class="{ 'diff-line--added': row.newLine }">
              <span class="diff-number">{{ row.newLine?.newLine }}</span>
              <span class="diff-marker">{{ row.newLine ? '+' : '' }}</span>
              <IssueDiffText :line="row.newLine" />
            </div>
          </template>
        </div>
      </div>
    </div>
  </details>
</template>

<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'

import IssueDiffText from './components/IssueDiffText.vue'
import type { IssueDescriptionDiffLine } from './IssueDescriptionDiff.types'

const props = defineProps<{ diff: IssueDescriptionDiffLine[]; label: string }>()

const stats = computed(() => ({
  added: props.diff.filter((line) => line.kind === 'added').length,
  removed: props.diff.filter((line) => line.kind === 'removed').length,
}))

const splitRows = computed(() => {
  const rows: Array<{
    newLine?: IssueDescriptionDiffLine
    oldLine?: IssueDescriptionDiffLine
    separator?: true
  }> = []
  let added: IssueDescriptionDiffLine[] = []
  let removed: IssueDescriptionDiffLine[] = []

  const flush = () => {
    for (let index = 0; index < Math.max(added.length, removed.length); index++) {
      rows.push({ newLine: added[index], oldLine: removed[index] })
    }

    added = []
    removed = []
  }

  for (const line of props.diff) {
    if (line.kind === 'separator') {
      flush()
      rows.push({ separator: true })
    } else if (line.kind === 'added') {
      added.push(line)
    } else {
      removed.push(line)
    }
  }

  flush()

  return rows
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
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  margin-top: var(--space-2);
  max-height: 320px;
  overflow-x: hidden;
  overflow-y: auto;
}

.diff-split {
  font-family: monospace;
  font-size: var(--font-size-small);
}

.diff-split-head,
.diff-split-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.diff-split-head {
  background: var(--color-soft);
  color: var(--color-muted);
  font-family: inherit;
  font-weight: var(--font-weight-semibold);
  position: sticky;
  top: 0;
  z-index: 1;
}

.diff-split-head > span {
  padding: var(--space-1) var(--space-2);
}

.diff-split-head > span:first-child {
  box-shadow: inset 3px 0 var(--color-danger);
}

.diff-split-head > span:last-child {
  box-shadow: inset 3px 0 var(--color-success);
}

.diff-split-head > span + span,
.diff-split-side + .diff-split-side {
  border-left: 1px solid var(--color-border);
}

.diff-split-separator {
  background: var(--color-accent-soft);
  color: var(--color-muted);
  grid-column: 1 / -1;
  padding: var(--space-1) var(--space-2);
}

.diff-split-side {
  display: grid;
  grid-template-columns: 4ch 3ch minmax(0, 1fr);
  min-width: 0;
}

.diff-line--removed {
  background: color-mix(in srgb, var(--color-danger) 10%, var(--color-surface));
  box-shadow: inset 3px 0 var(--color-danger);
}

.diff-line--added {
  background: color-mix(in srgb, var(--color-success) 10%, var(--color-surface));
  box-shadow: inset 3px 0 var(--color-success);
}

.diff-number,
.diff-marker {
  align-content: start;
  color: var(--color-muted);
  padding: 0 var(--space-1);
  text-align: right;
  user-select: none;
}

.diff-number {
  background: color-mix(in srgb, var(--color-soft) 55%, transparent);
}

.diff-marker {
  font-weight: var(--font-weight-semibold);
  text-align: center;
}

.diff-line--removed > .diff-marker {
  color: var(--color-danger);
}

.diff-line--added > .diff-marker {
  color: var(--color-success);
}
</style>
