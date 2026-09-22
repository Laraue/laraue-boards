<template>
  <div class="transaction-table-wrap">
    <table class="transaction-table">
      <thead>
        <tr>
          <th>{{ labels.date }}</th>
          <th v-if="showOwner">{{ labels.member }}</th>
          <th>{{ labels.reason }}</th>
          <th>{{ labels.status }}</th>
          <th class="number-cell">{{ labels.delta }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="transaction in rows"
          :key="transaction.id">
          <td>
            <time :datetime="transaction.createdAt">
              {{ transaction.createdAtLabel }}
            </time>
            <small
              v-if="transaction.finishedAt"
              class="transaction-finished muted">
              {{ labels.finishedAt }}: {{ transaction.finishedAtLabel }}
            </small>
            <small
              v-if="transaction.error"
              class="transaction-error">
              {{ transaction.error }}
            </small>
          </td>
          <td v-if="showOwner">{{ transaction.ownerName }}</td>
          <td>{{ transaction.reason }}</td>
          <td>
            <span
              class="status-pill"
              :class="`status-${transaction.statusClass}`">
              {{ transaction.status }}
            </span>
          </td>
          <td
            class="number-cell"
            :class="{
              negative: transaction.delta < 0,
              positive: transaction.delta > 0,
            }">
            {{ transaction.deltaLabel }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { TransactionsTableLabels, TransactionsTableRow } from './TransactionsTable.types'

defineProps<{
  labels: TransactionsTableLabels
  rows: TransactionsTableRow[]
  showOwner?: boolean
}>()
</script>

<style scoped>
.transaction-table-wrap {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  overflow-x: auto;
}

.transaction-table {
  border-collapse: collapse;
  min-width: 680px;
  width: 100%;
}

.transaction-table th,
.transaction-table td {
  border-bottom: 1px solid var(--color-divider);
  padding: var(--space-3) var(--space-4);
  text-align: left;
  vertical-align: top;
}

.transaction-table th {
  color: var(--color-muted);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.transaction-table tbody tr:last-child td {
  border-bottom: 0;
}

.transaction-table time,
.transaction-finished,
.transaction-error {
  display: block;
}

.transaction-error {
  color: var(--color-danger);
  font-size: var(--font-size-caption);
  margin-top: var(--space-1);
}

.number-cell {
  text-align: right !important;
  white-space: nowrap;
}

.positive {
  color: var(--color-success);
}

.negative {
  color: var(--color-danger);
}

.status-pill {
  background: var(--color-soft);
  border-radius: var(--radius-pill);
  display: inline-block;
  font-size: var(--font-size-caption);
  padding: 2px 8px;
  white-space: nowrap;
}

.status-confirmed {
  background: color-mix(in srgb, var(--color-success) 14%, transparent);
  color: var(--color-success);
}

.status-canceled {
  background: color-mix(in srgb, var(--color-danger) 14%, transparent);
  color: var(--color-danger);
}
</style>
