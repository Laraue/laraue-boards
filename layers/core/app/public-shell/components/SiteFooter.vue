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
            :href="githubRepositoryUrl"
            rel="noopener"
            target="_blank">
            GitHub
          </a>
        </li>
        <li>
          <a
            :href="telegramBotUrl"
            rel="noopener"
            target="_blank">
            @msgboard_bot
          </a>
        </li>
        <li>
          <NuxtLink :to="localePath('compare-linear', locale)">{{ t('compare_linear') }}</NuxtLink>
        </li>
        <li>
          <NuxtLink :to="localePath('compare-trello', locale)">{{ t('compare_trello') }}</NuxtLink>
        </li>
        <li>
          <NuxtLink :to="termsHref">{{ t('footer_terms') }}</NuxtLink>
        </li>
        <li>
          <a :href="privacyUrl">{{ t('footer_privacy') }}</a>
        </li>
      </ul>
    </div>
    <div class="footer-bottom">
      <p>
        {{ sellerDetails.name[locale] }}, {{ sellerDetails.status[locale] }}, {{ t('inn') }}
        {{ sellerDetails.inn }}
      </p>
      <p>
        <a :href="`mailto:${sellerDetails.email}`">{{ sellerDetails.email }}</a>
        ·
        <a :href="`tel:${sellerDetails.phoneHref}`">{{ sellerDetails.phone }}</a>
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { NuxtLink } from '#components'
import { useLocalePath } from '#imports'
import { laraueLogoUrl } from '#layers/core/app/branding/laraueIcons'
import {
  telegramBotUrl,
  githubRepositoryUrl,
  laraueWebsiteUrl,
} from '#layers/core/app/constants/links'
import { sellerDetails } from '#layers/core/app/constants/sellerDetails'
import { useI18n } from '#layers/core/app/i18n/useI18n'

const { locale, t } = useI18n({
  en: {
    compare_linear: 'Boards vs Linear',
    compare_trello: 'Boards vs Trello',
    documentation: 'Documentation',
    footer_privacy: 'Privacy policy',
    footer_terms: 'Public offer',
    inn: 'INN',
  },
  ru: {
    compare_linear: 'Boards и Linear',
    compare_trello: 'Boards и Trello',
    documentation: 'Документация',
    footer_privacy: 'Политика конфиденциальности',
    footer_terms: 'Публичная оферта',
    inn: 'ИНН',
  },
})

const localePath = useLocalePath()
const docsHref = computed(() =>
  localePath({ name: 'documentation-path', params: { path: [] } }, locale.value),
)
const privacyUrl = computed(() => laraueWebsiteUrl(locale.value, '/privacy'))
const termsHref = computed(() => localePath('terms', locale.value))
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
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  gap: 10px;
}

.footer-logo img {
  border-radius: var(--radius-control);
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

.footer-bottom a {
  color: var(--color-muted);
  text-decoration: none;
}

.footer-bottom a:hover {
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
