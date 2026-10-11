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
        <BaseSectionHeader :title="t('transactions')">
          <!-- The filter sits with the heading, like a section's actions. -->
          <template #actions>
            <select
              :aria-label="t('member')"
              class="member-filter"
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
          </template>
        </BaseSectionHeader>

        <TransactionsTable
          v-if="pageData.transactions.length"
          :labels="tableLabels"
          :rows="toTableRows(pageData.transactions)"
          :show-owner="true" />
        <BaseEmptyState
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
import type {
  OrganizationTransactionsPageDeps,
  TransactionReason,
  TransactionStatus,
  TransactionViewModel,
} from './OrganizationTransactionsPage.deps'

const props = defineProps<{ deps: OrganizationTransactionsPageDeps }>()

const { t } = useI18n({
  en: {
    allMembers: 'All members',
    date: 'Date',
    delta: 'Token change',
    empty: 'No transactions yet',
    emptyHint: 'Token grants and spending will appear here.',
    loadError: 'Could not load transactions',
    loading: 'Loading transactions…',
    member: 'Member',
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
    transactions: 'Transactions',
  },
  ru: {
    allMembers: 'Все участники',
    date: 'Дата',
    delta: 'Изменение токенов',
    empty: 'Операций пока нет',
    emptyHint: 'Здесь появятся начисления и списания токенов.',
    loadError: 'Не удалось загрузить операции',
    loading: 'Загрузка операций…',
    member: 'Участник',
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
    transactions: 'Транзакции',
  },
})

const page = ref(1)
const userId = ref('')
const { formatDateTime, formatNumber } = useFormatters()
const { data, message, pending, refresh } = await useApiQuery(
  () => `billing-admin-transactions:${page.value}:${userId.value}`,
  (signal) => props.deps.view({ page: page.value, signal, userId: userId.value || undefined }),
)

const tableLabels = computed(() => ({
  date: t('date'),
  delta: t('delta'),
  member: t('member'),
  reason: t('reason'),
  status: t('status'),
}))

const reasonLabel = (reason: TransactionReason) => {
  const labels: Record<TransactionReason, string> = {
    DailyGrant: t('reasonDailyGrant'),
    Expiry: t('reasonExpiry'),
    Purchase: t('reasonPurchase'),
    Spend: t('reasonSpend'),
    TariffGrant: t('reasonTariffGrant'),
  }
  return labels[reason]
}

const statusLabel = (status: TransactionStatus) => {
  const labels: Record<TransactionStatus, string> = {
    Canceled: t('statusCanceled'),
    Confirmed: t('statusConfirmed'),
    Started: t('statusStarted'),
  }
  return labels[status]
}

const toTableRows = (transactions: TransactionViewModel[]) =>
  transactions.map((transaction) => ({
    createdAt: transaction.createdAt,
    createdAtLabel: formatDateTime(transaction.createdAt),
    delta: transaction.delta,
    deltaLabel: `${transaction.delta > 0 ? '+' : ''}${formatNumber(transaction.delta)}`,
    error: transaction.error,
    id: transaction.id,
    ownerName: transaction.ownerName,
    reason: reasonLabel(transaction.reason),
    status: statusLabel(transaction.status),
    statusClass: transaction.status.toLowerCase(),
  }))

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

.member-filter {
  width: 14rem;
}
</style>
