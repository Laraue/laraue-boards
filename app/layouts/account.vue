<!-- Signed in, outside an organization. An expired session is sent to sign in by useApiClient. -->
<template>
  <AppStandaloneShell home-path="/organizations">
    <template #actions>
      <NuxtLink
        :aria-label="t('yourAccount')"
        class="header-btn"
        to="/account">
        <CircleUser />
      </NuxtLink>
    </template>
    <slot />
  </AppStandaloneShell>
</template>

<script setup lang="ts">
import { CircleUser } from '@lucide/vue'

const { t } = useI18n({
  en: { yourAccount: 'Your account' },
  ru: { yourAccount: 'Ваш аккаунт' },
})
</script>
