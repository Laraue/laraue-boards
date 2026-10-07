<template>
  <QueryState
    :data="data"
    :error-title="t('loadError')"
    :loading-text="t('loading')"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: page }">
      <section class="token-packs-page">
        <div class="page-heading">
          <AppBackLink
            :label="t('back')"
            :to="backTo" />
          <h2>{{ t('title') }}</h2>
        </div>
        <p class="muted">{{ t('description') }}</p>

        <p
          v-if="!packs.length"
          class="muted">
          {{ t('noPacks') }}
        </p>
        <template v-else>
          <div class="pack-list">
            <article
              v-for="pack in packs"
              :key="pack.id"
              class="pack-offer">
              <div>
                <strong class="pack-name">{{ pack.title }}</strong>
                <p class="pack-price">{{ pack.formattedPrice }}</p>
              </div>
              <ul class="pack-features muted">
                <li>{{ t('tokens', { count: formatNumber(pack.tokens) }) }}</li>
                <li>{{ expiration(pack) }}</li>
              </ul>
              <BaseButton
                :disabled="!page.canPay"
                variant="primary"
                @click="select(pack)">
                {{ t('select') }}
              </BaseButton>
            </article>
          </div>

          <p
            v-if="!page.canPay"
            class="muted">
            {{ t('ownerOnly') }}
          </p>
        </template>
        <PaymentDialog
          ref="paymentDialog"
          :conditions="dialogConditions"
          :message="checkout.message.value"
          :note="t('spentAfterPlan')"
          :on-confirm="pay"
          :pending="checkout.pending.value"
          :price="state.pack?.formattedPrice"
          :title="t('dialogTitle', { pack: state.pack?.title ?? '' })" />
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

import type {
  BillingTokenPackViewModel,
  TokenPacksPageDeps,
} from '~/sections/billing/token-packs/TokenPacksPage.deps'
import PaymentDialog from '~/sections/billing/components/PaymentDialog/PaymentDialog.vue'

// `onPay` receives the provider's payment address: the page is outside the app, so leaving for it
// is the page's navigation.
const props = defineProps<{
  backTo: RouteLocationRaw
  deps: TokenPacksPageDeps
  onPay: (url: string) => void
}>()

const { t } = useI18n({
  en: {
    back: 'Back to the plan',
    description:
      'A token pack tops up your balance once. Its tokens are used after the tokens of your plan are spent.',
    dialogTitle: 'Token pack “{pack}”',
    expiresInMonths: 'Valid for {count} months',
    loadError: 'Could not load the billing summary',
    loading: 'Loading the token packs…',
    neverExpires: 'Never expires',
    noPacks: 'There are no token packs to buy yet.',
    ownerOnly: 'Only the organization owner can pay for tokens.',
    select: 'Select this pack',
    spentAfterPlan: 'Spent after the tokens of your plan',
    title: 'Buy tokens',
    tokens: '{count} tokens',
  },
  ru: {
    back: 'Назад к тарифу',
    description:
      'Пакет токенов пополняет баланс один раз. Его токены тратятся после того, как закончатся токены вашего тарифа.',
    dialogTitle: 'Пакет токенов «{pack}»',
    expiresInMonths: 'Действует {count} мес.',
    loadError: 'Не удалось загрузить информацию о биллинге',
    loading: 'Загрузка пакетов токенов…',
    neverExpires: 'Не сгорает',
    noPacks: 'Пока нет пакетов токенов для покупки.',
    ownerOnly: 'Оплатить токены может только владелец организации.',
    select: 'Выбрать пакет',
    spentAfterPlan: 'Тратится после токенов вашего тарифа',
    title: 'Купить токены',
    tokens: '{count} токенов',
  },
})

const { formatNumber } = useFormatters()
const paymentDialog = useTemplateRef('paymentDialog')
const state = reactive({ pack: undefined as BillingTokenPackViewModel | undefined })

const { data, message, pending, refresh } = await useApiQuery('token-packs-summary', (signal) =>
  props.deps.view({ signal }),
)

// The packs are a bonus on the page: when they cannot be loaded the page just says there are none.
const { data: packOptions } = await useApiQuery('billing-token-packs', (signal) =>
  props.deps.getTokenPacks({ signal }),
)

const checkout = useApiAction(props.deps.startCheckout)

const packs = computed(() => packOptions.value ?? [])

const expiration = (pack: BillingTokenPackViewModel) =>
  pack.expirationMonths === null
    ? t('neverExpires')
    : t('expiresInMonths', { count: pack.expirationMonths })

const dialogConditions = computed(() => {
  const { pack } = state
  if (!pack) {
    return []
  }
  return [t('tokens', { count: formatNumber(pack.tokens) }), expiration(pack)]
})

const select = (pack: BillingTokenPackViewModel) => {
  state.pack = pack
  checkout.message.value = undefined
  paymentDialog.value?.open()
}

const pay = async () => {
  const { pack } = state
  if (!pack) {
    return
  }
  const result = await checkout.execute({
    currencyCode: pack.currencyCode,
    itemId: pack.id,
    kind: 'TokenPack',
  })
  if (result) {
    props.onPay(result.value.url)
  }
}
</script>

<style scoped>
.token-packs-page {
  align-content: start;
  display: grid;
  gap: var(--space-4);
}

.token-packs-page h2 {
  line-height: var(--icon-btn-size);
  margin: 0;
}

.token-packs-page p {
  margin: 0;
}

.pack-list {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.pack-offer {
  align-content: start;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  display: grid;
  gap: var(--space-4);
  padding: var(--space-4);
}

.pack-name {
  display: block;
  font-size: var(--font-size-heading);
}

.pack-price {
  font-size: var(--font-size-heading);
  margin: var(--space-1) 0 0;
}

.pack-features {
  align-content: start;
  display: grid;
  font-size: var(--font-size-small);
  gap: var(--space-1);
  list-style: none;
  margin: 0;
  padding: 0;
}

@media (max-width: 767px) {
  .pack-list {
    grid-template-columns: 1fr;
  }
}
</style>
