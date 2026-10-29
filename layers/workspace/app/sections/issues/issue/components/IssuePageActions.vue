<template>
  <div class="issue-page-actions">
    <DeleteActionMenu
      :disabled="saving || locked"
      :label="t('deleteIssue')"
      :loading="deleting"
      :on-delete="onDelete" />
    <BaseButton
      :aria-label="t('saveChanges')"
      :disabled="!canSave || deleting"
      :form="formId"
      :loading="saving"
      type="submit"
      variant="primary">
      <IconCheck />
      <span class="save-label">{{ t('saveChanges') }}</span>
      <span class="save-label-mobile">{{ t('save') }}</span>
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { IconCheck } from '@tabler/icons-vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseButton from '#layers/core/app/ui/components/BaseButton.vue'
import DeleteActionMenu from '#layers/workspace/app/shared/components/DeleteActionMenu.vue'

defineProps<{
  canSave: boolean
  deleting: boolean
  formId: string
  // Handed to the agent: the issue can't be deleted until the run ends.
  locked: boolean
  onDelete: () => Promise<void> | void
  saving: boolean
}>()

const { t } = useI18n({
  en: {
    deleteIssue: 'Delete issue',
    save: 'Save',
    saveChanges: 'Save changes',
  },
  ru: {
    deleteIssue: 'Удалить задачу',
    save: 'Сохранить',
    saveChanges: 'Сохранить изменения',
  },
})
</script>

<style scoped>
.issue-page-actions {
  align-items: center;
  display: flex;
  gap: var(--space-2);
}

.save-label-mobile {
  display: none;
}

@media (max-width: 767px) {
  .save-label {
    display: none;
  }

  .save-label-mobile {
    display: block;
  }
}
</style>
