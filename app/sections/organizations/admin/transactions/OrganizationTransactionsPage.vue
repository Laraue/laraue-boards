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
        <label class="member-filter">
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

        <TransactionsTable
          v-if="pageData.transactions.length"
          :labels="tableLabels"
          :rows="toTableRows(pageData.transactions)"
          :show-owner="true" />
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
import type { OrganizationTransactionsPageDeps } from './OrganizationTransactionsPage.deps'
import type {
  TransactionReason,
  TransactionStatus,
  TransactionViewModel,
} from './OrganizationTransactionsPage.types'

const props = defineProps<{ deps: OrganizationTransactionsPageDeps }>()

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
  },
})

const page = ref(1)
const userId = ref('')
const { formatDateTime, formatNumber } = useFormatters()
const { data, message, pending, refresh } = await useQuery(
  'billing-admin-transactions',
  (_nuxtApp, { signal }) =>
    props.deps.view({ page: page.value, signal, userId: userId.value || undefined }),
  { watch: [page, userId] },
)

const tableLabels = computed(() => ({
  date: t('date'),
  delta: t('delta'),
  finishedAt: t('finishedAt'),
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
    finishedAt: transaction.finishedAt,
    finishedAtLabel: transaction.finishedAt ? formatDateTime(transaction.finishedAt) : null,
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
  display: grid;
  gap: var(--space-1);
  margin: 0;
  max-width: 320px;
}
</style>
