<template>
  <section class="cta-section">
    <div class="cta-inner">
      <div class="cta-copy">
        <p class="cta-label">{{ texts.label }}</p>
        <h2 class="cta-title">{{ texts.title }}</h2>
        <p class="cta-sub">{{ texts.sub }}</p>
      </div>
      <div class="cta-actions">
        <LandingActionButton
          link="/organizations"
          :title="t('open_app')"
          type="site" />
        <LandingActionButton
          :link="telegramBotUrl"
          title="@msgboard_bot"
          type="telegram" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { telegramBotUrl } from '#layers/core/app/constants/links'
import { useI18n } from '#layers/core/app/i18n/useI18n'

import LandingActionButton from './LandingActionButton.vue'

const props = defineProps<{
  variant: 'final' | 'start'
}>()

const { t } = useI18n({
  en: {
    cta2_label: 'Ready when you are',
    cta2_sub: "It's already in your Telegram. Open the bot and try it — no signup, no setup.",
    cta2_title: 'Send your first message\nright now',
    cta_label: 'Get started today',
    cta_sub: 'Free and open source. Works in 30 seconds.',
    cta_title: 'Your work deserves\nbetter than chat history',
    open_app: 'Open App',
  },
  ru: {
    cta2_label: 'Готовы начать?',
    cta2_sub: 'Бот уже есть в Telegram. Откройте его и попробуйте — без регистрации и настройки.',
    cta2_title: 'Отправьте первое сообщение\nпрямо сейчас',
    cta_label: 'Начните сегодня',
    cta_sub: 'Бесплатно и с открытым кодом. Начните за 30 секунд.',
    cta_title: 'Ваши заметки заслуживают большего,\nчем затеряться в чате',
    open_app: 'Открыть приложение',
  },
})

const texts = computed(() =>
  props.variant === 'start'
    ? { label: t('cta2_label'), sub: t('cta2_sub'), title: t('cta2_title') }
    : { label: t('cta_label'), sub: t('cta_sub'), title: t('cta_title') },
)
</script>

<style scoped>
.cta-section {
  --btn-site-bg: #fff;
  --btn-site-color: var(--color-action);
  --btn-site-hover: color-mix(in srgb, #fff 90%, var(--color-action));
  --btn-alt-bg: transparent;
  --btn-alt-border: rgb(255 255 255 / 45%);
  --btn-alt-color: #fff;
  --btn-alt-hover: #fff;

  /* The hero's dotted canvas again, in white on the accent. */
  background-color: var(--landing-cta-bg);
  background-image: radial-gradient(rgb(255 255 255 / 22%) 1px, transparent 1px);
  background-size: 24px 24px;
  border-bottom: 1px solid var(--landing-cta-border);
  border-top: 1px solid var(--landing-cta-border);
  color: #fff;
  padding: 104px 24px;
}

.cta-inner {
  align-items: end;
  display: grid;
  gap: 32px 64px;
  grid-template-columns: minmax(0, 1fr) auto;
  margin: 0 auto;
  max-width: 1312px;
}

.cta-label {
  color: #fff;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  margin-bottom: 14px;
}

.cta-title {
  font-size: clamp(32px, 4.4vw, 60px);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.035em;
  line-height: 1.04;
  margin-bottom: 20px;
  text-wrap: balance;
}

.cta-sub {
  color: #fff;
  font-size: var(--font-size-xl);
  line-height: 1.6;
  max-width: 34em;
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

@media (width > 900px) {
  .cta-title {
    white-space: pre-line;
  }
}

@media (width <= 900px) {
  .cta-section {
    padding: 72px 16px;
  }

  .cta-inner {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
