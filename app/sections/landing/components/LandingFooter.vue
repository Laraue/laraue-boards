<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="footer-logo">
          <img
            alt=""
            height="28"
            :src="laraueLogoUrl"
            width="28" />
          Laraue Boards
        </div>
        <p class="footer-tagline">{{ t('footer_tagline') }}</p>
      </div>
      <ul class="footer-links">
        <li>
          <a :href="docsUrl">{{ t('documentation') }}</a>
        </li>
        <li>
          <a
            :href="githubUrl"
            rel="noopener"
            target="_blank">
            GitHub
          </a>
        </li>
        <li>
          <a
            :href="botUrl"
            rel="noopener"
            target="_blank">
            @msgboard_bot
          </a>
        </li>
        <li>
          <a :href="privacyUrl">{{ t('footer_privacy') }}</a>
        </li>
      </ul>
    </div>
    <div class="footer-bottom">© 2026 Laraue Software</div>
  </footer>
</template>

<script setup lang="ts">
import type { Locale } from '~/composables/useI18n'

import { botUrl, githubUrl, laraueUrl } from '../landingLinks'

const props = defineProps<{ locale: Locale }>()

const { t } = useI18n(
  {
    en: {
      documentation: 'Documentation',
      footer_privacy: 'Privacy policy',
      footer_tagline: 'A Jira alternative built on Telegram. Free and open source.',
    },
    ru: {
      documentation: 'Документация',
      footer_privacy: 'Политика конфиденциальности',
      footer_tagline: 'Альтернатива Jira в Telegram. Бесплатно и с открытым исходным кодом.',
    },
  },
  props.locale,
)

const docsUrl = laraueUrl(props.locale, '/blog/documentation/laraue-boards')
const privacyUrl = laraueUrl(props.locale, '/privacy')
</script>

<style scoped>
.footer {
  background: var(--color-surface);
  border-top: 1px solid var(--color-divider);
  color: var(--color-muted);
  padding: 60px 48px 40px;
}

.footer-inner {
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  justify-content: space-between;
  margin: 0 auto 40px;
  max-width: 1160px;
}

.footer-logo {
  align-items: center;
  color: var(--color-text);
  display: flex;
  font-size: 16px;
  font-weight: var(--font-weight-bold);
  gap: 10px;
  margin-bottom: 12px;
}

.footer-logo img {
  border-radius: 8px;
}

.footer-tagline {
  font-size: 13px;
  line-height: 1.6;
  max-width: 260px;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-links a {
  color: var(--color-muted);
  font-size: var(--font-size-body);
  text-decoration: none;
  transition: color var(--duration-base);
}

.footer-links a:hover {
  color: var(--color-text);
}

.footer-bottom {
  border-top: 1px solid var(--color-divider);
  font-size: var(--font-size-small);
  margin: 0 auto;
  max-width: 1160px;
  padding-top: 24px;
}

@media (width <= 720px) {
  .footer {
    padding: 40px 22px;
  }
}
</style>
