<template>
  <div
    v-if="visible"
    aria-live="polite"
    class="cookie-consent"
    role="dialog">
    <p class="text">{{ t('text') }}</p>
    <div class="actions">
      <button
        class="secondary"
        type="button"
        @click="decline">
        {{ t('decline') }}
      </button>
      <button
        class="primary"
        type="button"
        @click="accept">
        {{ t('accept') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { consentStorageKey } from '~/utils/consent'

const state = useConsent()
const { gtag, initialize } = useGtag()
const route = useRoute()
const { locale } = useAppPreferences()

// Only visitors whose country requires it, and who have not decided yet, are asked.
const visible = computed(
  () => state.value.resolved && state.value.required && state.value.consent === null,
)

// The public pages have their language in the address, so the banner speaks it (the app's own
// language, from a cookie, is used elsewhere).
const bannerLocale = computed(() => {
  if (route.path === '/ru' || route.path.startsWith('/ru/')) {
    return 'ru'
  }
  if (route.path === '/' || route.path.startsWith('/en/')) {
    return 'en'
  }
  return locale.value
})

const { t } = useI18n(
  {
    en: {
      accept: 'Accept',
      decline: 'Decline',
      text: 'We use cookies for analytics to understand how visitors use this site. By continuing to browse, you agree to their use.',
    },
    ru: {
      accept: 'Принять',
      decline: 'Отклонить',
      text: 'Мы используем файлы cookie для аналитики, чтобы понимать, как посетители используют этот сайт. Продолжая пользоваться сайтом, вы соглашаетесь с их использованием.',
    },
  },
  bannerLocale.value,
)

const accept = (): void => {
  localStorage.setItem(consentStorageKey, 'granted')
  gtag('consent', 'update', { analytics_storage: 'granted' })
  initialize()
  state.value = { ...state.value, consent: 'granted' }
}

const decline = (): void => {
  localStorage.setItem(consentStorageKey, 'denied')
  gtag('consent', 'update', { analytics_storage: 'denied' })
  state.value = { ...state.value, consent: 'denied' }
}
</script>

<style scoped>
.cookie-consent {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  bottom: 20px;
  box-shadow: var(--shadow-popover);
  display: flex;
  flex-direction: column;
  gap: 14px;
  left: 20px;
  margin-left: auto;
  max-width: 480px;
  padding: 18px 20px;
  position: fixed;
  right: 20px;
  z-index: 1000;
}

.text {
  color: var(--color-text);
  font-size: 13px;
  line-height: 1.5;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

@media (width <= 520px) {
  .cookie-consent {
    bottom: 12px;
    left: 12px;
    max-width: none;
    right: 12px;
  }
}
</style>
