<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="footer-logo">Laraue Boards</div>
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
  background: var(--ink);
  color: rgb(247 244 238 / 65%);
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
  color: var(--paper);
  font-family: var(--serif);
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
}

.footer-tagline {
  color: rgb(247 244 238 / 45%);
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
  color: rgb(247 244 238 / 60%);
  font-size: 14px;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: var(--paper);
}

.footer-bottom {
  border-top: 1px solid rgb(255 255 255 / 8%);
  color: rgb(247 244 238 / 30%);
  font-size: 12px;
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
