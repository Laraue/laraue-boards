<!-- Signed in, outside an organization. An expired session is sent to sign in by useApiClient. -->
<template>
  <AppStandaloneShell home-path="/organizations">
    <template #actions>
      <IconButton
        :label="t('yourAccount')"
        to="/account">
        <IconUserCircle />
      </IconButton>
    </template>
    <slot />
  </AppStandaloneShell>
</template>

<script setup lang="ts">
import { IconUserCircle } from '@tabler/icons-vue'

const { t } = useI18n({
  en: { yourAccount: 'Your account' },
  ru: { yourAccount: 'Ваш аккаунт' },
})
</script>
