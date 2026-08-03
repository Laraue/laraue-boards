<template>
  <code
    :class="{
      'diff-text--added': line?.kind === 'added',
      'diff-text--removed': line?.kind === 'removed',
    }">
    <template v-if="line?.spans">
      <span
        v-for="(span, index) in line.spans"
        :key="index"
        :class="{ 'diff-span--changed': span.changed }">
        {{ span.text }}
      </span>
    </template>
    <template v-else>{{ line ? line.text || ' ' : '' }}</template>
  </code>
</template>

<script setup lang="ts">
import type { IssueDescriptionDiffLine } from '../IssueDescriptionDiff.types'

defineProps<{ line?: IssueDescriptionDiffLine }>()
</script>

<style scoped>
code {
  border-left: 1px solid color-mix(in srgb, var(--color-border) 70%, transparent);
  font: inherit;
  min-width: 0;
  overflow-wrap: anywhere;
  padding: 0 var(--space-2);
  white-space: pre-wrap;
}

.diff-text--removed .diff-span--changed {
  background: color-mix(in srgb, var(--color-danger) 22%, transparent);
  border-radius: 2px;
  box-decoration-break: clone;
  color: var(--color-danger);
  padding: 0 2px;
}

.diff-text--added .diff-span--changed {
  background: color-mix(in srgb, var(--color-success) 22%, transparent);
  border-radius: 2px;
  box-decoration-break: clone;
  color: var(--color-success);
  padding: 0 2px;
}
</style>
