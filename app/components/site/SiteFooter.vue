<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-logo">
        <img
          alt=""
          height="28"
          :src="laraueLogoUrl"
          width="28" />
        Laraue Boards
      </div>
      <ul class="footer-links">
        <li>
          <NuxtLink :to="docsHref">{{ t('documentation') }}</NuxtLink>
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
          <NuxtLink :to="termsHref">{{ t('footer_terms') }}</NuxtLink>
        </li>
        <li>
          <a :href="privacyUrl">{{ t('footer_privacy') }}</a>
        </li>
      </ul>
    </div>
    <div class="footer-contacts">
      <p>{{ sellerDetails.name[locale] }}, {{ sellerDetails.status[locale] }}, {{ t('inn') }} {{ sellerDetails.inn }}</p>
      <p>
        <a :href="`mailto:${sellerDetails.email}`">{{ sellerDetails.email }}</a>
        ·
        <a :href="`tel:${sellerDetails.phoneHref}`">{{ sellerDetails.phone }}</a>
      </p>
    </div>
    <div class="footer-bottom">
      <p>{{ t('footer_tagline') }}</p>
      <p>© 2026 Laraue Software</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import type { Locale } from '~/composables/useI18n'
import { docsPath } from '~/sections/docs/docsPaths'
import { botUrl, githubUrl, laraueUrl } from '~/sections/landing/landingLinks'
import { sellerDetails } from '~/sections/legal/sellerDetails'

const props = defineProps<{ locale: Locale }>()

const { t } = useI18n(
  {
    en: {
      documentation: 'Documentation',
      footer_privacy: 'Privacy policy',
      footer_tagline: 'A Jira alternative built on Telegram. Free and open source.',
      footer_terms: 'Public offer',
      inn: 'INN',
    },
    ru: {
      documentation: 'Документация',
      footer_privacy: 'Политика конфиденциальности',
      footer_tagline: 'Альтернатива Jira в Telegram. Бесплатно и с открытым исходным кодом.',
      footer_terms: 'Публичная оферта',
      inn: 'ИНН',
    },
  },
  props.locale,
)

const docsHref = docsPath(props.locale)
const privacyUrl = laraueUrl(props.locale, '/privacy')
const termsHref = props.locale === 'ru' ? '/ru/terms' : '/terms'
</script>

<style scoped>
.footer {
  background: var(--color-surface);
  border-top: 1px solid var(--color-divider);
  color: var(--color-muted);
  padding: 60px 24px 40px;
}

.footer-inner {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  justify-content: space-between;
  margin: 0 auto 32px;
  /* The same width as the header and the docs' content (1360px with 24px of padding). */
  max-width: 1312px;
}

.footer-logo {
  align-items: center;
  color: var(--color-text);
  display: flex;
  font-size: 16px;
  font-weight: var(--font-weight-bold);
  gap: 10px;
}

.footer-logo img {
  border-radius: 8px;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 28px;
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

.footer-contacts {
  color: var(--color-muted);
  display: flex;
  flex-wrap: wrap;
  font-size: var(--font-size-small);
  gap: 4px 24px;
  justify-content: space-between;
  margin: 0 auto 24px;
  max-width: 1312px;
}

.footer-contacts a {
  color: var(--color-muted);
  text-decoration: none;
}

.footer-contacts a:hover {
  color: var(--color-text);
}

.footer-bottom {
  border-top: 1px solid var(--color-divider);
  display: flex;
  flex-wrap: wrap;
  font-size: var(--font-size-small);
  gap: 8px 24px;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 1312px;
  padding-top: 24px;
}

@media (width <= 720px) {
  .footer {
    padding: 40px 22px;
  }
}
</style>
