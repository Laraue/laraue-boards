<template>
  <QueryState
    :data="data"
    :error-title="t('loadError')"
    :loading-text="t('loading')"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: pageData }">
      <section class="transactions-section">
        <div class="section-heading">
          <h2>{{ admin ? t('organizationTransactions') : t('myTransactions') }}</h2>
          <p class="muted">{{ admin ? t('organizationDescription') : t('userDescription') }}</p>
        </div>

        <label
          v-if="admin"
          class="member-filter">
          {{ t('member') }}
          <select
            :value="userId"
            @change="applyMember(($event.target as HTMLSelectElement).value)">
            <option value="">{{ t('allMembers') }}</option>
            <option
              v-for="member in pageData.members"
              :key="member.id"
              :value="member.id">
              {{ member.name }}
            </option>
          </select>
        </label>

        <div
          v-if="pageData.transactions.length"
          class="transaction-table-wrap">
          <table class="transaction-table">
            <thead>
              <tr>
                <th>{{ t('date') }}</th>
                <th v-if="admin">{{ t('member') }}</th>
                <th>{{ t('reason') }}</th>
                <th>{{ t('status') }}</th>
                <th class="number-cell">{{ t('delta') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="transaction in pageData.transactions"
                :key="transaction.id">
                <td>
                  <time :datetime="transaction.createdAt">
                    {{ formatDateTime(transaction.createdAt) }}
                  </time>
                  <small
                    v-if="transaction.finishedAt"
                    class="transaction-finished muted">
                    {{ t('finishedAt') }}: {{ formatDateTime(transaction.finishedAt) }}
                  </small>
                  <small
                    v-if="transaction.error"
                    class="transaction-error">
                    {{ transaction.error }}
                  </small>
                </td>
                <td v-if="admin">{{ transaction.ownerName }}</td>
                <td>{{ reasonLabel(transaction.reason) }}</td>
                <td>
                  <span
                    class="status-pill"
                    :class="`status-${transaction.status.toLowerCase()}`">
                    {{ statusLabel(transaction.status) }}
                  </span>
                </td>
                <td
                  class="number-cell"
                  :class="{
                    negative: transaction.delta < 0,
                    positive: transaction.delta > 0,
                  }">
                  {{ formatDelta(transaction.delta) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <AppEmptyState
          v-else
          :hint="t('emptyHint')"
          :title="t('empty')" />

        <PaginationControl
          :has-next-page="pageData.hasNextPage"
          :page="page"
          @update:page="updatePage" />
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import type { BillingTransactionsPageDeps } from './BillingTransactionsPage.deps'
import type {
  BillingTransactionReason,
  BillingTransactionStatus,
} from './BillingTransactionsPage.types'

const props = defineProps<{
  admin: boolean
  deps: BillingTransactionsPageDeps
}>()

const { t } = useI18n({
  en: {
    allMembers: 'All members',
    date: 'Date',
    delta: 'Token change',
    empty: 'No transactions yet',
    emptyHint: 'Token grants and spending will appear here.',
    finishedAt: 'Finished',
    loadError: 'Could not load transactions',
    loading: 'Loading transactions…',
    member: 'Member',
    myTransactions: 'My transactions',
    organizationDescription: 'Review token activity across the organization.',
    organizationTransactions: 'Organization transactions',
    reason: 'Reason',
    reasonDailyGrant: 'Daily grant',
    reasonExpiry: 'Expiry',
    reasonPurchase: 'Purchase',
    reasonSpend: 'Spend',
    reasonTariffGrant: 'Plan grant',
    status: 'Status',
    statusCanceled: 'Canceled',
    statusConfirmed: 'Confirmed',
    statusStarted: 'Started',
    userDescription: 'Review your token activity.',
  },
  ru: {
    allMembers: 'Все участники',
    date: 'Дата',
    delta: 'Изменение токенов',
    empty: 'Операций пока нет',
    emptyHint: 'Здесь появятся начисления и списания токенов.',
    finishedAt: 'Завершена',
    loadError: 'Не удалось загрузить операции',
    loading: 'Загрузка операций…',
    member: 'Участник',
    myTransactions: 'Мои операции',
    organizationDescription: 'История операций с токенами всей организации.',
    organizationTransactions: 'Операции организации',
    reason: 'Причина',
    reasonDailyGrant: 'Ежедневное начисление',
    reasonExpiry: 'Истечение срока',
    reasonPurchase: 'Покупка',
    reasonSpend: 'Списание',
    reasonTariffGrant: 'Начисление по тарифу',
    status: 'Статус',
    statusCanceled: 'Отменена',
    statusConfirmed: 'Подтверждена',
    statusStarted: 'Начата',
    userDescription: 'История ваших операций с токенами.',
  },
})

const page = ref(1)
const userId = ref('')

const { formatDateTime, formatNumber } = useFormatters()
const { data, message, pending, refresh } = await useQuery(
  () => (props.admin ? 'billing-admin-transactions' : 'billing-transactions'),
  (_nuxtApp, { signal }) =>
    props.deps.view({ page: page.value, signal, userId: userId.value || undefined }),
  { watch: [page, userId] },
)

const reasonLabel = (reason: BillingTransactionReason) => {
  const labels: Record<BillingTransactionReason, string> = {
    DailyGrant: t('reasonDailyGrant'),
    Expiry: t('reasonExpiry'),
    Purchase: t('reasonPurchase'),
    Spend: t('reasonSpend'),
    TariffGrant: t('reasonTariffGrant'),
  }
  return labels[reason]
}

const statusLabel = (status: BillingTransactionStatus) => {
  const labels: Record<BillingTransactionStatus, string> = {
    Canceled: t('statusCanceled'),
    Confirmed: t('statusConfirmed'),
    Started: t('statusStarted'),
  }
  return labels[status]
}

const formatDelta = (delta: number) => `${delta > 0 ? '+' : ''}${formatNumber(delta)}`

const applyMember = (value: string) => {
  userId.value = value
  page.value = 1
}

const updatePage = (value: number) => (page.value = value)
</script>

<style scoped>
.transactions-section {
  align-content: start;
  display: grid;
  gap: var(--space-5);
}

.section-heading {
  display: grid;
  gap: var(--space-1);
}

.section-heading h2,
.section-heading p {
  margin: 0;
}

.member-filter {
  display: grid;
  gap: var(--space-1);
  max-width: 320px;
}

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
