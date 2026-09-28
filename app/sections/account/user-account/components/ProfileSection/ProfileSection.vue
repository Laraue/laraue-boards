<template>
  <section class="profile-section">
    <div class="section-heading">
      <h2>{{ t('profile') }}</h2>
      <p class="muted">{{ t('description') }}</p>
    </div>

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
            <div class="profile-field">
              <label for="profile-given-name">{{ t('givenName') }}</label>
              <input
                id="profile-given-name"
                v-model="state.givenName"
                autocomplete="given-name"
                maxlength="128" />
            </div>
            <div class="profile-field">
              <label for="profile-family-name">{{ t('familyName') }}</label>
              <input
                id="profile-family-name"
                v-model="state.familyName"
                autocomplete="family-name"
                maxlength="128" />
            </div>
          </div>

          <div class="profile-field">
            <label for="profile-display-name">{{ t('displayName') }}</label>
            <input
              id="profile-display-name"
              v-model="state.displayName"
              maxlength="257"
              required />
          </div>

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
              :disabled="saving || !state.displayName.trim()">
              {{ saving ? t('saving') : t('saveChanges') }}
            </button>
          </div>
        </form>
      </template>
    </QueryState>
  </section>
</template>

<script setup lang="ts">
import type { ProfileSectionDeps } from './ProfileSection.deps'
import type { GlobalProfile, UpdateGlobalProfileInput } from './ProfileSection.types'

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
} = await useQuery('account-global-profile', (_nuxtApp, { signal }) =>
  props.deps.view({ signal }),
)

const state = reactive({
  displayName: data.value?.displayName ?? '',
  familyName: data.value?.familyName ?? '',
  givenName: data.value?.givenName ?? '',
  saved: false,
})

const fill = (profile: GlobalProfile | undefined): void => {
  state.displayName = profile?.displayName ?? ''
  state.familyName = profile?.familyName ?? ''
  state.givenName = profile?.givenName ?? ''
}

watch(data, fill)

const {
  execute: update,
  message: saveMessage,
  pending: saving,
} = useAction<[UpdateGlobalProfileInput], GlobalProfile>(props.deps.update, {
  onSuccess: async (profile) => {
    // Shows the values as the server saved them.
    fill(profile)
    await props.onUpdated()
    state.saved = true
  },
})

const save = (): void => {
  state.saved = false
  void update({
    displayName: state.displayName,
    familyName: state.familyName,
    givenName: state.givenName,
  })
}
</script>

<style scoped>
.profile-section {
  display: grid;
  gap: var(--space-3);
}

.section-heading {
  display: grid;
  gap: var(--space-1);
}

.section-heading h2 {
  font-size: 16px;
  margin: 0;
}

.profile-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  display: grid;
  gap: var(--space-4);
  padding: var(--space-4);
}

.profile-names {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr 1fr;
}

.profile-field {
  display: grid;
  gap: var(--space-1);
}

.profile-field label {
  margin: 0;
}

@media (max-width: 767px) {
  .profile-names {
    grid-template-columns: 1fr;
  }
}
</style>
