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
            href="https://github.com/win7user10/Laraue.Apps.Boards"
            rel="noopener"
            target="_blank">
            GitHub
          </a>
        </li>
        <li>
          <a
            href="https://t.me/msgboard_bot"
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
import type { LandingLocale } from '../LandingPage.messages'
import { useLandingText } from '../useLandingText'

const props = defineProps<{
  docsUrl: string
  locale: LandingLocale
  privacyUrl: string
}>()

const t = useLandingText(props.locale)
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
