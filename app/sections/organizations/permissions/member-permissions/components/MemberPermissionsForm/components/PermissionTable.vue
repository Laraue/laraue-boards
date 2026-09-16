<template>
  <table class="permission-table">
    <thead>
      <tr>
        <th scope="col">{{ t('resource') }}</th>
        <th
          v-for="column in PERMISSION_COLUMNS"
          :key="column"
          scope="col">
          {{ t(column.toLowerCase() as PermissionColumnKey) }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="row in rows"
        :key="row.label">
        <th scope="row">{{ t(row.label) }}</th>
        <td
          v-for="(cell, index) in row.cells"
          :key="PERMISSION_COLUMNS[index]!">
          <span
            v-if="!cell"
            class="muted">
            —
          </span>
          <input
            v-else
            :aria-label="`${t(PERMISSION_COLUMNS[index]!.toLowerCase() as PermissionColumnKey)} ${t(row.label)}${labelSuffix}`"
            :checked="cell.checked"
            :disabled="cell.disabled"
            :title="
              cell.title === 'Inherited' ? t('inherited') : cell.title ? t('notAllowed') : undefined
            "
            type="checkbox"
            @change="onToggle(cell.key)" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts" generic="Key extends string">
import { PERMISSION_COLUMNS, type PermissionRow } from '../permissionTables'

type PermissionColumnKey = 'create' | 'delete' | 'update'

withDefaults(
  defineProps<{
    labelSuffix?: string
    onToggle: (key: Key) => void
    rows: Array<PermissionRow<Key>>
  }>(),
  { labelSuffix: '' },
)

const { t } = useI18n({
  en: {
    boards: 'Boards',
    create: 'Create',
    delete: 'Delete',
    inherited: 'Inherited',
    issues: 'Issues',
    notAllowed: 'Not allowed',
    resource: 'Resource',
    spaces: 'Spaces',
    update: 'Update',
  },
  ru: {
    boards: 'Доски',
    create: 'Создание',
    delete: 'Удаление',
    inherited: 'Унаследовано',
    issues: 'Задачи',
    notAllowed: 'Недоступно',
    resource: 'Ресурс',
    spaces: 'Разделы',
    update: 'Изменение',
  },
})
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

@media (max-width: 767px) {
  .permission-table th,
  .permission-table td {
    padding: var(--space-2);
  }
}
</style>
