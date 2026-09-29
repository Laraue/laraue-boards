<template>
  <LandingSection
    :post-title="postTitle"
    :pre-title="preTitle"
    :title="title"
    type="plain">
    <div
      v-if="!tariffs"
      class="pricing-error"
      role="alert">
      {{ t('load_error') }}
    </div>
    <template v-else>
      <div
        :aria-label="t('currency_switch_label')"
        class="currency-switch reveal"
        role="group">
        <button
          v-for="code in currencies"
          :key="code"
          class="currency-switch-btn"
          :data-active="code === currency ? 'true' : null"
          type="button"
          @click="currency = code">
          {{ code }}
        </button>
      </div>
      <p class="mvp-note reveal">{{ t('mvp_note') }}</p>
      <div
        v-for="group in groups.filter((item) => item.tariffs.length > 0)"
        :key="group.key"
        class="pricing-group reveal">
        <div class="pricing-group-label">
          <LandingIcon :name="group.icon" />
          {{ t(group.label) }}
        </div>
        <p
          v-if="group.perSeat"
          class="pricing-group-note">
          {{ t('team_pricing_note') }}
        </p>
        <div class="pricing-cards">
          <div
            v-for="tariff in group.tariffs"
            :key="tariff.id"
            class="pricing-card">
            <div class="pricing-card-title">{{ tariff.title }}</div>
            <div class="pricing-card-price-row">
              <span class="pricing-card-price">{{ tariff.formattedPrice }}</span>
              <span class="pricing-card-billing">
                / {{ billingLabel(tariff) }}
                <template v-if="group.perSeat">&middot; {{ t('per_seat') }}</template>
              </span>
            </div>
            <ul class="pricing-card-features">
              <li
                v-for="feature in features(tariff, group.perSeat)"
                :key="feature">
                <svg
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.4"
                  viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{{ feature }}</span>
              </li>
            </ul>
            <a
              class="pricing-card-cta"
              :href="ctaHref">
              {{ t('price_unavailable') }}
            </a>
          </div>
        </div>
      </div>
    </template>
  </LandingSection>
</template>

<script setup lang="ts">
import type { LandingLocale } from '../LandingPage.messages'
import type { LandingCurrency, LandingTariff, LandingTariffs } from '../LandingPage.types'

import { useLandingText } from '../useLandingText'
import LandingIcon from './LandingIcon.vue'
import LandingSection from './LandingSection.vue'

const props = defineProps<{
  ctaHref: string
  locale: LandingLocale
  postTitle: string
  preTitle: string
  tariffs: LandingTariffs | undefined
  title: string
}>()

const currency = defineModel<LandingCurrency>('currency', { required: true })

const t = useLandingText(props.locale)
const currencies: LandingCurrency[] = ['USD', 'RUB']

const groups = computed(() => {
  if (!props.tariffs) {
    return []
  }

  return [
    {
      icon: 'brain',
      key: 'personal',
      label: 'personal_label',
      perSeat: false,
      tariffs: props.tariffs.personal,
    },
    {
      icon: 'partners',
      key: 'team',
      label: 'team_label',
      perSeat: true,
      tariffs: props.tariffs.team,
    },
  ] as const
})

const billingLabel = (tariff: LandingTariff): string => {
  if (tariff.billing.period === 'forever') {
    return t('billing_label_forever')
  }
  return tariff.billing.duration === 1
    ? t('billing_label_month')
    : t('billing_label_n_months', { count: tariff.billing.duration })
}

const features = (tariff: LandingTariff, perSeat: boolean): string[] => [
  ...(tariff.tokens > 0
    ? [
        t(perSeat ? 'feature_tokens_per_seat' : 'feature_tokens', {
          count: tariff.tokens.toLocaleString(props.locale),
        }),
      ]
    : []),
  ...(tariff.issuesPerMonth
    ? [t('feature_issues', { count: tariff.issuesPerMonth.toLocaleString(props.locale) })]
    : []),
  ...(tariff.freeOrganizations
    ? [t('feature_free_orgs', { count: tariff.freeOrganizations })]
    : []),
]
</script>

<style scoped>
.pricing-error {
  background: color-mix(in srgb, var(--color-danger) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-danger) 35%, transparent);
  border-radius: var(--radius-card);
  color: var(--color-danger);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  margin-top: 24px;
  padding: 16px 20px;
}

.currency-switch {
  background: var(--color-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  display: inline-flex;
  gap: 2px;
  margin-top: 24px;
  padding: 3px;
}

.currency-switch-btn {
  background: none;
  border: none;
  border-radius: var(--radius-small);
  color: var(--color-muted);
  cursor: pointer;
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
  padding: 7px 18px;
  transition:
    background var(--duration-base),
    color var(--duration-base);
}

.currency-switch-btn:hover {
  color: var(--color-text);
}

.currency-switch-btn[data-active='true'] {
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
  color: var(--color-text);
}

.mvp-note {
  background: var(--color-accent-soft);
  border-radius: var(--radius-card);
  color: var(--color-text);
  font-size: 13px;
  line-height: 1.6;
  margin-top: 24px;
  padding: 14px 18px;
}

.pricing-group {
  margin-top: 40px;
}

.pricing-group-label {
  align-items: center;
  color: var(--color-accent);
  display: flex;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  gap: 8px;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
  text-transform: uppercase;
}

.pricing-group-note {
  color: var(--color-muted);
  font-size: 13px;
  line-height: 1.5;
  margin: -8px 0 20px;
  max-width: 620px;
}

.pricing-cards {
  align-items: stretch;
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
}

.pricing-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-dialog);
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  padding: 28px;
}

.pricing-card-title {
  font-size: 18px;
  font-weight: var(--font-weight-bold);
}

.pricing-card-price-row {
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 12px 0 22px;
}

.pricing-card-price {
  font-size: 30px;
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
}

.pricing-card-billing {
  color: var(--color-muted);
  font-size: 13px;
}

.pricing-card-features {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 9px;
  margin-bottom: 28px;
}

.pricing-card-features li {
  align-items: flex-start;
  color: var(--color-muted);
  display: flex;
  font-size: var(--font-size-body);
  gap: 10px;
  line-height: 1.45;
}

.pricing-card-features li svg {
  flex-shrink: 0;
  height: 15px;
  margin-top: 2px;
  stroke: var(--color-accent);
  width: 15px;
}

.pricing-card-cta {
  background: var(--color-accent-soft);
  border-radius: var(--radius-control);
  color: var(--color-accent);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.04em;
  padding: 12px;
  text-align: center;
  text-decoration: none;
  text-transform: uppercase;
  transition: background var(--duration-base);
}

.pricing-card-cta:hover {
  background: color-mix(in srgb, var(--color-accent) 22%, transparent);
}

@media (width <= 480px) {
  .pricing-cards {
    grid-template-columns: 1fr;
  }
}
</style>
