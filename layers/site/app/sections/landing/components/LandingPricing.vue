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
              href="/organizations">
              {{ t('price_cta') }}
            </a>
          </div>
        </div>
      </div>
      <!-- What the plans don't say on their own: what tokens pay for, and how to get more storage. Headed like
           the plan groups above it. -->
      <div class="pricing-group">
        <div class="pricing-group-label">
          <LandingIcon name="gear" />
          {{ t('extras_label') }}
        </div>
        <p class="pricing-group-note">
          {{ t('extras_note') }}
        </p>
      </div>
      <div class="pricing-extras">
        <LandingInfoCard
          :description="t('tokens_note')"
          :link-href="tokensDocsHref"
          :link-text="t('tokens_link')"
          :title="t('tokens_title')">
          <template #icon>
            <LandingIcon name="sparkle" />
          </template>
        </LandingInfoCard>
        <LandingInfoCard
          v-if="storageAddons.length"
          :description="t('storage_note')"
          :items="storageAddons"
          :link-href="storageDocsHref"
          :link-text="t('storage_link')"
          :title="t('storage_title')">
          <template #icon>
            <LandingIcon name="database" />
          </template>
        </LandingInfoCard>
      </div>
      <!-- The period is an element of its own: Vue drops the line break between two elements, but not one
           before plain text, which would show as a space before the period. -->
      <p class="pricing-terms">
        {{ t('terms_note') }}
        <NuxtLink :to="localePath('terms', locale)">{{ t('terms_link') }}</NuxtLink>
        <span>.</span>
      </p>
    </template>
  </LandingSection>
</template>

<script setup lang="ts">
import { IconCheck } from '@tabler/icons-vue'
import { computed } from 'vue'

import { NuxtLink } from '#components'
import { useLocalePath } from '#imports'
import { useI18n } from '#layers/core/app/i18n/useI18n'

import type { LandingTariff, LandingTariffs } from '../LandingPage.deps'
import LandingIcon from './LandingIcon.vue'
import LandingInfoCard from './LandingInfoCard.vue'
import LandingSection from './LandingSection.vue'

const props = defineProps<{
  tariffs: LandingTariffs | undefined
}>()

const { locale, t } = useI18n({
  en: {
    billing_label_forever: 'forever',
    billing_label_month: 'month',
    billing_label_n_months: 'every {count} months',
    extras_label: 'Tokens and storage',
    extras_note:
      'What every plan comes with beyond its limits: tokens for the AI features and space for the files you attach.',
    feature_free_orgs: '{count} free team organization(s)',
    feature_issues: 'Up to {count} issues / month',
    feature_storage: '{size} of file storage',
    feature_storage_org: '{size} of file storage for the whole organization',
    feature_tokens: '{count} tokens included',
    feature_tokens_monthly: '{count} tokens / month',
    feature_tokens_monthly_org: '{count} tokens / month for the whole organization',
    feature_tokens_per_seat: '{count} tokens per seat',
    feature_unlimited_orgs: 'Unlimited team organizations',
    load_error: "Couldn't load pricing right now — please try again later.",
    per_month: 'month',
    per_seat: 'per seat',
    personal_label: 'For individuals',
    personal_pricing_note:
      'Personal plans belong to your account: the included tokens and limits are yours, not shared with a team.',
    price_cta: 'Get started',
    pricing_label: 'Pricing',
    pricing_sub: 'Free to start, both for individuals and teams. Upgrade only when you need more.',
    pricing_title: 'Simple, honest pricing',
    storage_addon: '{size} for {price} / {period}',
    storage_link: 'How storage works',
    storage_note:
      'Files you attach count toward your plan’s storage. A paid plan can get more, paid together with it every month:',
    storage_title: 'Extra storage',
    team_label: 'For teams',
    team_pricing_note:
      'Paid plans are priced per seat, and their included tokens are per seat, combined across your whole team. The Free plan is per organization.',
    terms_link: 'public offer',
    terms_note: 'Paying for a plan means you accept the',
    tokens_link: 'How tokens work',
    tokens_note:
      'Tokens pay for the AI features: /aisave in Telegram and the AI in the web app. Everything else does not use them.',
    tokens_title: 'AI tokens',
  },
  ru: {
    billing_label_forever: 'навсегда',
    billing_label_month: 'месяц',
    billing_label_n_months: 'раз в {count} мес.',
    extras_label: 'Токены и место',
    extras_note: 'Что ещё входит в каждый тариф: токены для функций ИИ и место для файлов.',
    feature_free_orgs: 'Бесплатных командных организаций: {count}',
    feature_issues: 'До {count} задач в месяц',
    feature_storage: '{size} для файлов',
    feature_storage_org: '{size} для файлов на всю организацию',
    feature_tokens: '{count} токенов в тарифе',
    feature_tokens_monthly: '{count} токенов в месяц',
    feature_tokens_monthly_org: '{count} токенов в месяц на всю организацию',
    feature_tokens_per_seat: '{count} токенов за каждое место',
    feature_unlimited_orgs: 'Командных организаций — без ограничений',
    load_error: 'Не удалось загрузить тарифы — попробуйте позже.',
    per_month: 'месяц',
    per_seat: 'за место',
    personal_label: 'Для себя',
    personal_pricing_note:
      'Личный тариф привязан к вашей учётной записи: его токены и лимиты — только ваши, а не общие с командой.',
    price_cta: 'Начать',
    pricing_label: 'Цены',
    pricing_sub:
      'Начать можно бесплатно — и одному, и командой. Платите, только когда понадобится больше.',
    pricing_title: 'Просто и честно',
    storage_addon: '{size} за {price} / {period}',
    storage_link: 'Как хранятся файлы',
    storage_note:
      'Прикреплённые файлы занимают место тарифа. К платному тарифу можно докупить место, оно оплачивается вместе с тарифом каждый месяц:',
    storage_title: 'Дополнительное место',
    team_label: 'Для команд',
    team_pricing_note:
      'Платные тарифы оплачиваются за каждое место, токены указаны на одно место и складываются для всей команды. Бесплатный тариф действует на всю организацию.',
    terms_link: 'публичной офертой',
    terms_note: 'Оплата тарифа означает, что вы согласны с',
    tokens_link: 'Как работают токены',
    tokens_note:
      'Токены расходуют функции ИИ: /aisave в Telegram и ИИ в веб-приложении. Всё остальное работает без них.',
    tokens_title: 'Токены ИИ',
  },
})
const localePath = useLocalePath()
const tokensDocsHref = computed(() =>
  localePath(
    { name: 'documentation-path', params: { path: ['features', 'tokens'] } },
    locale.value,
  ),
)
const storageDocsHref = computed(() =>
  localePath({ name: 'documentation-path', params: { path: ['features', 'media'] } }, locale.value),
)

// Binary units, the way the plans count storage: 1024 MB is 1 GB. Intl names the units in the locale's language.
const formatStorage = (megabytes: number): string =>
  new Intl.NumberFormat(locale.value, {
    maximumFractionDigits: 1,
    style: 'unit',
    unit: megabytes >= 1024 ? 'gigabyte' : 'megabyte',
    unitDisplay: 'short',
  }).format(megabytes >= 1024 ? megabytes / 1024 : megabytes)

// One line per add-on: "+10 GB for 84₽ / month".
const storageAddons = computed(() =>
  (props.tariffs?.storageAddons ?? []).map((addon) =>
    t('storage_addon', {
      period: t('per_month'),
      price: addon.formattedPrice,
      size: `+${formatStorage(addon.storageMegabytes)}`,
    }),
  ),
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
  const count = tariff.tokens.toLocaleString(locale.value)
  if (isFreeTariff(tariff)) {
    return t(perSeat ? 'feature_tokens_monthly_org' : 'feature_tokens_monthly', { count })
  }
  return t(perSeat ? 'feature_tokens_per_seat' : 'feature_tokens', { count })
}

const features = (tariff: LandingTariff, perSeat: boolean): string[] => [
  ...(tariff.tokens > 0 ? [tokensFeature(tariff, perSeat)] : []),
  ...(tariff.issuesPerMonth
    ? [t('feature_issues', { count: tariff.issuesPerMonth.toLocaleString(locale.value) })]
    : []),
  // Storage belongs to the organization: on a team plan it isn't per seat.
  ...(tariff.storageMegabytes > 0
    ? [
        t(perSeat ? 'feature_storage_org' : 'feature_storage', {
          size: formatStorage(tariff.storageMegabytes),
        }),
      ]
    : []),
  ...(tariff.freeOrganizations === null ? [t('feature_unlimited_orgs')] : []),
  ...(tariff.freeOrganizations
    ? [t('feature_free_orgs', { count: tariff.freeOrganizations })]
    : []),
]
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

.pricing-group + .pricing-group {
  margin-top: 48px;
}

.pricing-extras {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.pricing-terms {
  color: var(--color-muted);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  margin-top: 24px;
}

.pricing-terms a {
  color: var(--color-accent);
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
  max-width: 70ch;
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
