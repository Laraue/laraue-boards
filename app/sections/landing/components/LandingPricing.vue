<template>
  <LandingSection
    :post-title="t('pricing_sub')"
    :pre-title="t('pricing_label')"
    :title="t('pricing_title')"
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
        class="currency-switch"
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
      <p class="pricing-note">
        {{ t('terms_note') }}
        <NuxtLink :to="locale === 'ru' ? '/ru/terms' : '/terms'">{{ t('terms_link') }}</NuxtLink>.
      </p>
      <div
        v-for="group in groups.filter((item) => item.tariffs.length > 0)"
        :key="group.key"
        class="pricing-group">
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
              :href="appUrl">
              {{ t('price_cta') }}
            </a>
          </div>
        </div>
      </div>
    </template>
  </LandingSection>
</template>

<script setup lang="ts">
import type { Locale } from '~/composables/useI18n'

import { appUrl } from '../landingLinks'
import type { LandingCurrency, LandingTariff, LandingTariffs } from '../LandingPage.types'
import { useLandingOffers } from '../useLandingSeo'
import LandingIcon from './LandingIcon.vue'
import LandingSection from './LandingSection.vue'

const props = defineProps<{
  locale: Locale
  tariffs: LandingTariffs | undefined
}>()

const currency = defineModel<LandingCurrency>('currency', { required: true })

const { t } = useI18n(
  {
    en: {
      billing_label_forever: 'forever',
      billing_label_month: 'month',
      billing_label_n_months: 'every {count} months',
      currency_switch_label: 'Currency',
      feature_free_orgs: '{count} free team organization(s)',
      feature_issues: 'Up to {count} issues / month',
      feature_tokens: '{count} tokens included',
      feature_tokens_per_seat: '{count} tokens per seat',
      load_error: "Couldn't load pricing right now — please try again later.",
      offer_free_orgs: '{count} free team organization(s)',
      offer_issues: 'up to {count} issues per month',
      offer_issues_org: 'up to {count} issues per month for the whole organization',
      offer_tokens: '{count} tokens included',
      offer_tokens_per_seat: '{count} tokens per seat',
      per_seat: 'per seat',
      personal_label: 'For individuals',
      price_cta: 'Get started',
      pricing_label: 'Pricing',
      pricing_sub:
        'Free to start, both for individuals and teams. Upgrade only when you need more.',
      pricing_title: 'Simple, honest pricing',
      team_label: 'For teams',
      team_pricing_note: 'Price and included tokens are per seat, combined across your whole team.',
      terms_link: 'public offer',
      terms_note: 'Paying for a plan means you accept the',
    },
    ru: {
      billing_label_forever: 'навсегда',
      billing_label_month: 'месяц',
      billing_label_n_months: 'раз в {count} мес.',
      currency_switch_label: 'Валюта',
      feature_free_orgs: '{count} бесплатных организаций',
      feature_issues: 'До {count} issues в месяц',
      feature_tokens: '{count} токенов включено',
      feature_tokens_per_seat: '{count} токенов на место',
      load_error: 'Не удалось загрузить тарифы — попробуйте позже.',
      offer_free_orgs: '{count} бесплатных организаций',
      offer_issues: 'до {count} issues в месяц',
      offer_issues_org: 'до {count} issues в месяц на всю организацию',
      offer_tokens: '{count} токенов включено',
      offer_tokens_per_seat: '{count} токенов на место',
      per_seat: 'за место',
      personal_label: 'Для себя',
      price_cta: 'Начать',
      pricing_label: 'Цены',
      pricing_sub:
        'Бесплатно для старта — как для себя, так и для команды. Платите только когда нужно больше.',
      pricing_title: 'Просто и честно',
      team_label: 'Для команд',
      team_pricing_note:
        'Цена и включённые токены указаны за одно место и суммируются по всей команде.',
      terms_link: 'публичной офертой',
      terms_note: 'Оплата тарифа означает, что вы согласны с',
    },
  },
  props.locale,
)
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

// The prices also go into the page's structured data (see `useLandingSeo`).
const offerDescription = (tariff: LandingTariff, perSeat: boolean): string | undefined =>
  [
    tariff.tokens > 0
      ? t(perSeat ? 'offer_tokens_per_seat' : 'offer_tokens', {
          count: tariff.tokens.toLocaleString(props.locale),
        })
      : '',
    tariff.issuesPerMonth
      ? t(perSeat ? 'offer_issues_org' : 'offer_issues', {
          count: tariff.issuesPerMonth.toLocaleString(props.locale),
        })
      : '',
    !perSeat && tariff.freeOrganizations
      ? t('offer_free_orgs', { count: tariff.freeOrganizations })
      : '',
  ]
    .filter(Boolean)
    .join(', ') || undefined

const offers = useLandingOffers()
const pricingUrl = `${useSiteConfig().url.replace(/\/$/, '')}${props.locale === 'ru' ? '/ru' : '/'}#pricing`
watch(
  () => props.tariffs,
  (tariffs) => {
    if (!tariffs) {
      return
    }
    // Individual and team plans share names ("Free"), so the audience is part of the offer name.
    const toOffer = (tariff: LandingTariff, perSeat: boolean) => ({
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      description: offerDescription(tariff, perSeat),
      name: `${tariff.title} — ${t(perSeat ? 'team_label' : 'personal_label')}`,
      price: tariff.price,
      priceCurrency: tariff.currencyCode,
      url: pricingUrl,
    })
    offers.value = [
      ...tariffs.personal.map((tariff) => toOffer(tariff, false)),
      ...tariffs.team.map((tariff) => toOffer(tariff, true)),
    ]
  },
  { immediate: true },
)
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

.pricing-note {
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
