<template>
  <QueryState
    :data="data"
    :error-title="t('loadError')"
    :loading-text="t('loading')"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default>
      <fieldset
        :aria-label="t('assignees')"
        class="assignee-options">
        <BaseCheckbox
          v-for="option in options"
          :key="option.value"
          :model-value="modelValue.includes(option.value)"
          @update:model-value="toggle(option.value)">
          <span class="assignee-option">
            <BaseAvatar
              aria-hidden="true"
              :color="option.color"
              :initials="option.initials"
              size="sm" />
            <span>
              {{ option.label }}
              <span
                v-if="option.isCurrentUser"
                class="muted">
                ({{ t('me') }})
              </span>
            </span>
          </span>
        </BaseCheckbox>
        <p
          v-if="!options.length"
          class="muted">
          {{ t('empty') }}
        </p>
      </fieldset>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseAvatar from '#layers/core/app/ui/components/BaseAvatar.vue'
import BaseCheckbox from '#layers/core/app/ui/components/BaseCheckbox.vue'
import type { AssigneeSelectDeps } from '#layers/workspace/app/shared/components/AssigneeSelect/AssigneeSelect.deps'
import QueryState from '#layers/workspace/app/shared/components/QueryState.vue'
import { useApiQuery } from '#layers/workspace/app/shared/composables/useApiQuery'

const props = defineProps<{
  deps: AssigneeSelectDeps
  modelValue: string[]
  spaceKey?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()
const { t } = useI18n({
  en: {
    assignees: 'Assignees',
    empty: 'No assignees available',
    loadError: 'Could not load assignees',
    loading: 'Loading assignees…',
    me: 'me',
  },
  ru: {
    assignees: 'Исполнители',
    empty: 'Нет доступных исполнителей',
    loadError: 'Не удалось загрузить исполнителей',
    loading: 'Загрузка исполнителей…',
    me: 'я',
  },
})
const { data, message, pending, refresh } = await useApiQuery(
  `issue-assignee-filter:${useId()}`,
  (signal) => props.deps.loadAssignees({ signal, spaceKey: props.spaceKey }),
)
const options = computed(() =>
  (data.value ?? []).toSorted((a, b) => Number(b.isCurrentUser) - Number(a.isCurrentUser)),
)
const toggle = (id: string) => {
  emit(
    'update:modelValue',
    props.modelValue.includes(id)
      ? props.modelValue.filter((value) => value !== id)
      : [...props.modelValue, id],
  )
}
</script>

<style scoped>
.assignee-options {
  border: 0;
  display: grid;
  margin: 0;
  min-width: 0;
  padding: 0;
}

.assignee-options :deep(.base-checkbox) {
  border-radius: var(--radius-control);
  flex-direction: row-reverse;
  overflow-wrap: anywhere;
  padding-inline: var(--space-2);
}

.assignee-options :deep(.base-checkbox > span) {
  flex: 1;
}

.assignee-option {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-width: 0;
}
</style>
