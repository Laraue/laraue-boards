<!-- Signed in, outside an organization. Each page explicitly wires its session redirect policy. -->
<template>
  <AppStandaloneShell home-path="/organizations">
    <template #actions>
      <BaseIconButton
        :label="t('yourAccount')"
        to="/account">
        <IconUserCircle />
      </BaseIconButton>
    </template>
    <slot />
  </AppStandaloneShell>
</template>

<script setup lang="ts">
import { IconUserCircle } from '@tabler/icons-vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseIconButton from '#layers/core/app/ui/components/BaseIconButton.vue'
import AppStandaloneShell from '#layers/workspace/app/shells/standalone/AppStandaloneShell.vue'

const { t } = useI18n({
  en: { yourAccount: 'Your account' },
  ru: { yourAccount: 'Ваш аккаунт' },
})
</script>
