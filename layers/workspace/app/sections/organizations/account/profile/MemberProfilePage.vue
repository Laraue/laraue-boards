<template>
  <QueryState
    :data="data"
    :error-title="t('loadError')"
    :loading-text="t('loading')"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default>
      <section class="form-page">
        <BaseSectionHeader :title="t('profile')" />
        <form @submit.prevent="save">
          <BaseFieldGroup>
            <BaseField
              id="member-profile-name"
              v-slot="{ describedby }"
              :hint="t('nameHint')"
              :label="t('name')">
              <input
                id="member-profile-name"
                v-model="state.displayName"
                :aria-describedby="describedby"
                maxlength="129"
                :placeholder="t('namePlaceholder')" />
            </BaseField>
            <BaseField
              v-slot="{ labelId }"
              :label="t('color')">
              <AppColorPicker
                v-model="state.color"
                :aria-labelledby="labelId"
                :disabled="saving" />
            </BaseField>
          </BaseFieldGroup>
          <p
            v-if="state.saved"
            class="form-success">
            {{ t('changesSaved') }}
          </p>
          <p
            v-if="saveMessage"
            class="form-error">
            {{ saveMessage }}
          </p>
          <div class="form-actions">
            <BaseButton
              :disabled="saving"
              type="submit"
              variant="primary">
              {{ saving ? t('saving') : t('saveChanges') }}
            </BaseButton>
          </div>
        </form>
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseButton from '#layers/core/app/ui/components/BaseButton.vue'
import BaseField from '#layers/core/app/ui/components/BaseField.vue'
import BaseFieldGroup from '#layers/core/app/ui/components/BaseFieldGroup.vue'
import BaseSectionHeader from '#layers/core/app/ui/components/BaseSectionHeader.vue'
import AppColorPicker from '#layers/workspace/app/shared/components/AppColorPicker.vue'
import QueryState from '#layers/workspace/app/shared/components/QueryState.vue'
import { useApiAction } from '#layers/workspace/app/shared/composables/useApiAction'
import { useApiQuery } from '#layers/workspace/app/shared/composables/useApiQuery'

import type { MemberProfilePageDeps } from './MemberProfilePage.deps'

const props = defineProps<{
  deps: MemberProfilePageDeps
  onUpdated: () => Promise<void> | void
}>()

const { t } = useI18n({
  en: {
    changesSaved: 'Changes saved.',
    color: 'Color',
    loadError: 'Could not load your profile',
    loading: 'Loading your profile…',
    name: 'Name',
    nameHint:
      'How other members see you in this organization. Leave it empty to use your profile name.',
    namePlaceholder: 'Your name from your profile',
    profile: 'Profile',
    saveChanges: 'Save changes',
    saving: 'Saving…',
  },
  ru: {
    changesSaved: 'Изменения сохранены.',
    color: 'Цвет',
    loadError: 'Не удалось загрузить профиль',
    loading: 'Загрузка профиля…',
    name: 'Имя',
    nameHint:
      'Так вас видят другие участники этой организации. Оставьте пустым, чтобы взять имя из профиля.',
    namePlaceholder: 'Имя из вашего профиля',
    profile: 'Профиль',
    saveChanges: 'Сохранить изменения',
    saving: 'Сохранение…',
  },
})

const { data, message, pending, refresh } = await useApiQuery('member-profile', (signal) =>
  props.deps.view({ signal }),
)

const state = reactive({ color: '', displayName: '', saved: false })

watch(
  data,
  (profile) => {
    state.color = profile?.color ?? ''
    state.displayName = profile?.displayName ?? ''
  },
  { immediate: true },
)

const { execute: update, message: saveMessage, pending: saving } = useApiAction(props.deps.update)

const save = async (): Promise<void> => {
  state.saved = false
  if (await update({ color: state.color, displayName: state.displayName })) {
    // The saved name may come from the profile, so show what the server has now.
    await refresh()
    await props.onUpdated()
    state.saved = true
  }
}
</script>

<style scoped>
.form-page {
  align-content: start;
  display: grid;
  gap: var(--space-5);
}
</style>
