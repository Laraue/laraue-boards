<template>
  <LandingSection
    :post-title="t('os_sub')"
    :pre-title="t('os_label')"
    :title="t('os_title')"
    type="plain">
    <div class="cards-grid">
      <LandingInfoCard
        :description="t('os_code_desc')"
        external
        :items="[
          'Laraue.Apps.Boards — .NET 10 / C#, PostgreSQL 18',
          'laraue-boards — Nuxt 4, Vue 3, TypeScript',
        ]"
        :link-href="githubUrl"
        :link-text="t('os_code_cta')"
        :title="t('os_code_title')">
        <template #icon><LandingIcon name="code" /></template>
      </LandingInfoCard>
      <LandingInfoCard
        :description="t('os_devlog_desc')"
        :link-href="devlogUrl"
        :link-text="t('os_devlog_cta')"
        :title="t('os_devlog_title')">
        <template #icon><LandingIcon name="book" /></template>
      </LandingInfoCard>
    </div>
    <p class="pricing-note">{{ t('pr_note') }}</p>
  </LandingSection>
</template>

<script setup lang="ts">
import type { Locale } from '~/composables/useI18n'

import { githubUrl, laraueUrl } from '../landingLinks'
import LandingIcon from './LandingIcon.vue'
import LandingInfoCard from './LandingInfoCard.vue'
import LandingSection from './LandingSection.vue'

const props = defineProps<{ locale: Locale }>()

const { t } = useI18n(
  {
    en: {
      os_code_cta: 'View on GitHub',
      os_code_desc:
        'Backend and frontend are both on GitHub. People told us they were not ready to trust private notes to a product they did not know — open code is the honest answer to that.',
      os_code_title: 'The code is public',
      os_devlog_cta: 'Read the full story',
      os_devlog_desc:
        'We write down how the product is being built, including what went wrong — the bot that asked too many questions and had to be rolled back, the database decision we got wrong.',
      os_devlog_title: 'The devlog',
      os_label: 'Built in the open',
      os_sub: 'You can read the code — and you can read how it was written.',
      os_title: 'Open source, mistakes included',
      pr_note:
        "The Free plan stays free forever. Paid tiers (Plus, Team, Business) will be available soon — see pricing above. /aisave runs on tokens: every user gets a free allowance each month, and what each plan includes is shown above.",
    },
    ru: {
      os_code_cta: 'Посмотреть на GitHub',
      os_code_desc:
        'Бэкенд и фронтенд лежат на GitHub. Пользователи писали, что не готовы доверить личные заметки незнакомому продукту, — открытый код честный ответ на это.',
      os_code_title: 'Код открыт',
      os_devlog_cta: 'Читать полную историю',
      os_devlog_desc:
        'Мы рассказываем, как продукт разрабатывается, включая то, что пошло не так: бот, который задавал слишком много вопросов и был откачен, решение в базе данных, которое оказалось неверным.',
      os_devlog_title: 'Цикл статей',
      os_label: 'Разработка на виду',
      os_sub: 'Можно прочитать код — и то, как он писался.',
      os_title: 'Открытый код, включая ошибки',
      pr_note:
        'Бесплатный тариф остаётся бесплатным навсегда. Платные тарифы (Plus, Team, Business) скоро станут доступны — смотрите тарифы выше. Функция /aisave работает на токенах: каждому пользователю каждый месяц доступен бесплатный запас, а что входит в каждый тариф — показано выше.',
    },
  },
  props.locale,
)

const devlogUrl = laraueUrl(
  props.locale,
  '/blog/articles/building-jira-alternative-solo-why-and-repositories',
)
</script>

<style scoped>
.pricing-note {
  color: var(--color-muted);
  font-size: var(--font-size-body);
  margin-top: 36px;
  text-align: center;
}

.cards-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr 1fr;
  margin-top: 48px;
}

@media (width <= 900px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
