<template>
  <table class="permission-table">
    <thead>
      <tr>
        <th scope="col">Resource</th>
        <th
          v-for="column in PERMISSION_COLUMNS"
          :key="column"
          scope="col">
          {{ column }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="row in rows"
        :key="row.label">
        <th scope="row">{{ row.label }}</th>
        <td
          v-for="(cell, index) in row.cells"
          :key="PERMISSION_COLUMNS[index]">
          <span
            v-if="!cell"
            class="muted">
            —
          </span>
          <input
            v-else
            :aria-label="`${PERMISSION_COLUMNS[index]} ${row.label}${labelSuffix}`"
            :checked="cell.checked"
            :disabled="cell.disabled"
            :title="cell.title"
            type="checkbox"
            @change="onToggle(cell.key)" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts" generic="Key extends string">
import { PERMISSION_COLUMNS, type PermissionRow } from '../permissionTables'

withDefaults(
  defineProps<{
    labelSuffix?: string
    onToggle: (key: Key) => void
    rows: Array<PermissionRow<Key>>
  }>(),
  { labelSuffix: '' },
)
</script>

<style scoped>
.permission-table {
  border: 1px solid var(--color-border);
  border-collapse: separate;
  border-radius: var(--radius-control);
  border-spacing: 0;
  margin-top: var(--space-3);
  overflow: hidden;
  table-layout: fixed;
  width: 100%;
}

.permission-table th,
.permission-table td {
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-3);
}

.permission-table tr:last-child > * {
  border-bottom: 0;
}

.permission-table th {
  font-weight: var(--font-weight-semibold);
  text-align: left;
}

.permission-table thead th {
  background: var(--color-hover);
  color: var(--color-muted);
  font-size: var(--font-size-small);
}

.permission-table :is(th, td):not(:first-child) {
  text-align: center;
  width: 18%;
}

@media (max-width: 760px) {
  .permission-table th,
  .permission-table td {
    padding: var(--space-2);
  }
}
</style>
