<template>
  <section class="profile-section">
    <BaseSectionHeader
      :description="t('description')"
      :title="t('profile')" />

    <QueryState
      :data="data"
      :error-title="t('loadError')"
      :loading-text="t('loading')"
      :message="queryMessage"
      :on-retry="refresh"
      :pending="pending">
      <template #default>
        <form
          class="profile-card"
          @submit.prevent="save">
          <div class="profile-names">
            <BaseField
              id="profile-given-name"
              :label="t('givenName')">
              <input
                id="profile-given-name"
                v-model="state.givenName"
                autocomplete="given-name"
                maxlength="128" />
            </BaseField>
            <BaseField
              id="profile-family-name"
              :label="t('familyName')">
              <input
                id="profile-family-name"
                v-model="state.familyName"
                autocomplete="family-name"
                maxlength="128" />
            </BaseField>
          </div>

          <BaseField
            id="profile-display-name"
            :label="t('displayName')">
            <input
              id="profile-display-name"
              v-model="state.displayName"
              maxlength="257"
              required />
          </BaseField>

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
              :disabled="saving || !state.displayName.trim()"
              type="submit"
              variant="primary">
              {{ saving ? t('saving') : t('saveChanges') }}
            </BaseButton>
          </div>
        </form>
      </template>
    </QueryState>
  </section>
</template>

<script setup lang="ts">
import type { ProfileSectionDeps } from './ProfileSection.deps'
import type { GlobalProfile } from './ProfileSection.deps'

const props = defineProps<{
  deps: ProfileSectionDeps
  onUpdated: () => Promise<void> | void
}>()

const { t } = useI18n({
  en: {
    changesSaved: 'Changes saved.',
    description:
      'Used as your defaults when you create or join an organization. After that, change them in the organization’s own profile settings.',
    displayName: 'Display name',
    familyName: 'Family name',
    givenName: 'Given name',
    loadError: 'Could not load your profile',
    loading: 'Loading your profile…',
    profile: 'Profile',
    saveChanges: 'Save changes',
    saving: 'Saving…',
  },
  ru: {
    changesSaved: 'Изменения сохранены.',
    description:
      'Используются по умолчанию, когда вы создаёте организацию или вступаете в неё. Потом их меняют в настройках профиля самой организации.',
    displayName: 'Отображаемое имя',
    familyName: 'Фамилия',
    givenName: 'Имя',
    loadError: 'Не удалось загрузить профиль',
    loading: 'Загрузка профиля…',
    profile: 'Профиль',
    saveChanges: 'Сохранить изменения',
    saving: 'Сохранение…',
  },
})

const {
  data,
  message: queryMessage,
  pending,
  refresh,
} = await useApiQuery('account-global-profile', (signal) => props.deps.view({ signal }))

const state = reactive({ displayName: '', familyName: '', givenName: '', saved: false })

const fill = (profile: GlobalProfile | undefined): void => {
  state.displayName = profile?.displayName ?? ''
  state.familyName = profile?.familyName ?? ''
  state.givenName = profile?.givenName ?? ''
}

watch(data, fill, { immediate: true })

const { execute: update, message: saveMessage, pending: saving } = useApiAction(props.deps.update)

const save = async (): Promise<void> => {
  state.saved = false
  const saved = await update({
    displayName: state.displayName,
    familyName: state.familyName,
    givenName: state.givenName,
  })
  if (saved) {
    // Shows the values as the server saved them.
    fill(saved.value)
    await props.onUpdated()
    state.saved = true
  }
}
</script>

<style scoped>
.profile-section {
  display: grid;
  gap: var(--space-3);
}

/* A form sits on the page, not in a card. */
.profile-card {
  display: grid;
  gap: var(--space-5);
}

.profile-names {
  display: grid;
  gap: var(--space-5);
  grid-template-columns: 1fr 1fr;
}

@media (max-width: 767px) {
  .profile-names {
    grid-template-columns: 1fr;
  }
}
</style>
