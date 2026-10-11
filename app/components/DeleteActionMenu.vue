<template>
  <BaseMenu align="end">
    <template #trigger>
      <BaseIconButton :label="t('actions')">
        <IconDots />
      </BaseIconButton>
    </template>
    <BaseMenuItem
      :disabled="disabled"
      :loading="loading"
      variant="danger"
      @select="onDelete">
      <IconTrash />
      {{ label }}
    </BaseMenuItem>
  </BaseMenu>
</template>

<script setup lang="ts">
import { IconDots, IconTrash } from '@tabler/icons-vue'

defineProps<{
  disabled?: boolean
  label: string
  loading?: boolean
  onDelete: () => Promise<void> | void
}>()

const { t } = useI18n({ en: { actions: 'Actions' }, ru: { actions: 'Действия' } })
</script>
