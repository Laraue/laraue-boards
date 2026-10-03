<template>
  <section class="cta-section">
    <div class="cta-inner">
      <div class="cta-label">{{ texts.label }}</div>
      <h2 class="cta-title">{{ texts.title }}</h2>
      <p class="cta-sub">{{ texts.sub }}</p>
      <div class="cta-actions">
        <LandingActionButton
          :link="appUrl"
          :title="t('open_app')"
          type="site" />
        <LandingActionButton
          :link="botUrl"
          title="@msgboard_bot"
          type="telegram" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Locale } from '~/composables/useI18n'

import { appUrl, botUrl } from '../landingLinks'
import LandingActionButton from './LandingActionButton.vue'

const props = defineProps<{
  locale: Locale
  variant: 'final' | 'start'
}>()

const { t } = useI18n(
  {
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
  },
  props.locale,
)

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
  --btn-site-hover: color-mix(in srgb, #fff 88%, transparent);
  --btn-alt-bg: transparent;
  --btn-alt-border: rgb(255 255 255 / 50%);
  --btn-alt-color: #fff;
  --btn-alt-hover: rgb(255 255 255 / 14%);

  background: var(--landing-cta-bg);
  border-bottom: 1px solid var(--landing-cta-border);
  border-top: 1px solid var(--landing-cta-border);
  color: #fff;
  overflow: hidden;
  padding: 96px 24px;
  position: relative;
  text-align: center;
}

.cta-section::after {
  background: radial-gradient(circle, rgb(255 255 255 / 16%) 0%, transparent 70%);
  content: '';
  height: 600px;
  left: 50%;
  pointer-events: none;
  position: absolute;
  top: 0;
  transform: translate(-50%, -50%);
  width: 600px;
}

.cta-inner {
  margin: 0 auto;
  max-width: 640px;
  position: relative;
  z-index: 1;
}

.cta-label {
  color: rgb(255 255 255 / 70%);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.1em;
  margin-bottom: 20px;
  text-transform: uppercase;
}

.cta-title {
  font-size: clamp(28px, 4vw, 44px);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: -0.02em;
  line-height: 1.12;
  margin-bottom: 16px;
}

.cta-sub {
  color: rgb(255 255 255 / 80%);
  font-size: 17px;
  line-height: 1.6;
  margin-bottom: 36px;
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: center;
}

@media (width <= 720px) {
  .cta-section {
    padding: 60px 22px;
  }
}
</style>
