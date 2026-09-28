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
        <form @submit.prevent="save">
          <label for="member-profile-name">{{ t('name') }}</label>
          <input
            id="member-profile-name"
            v-model="state.displayName"
            maxlength="129"
            :placeholder="t('namePlaceholder')" />
          <p class="muted">{{ t('nameHint') }}</p>
          <label>{{ t('color') }}</label>
          <AppColorPicker
            v-model="state.color"
            :disabled="saving" />
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
            <button
              class="primary"
              :disabled="saving">
              {{ saving ? t('saving') : t('saveChanges') }}
            </button>
          </div>
        </form>
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import type { MemberProfilePageDeps } from './MemberProfilePage.deps'
import type { UpdateMemberProfileInput } from './MemberProfilePage.types'

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
    saveChanges: 'Сохранить изменения',
    saving: 'Сохранение…',
  },
})

const { data, message, pending, refresh } = await useQuery(
  'member-profile',
  (_nuxtApp, { signal }) => props.deps.view({ signal }),
)

const state = reactive({
  color: data.value?.color ?? '',
  displayName: data.value?.displayName ?? '',
  saved: false,
})

watch(data, (profile) => {
  state.color = profile?.color ?? ''
  state.displayName = profile?.displayName ?? ''
})

const {
  execute: update,
  message: saveMessage,
  pending: saving,
} = useAction<[UpdateMemberProfileInput], true>(props.deps.update, {
  onSuccess: async () => {
    // The saved name may come from the profile, so show what the server has now.
    await refresh()
    await props.onUpdated()
    state.saved = true
  },
})

const save = (): void => {
  state.saved = false
  void update({ color: state.color, displayName: state.displayName })
}
</script>
