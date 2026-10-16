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
      <p class="pricing-note">
        {{ t('terms_note') }}
        <NuxtLink :to="locale === 'ru' ? '/ru/terms' : '/terms'">{{ t('terms_link') }}</NuxtLink>
        .
      </p>
      <div
        v-for="group in groups.filter((item) => item.tariffs.length > 0)"
        :key="group.key"
        class="pricing-group">
        <div class="pricing-group-label">
          <LandingIcon :name="group.icon" />
          {{ t(group.label) }}
        </div>
        <p class="pricing-group-note">
          {{ t(group.note) }}
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
                <template v-if="group.perSeat && !isFreeTariff(tariff)">
                  &middot; {{ t('per_seat') }}
                </template>
              </span>
            </div>
            <ul class="pricing-card-features">
              <li
                v-for="feature in features(tariff, group.perSeat)"
                :key="feature">
                <IconCheck stroke="2.4" />
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
import { IconCheck } from '@tabler/icons-vue'

import type { Locale } from '~/composables/useI18n'

import { appUrl } from '../landingLinks'
import type { LandingTariff, LandingTariffs } from '../LandingPage.deps'
import { useLandingOffers } from '../useLandingSeo'
import LandingIcon from './LandingIcon.vue'
import LandingSection from './LandingSection.vue'

const props = defineProps<{
  locale: Locale
  tariffs: LandingTariffs | undefined
}>()

const { t } = useI18n(
  {
    en: {
      billing_label_forever: 'forever',
      billing_label_month: 'month',
      billing_label_n_months: 'every {count} months',
      feature_free_orgs: '{count} free team organization(s)',
      feature_issues: 'Up to {count} issues / month',
      feature_tokens: '{count} tokens included',
      feature_tokens_monthly: '{count} tokens / month',
      feature_tokens_monthly_org: '{count} tokens / month for the whole organization',
      feature_tokens_per_seat: '{count} tokens per seat',
      feature_unlimited_orgs: 'Unlimited team organizations',
      load_error: "Couldn't load pricing right now — please try again later.",
      offer_free_orgs: '{count} free team organization(s)',
      offer_issues: 'up to {count} issues per month',
      offer_issues_org: 'up to {count} issues per month for the whole organization',
      offer_tokens: '{count} tokens included',
      offer_tokens_monthly: '{count} tokens per month',
      offer_tokens_monthly_org: '{count} tokens per month for the whole organization',
      offer_tokens_per_seat: '{count} tokens per seat',
      offer_unlimited_orgs: 'unlimited team organizations',
      per_seat: 'per seat',
      personal_label: 'For individuals',
      personal_pricing_note:
        'Personal plans belong to your account: the included tokens and limits are yours, not shared with a team.',
      price_cta: 'Get started',
      pricing_label: 'Pricing',
      pricing_sub:
        'Free to start, both for individuals and teams. Upgrade only when you need more.',
      pricing_title: 'Simple, honest pricing',
      team_label: 'For teams',
      team_pricing_note:
        'Paid plans are priced per seat, and their included tokens are per seat, combined across your whole team. The Free plan is per organization.',
      terms_link: 'public offer',
      terms_note: 'Paying for a plan means you accept the',
    },
    ru: {
      billing_label_forever: 'навсегда',
      billing_label_month: 'месяц',
      billing_label_n_months: 'раз в {count} мес.',
      feature_free_orgs: '{count} бесплатных организаций',
      feature_issues: 'До {count} issues в месяц',
      feature_tokens: '{count} токенов включено',
      feature_tokens_monthly: '{count} токенов в месяц',
      feature_tokens_monthly_org: '{count} токенов в месяц на всю организацию',
      feature_tokens_per_seat: '{count} токенов на место',
      feature_unlimited_orgs: 'Неограниченное число организаций',
      load_error: 'Не удалось загрузить тарифы — попробуйте позже.',
      offer_free_orgs: '{count} бесплатных организаций',
      offer_issues: 'до {count} issues в месяц',
      offer_issues_org: 'до {count} issues в месяц на всю организацию',
      offer_tokens: '{count} токенов включено',
      offer_tokens_monthly: '{count} токенов в месяц',
      offer_tokens_monthly_org: '{count} токенов в месяц на всю организацию',
      offer_tokens_per_seat: '{count} токенов на место',
      offer_unlimited_orgs: 'неограниченное число организаций',
      per_seat: 'за место',
      personal_label: 'Для себя',
      personal_pricing_note:
        'Личные тарифы привязаны к вашему аккаунту: включённые токены и лимиты принадлежат вам, а не команде.',
      price_cta: 'Начать',
      pricing_label: 'Цены',
      pricing_sub:
        'Бесплатно для старта — как для себя, так и для команды. Платите только когда нужно больше.',
      pricing_title: 'Просто и честно',
      team_label: 'Для команд',
      team_pricing_note:
        'Платные тарифы оплачиваются за место, а включённые токены указаны за одно место и суммируются по всей команде. Бесплатный тариф — на организацию.',
      terms_link: 'публичной офертой',
      terms_note: 'Оплата тарифа означает, что вы согласны с',
    },
  },
  props.locale,
)
const groups = computed(() => {
  if (!props.tariffs) {
    return []
  }

  return [
    {
      icon: 'brain',
      key: 'personal',
      label: 'personal_label',
      note: 'personal_pricing_note',
      perSeat: false,
      tariffs: props.tariffs.personal,
    },
    {
      icon: 'partners',
      key: 'team',
      label: 'team_label',
      note: 'team_pricing_note',
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

// A Free plan never renews, so its tokens are a monthly allowance - and for teams it belongs to the
// whole organization, not to each seat.
const isFreeTariff = (tariff: LandingTariff): boolean => tariff.billing.period === 'forever'

const tokensFeature = (tariff: LandingTariff, perSeat: boolean): string => {
  const count = tariff.tokens.toLocaleString(props.locale)
  if (isFreeTariff(tariff)) {
    return t(perSeat ? 'feature_tokens_monthly_org' : 'feature_tokens_monthly', { count })
  }
  return t(perSeat ? 'feature_tokens_per_seat' : 'feature_tokens', { count })
}

const tokensOffer = (tariff: LandingTariff, perSeat: boolean): string => {
  const count = tariff.tokens.toLocaleString(props.locale)
  if (isFreeTariff(tariff)) {
    return t(perSeat ? 'offer_tokens_monthly_org' : 'offer_tokens_monthly', { count })
  }
  return t(perSeat ? 'offer_tokens_per_seat' : 'offer_tokens', { count })
}

const features = (tariff: LandingTariff, perSeat: boolean): string[] => [
  ...(tariff.tokens > 0 ? [tokensFeature(tariff, perSeat)] : []),
  ...(tariff.issuesPerMonth
    ? [t('feature_issues', { count: tariff.issuesPerMonth.toLocaleString(props.locale) })]
    : []),
  ...(tariff.freeOrganizations === null ? [t('feature_unlimited_orgs')] : []),
  ...(tariff.freeOrganizations
    ? [t('feature_free_orgs', { count: tariff.freeOrganizations })]
    : []),
]

// The prices also go into the page's structured data (see `useLandingSeo`).
const offerDescription = (tariff: LandingTariff, perSeat: boolean): string | undefined =>
  [
    tariff.tokens > 0 ? tokensOffer(tariff, perSeat) : '',
    tariff.issuesPerMonth
      ? t(perSeat ? 'offer_issues_org' : 'offer_issues', {
          count: tariff.issuesPerMonth.toLocaleString(props.locale),
        })
      : '',
    !perSeat && tariff.freeOrganizations === null ? t('offer_unlimited_orgs') : '',
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
  background: var(--color-danger-soft);
  border: 1px solid color-mix(in srgb, var(--color-danger) 35%, transparent);
  border-radius: var(--radius-card);
  color: var(--color-danger);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  padding: 16px 20px;
}

.pricing-note {
  color: var(--color-muted);
  font-size: var(--font-size-md);
  line-height: 1.6;
}

.pricing-note a {
  color: var(--color-accent);
}

.pricing-group {
  margin-top: 48px;
}

.pricing-group-label {
  align-items: center;
  color: var(--color-text);
  display: flex;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  gap: 10px;
  margin-bottom: 6px;
}

.pricing-group-label :deep(.landing-icon) {
  color: var(--color-accent);
  height: 22px;
  width: 22px;
}

.pricing-group-note {
  color: var(--color-muted);
  font-size: var(--font-size-md);
  line-height: 1.55;
  margin-bottom: 20px;
  max-width: 48em;
}

.pricing-cards {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.pricing-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-surface);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  padding: 28px;
}

.pricing-card-title {
  color: var(--color-muted);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
}

.pricing-card-price-row {
  align-items: baseline;
  border-bottom: 1px solid var(--color-divider);
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0 20px;
  padding-bottom: 20px;
}

.pricing-card-price {
  font-size: clamp(32px, 3vw, 40px);
  font-variant-numeric: tabular-nums;
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.pricing-card-billing {
  color: var(--color-muted);
  font-size: var(--font-size-md);
}

.pricing-card-features {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
}

.pricing-card-features li {
  align-items: flex-start;
  display: flex;
  font-size: var(--font-size-md);
  gap: 10px;
  line-height: 1.45;
}

.pricing-card-features li svg {
  color: var(--color-accent);
  flex-shrink: 0;
  height: 16px;
  margin-top: 2px;
  width: 16px;
}

.pricing-card-cta {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  color: var(--color-text);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  line-height: 40px;
  text-align: center;
  text-decoration: none;
  transition: border-color var(--duration-base);
}

.pricing-card-cta:hover {
  border-color: var(--color-border-hover);
}

.pricing-card-cta:focus-visible {
  border-color: var(--color-focus);
  outline: none;
}
</style>
