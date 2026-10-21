<template>
  <QueryState
    :data="data"
    :error-title="t('loadError')"
    :loading-text="t('loading')"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: about }">
      <section class="space-about-settings">
        <BaseSectionHeader :title="t('about')" />
        <p class="muted hint">{{ t('aboutHint') }}</p>
        <form @submit.prevent="saveDescription">
          <MarkdownEditor
            v-model="state.description"
            :disabled="!about.canEdit || savingDescription"
            :label="t('description')"
            :placeholder="t('descriptionPlaceholder')" />
          <p
            v-if="descriptionMessage"
            class="form-error">
            {{ descriptionMessage }}
          </p>
          <div
            v-if="about.canEdit"
            class="form-actions">
            <BaseButton
              :loading="savingDescription"
              type="submit"
              variant="primary">
              {{ t('saveDescription') }}
            </BaseButton>
          </div>
        </form>

        <BaseSectionHeader :title="t('links')" />
        <p class="muted hint">{{ t('linksHint') }}</p>
        <ul
          v-if="about.links.length"
          class="space-links">
          <li
            v-for="link in about.links"
            :key="link.id"
            class="space-link">
            <form
              v-if="state.editingId === link.id"
              class="space-link-form"
              @submit.prevent="saveLink(link.id)">
              <BaseField
                :id="`space-link-${link.id}-url`"
                v-slot="{ id }"
                :label="t('url')">
                <BaseInput
                  :id="id"
                  v-model="state.edit.url"
                  required
                  type="url" />
              </BaseField>
              <BaseField
                :id="`space-link-${link.id}-description`"
                :label="t('linkDescription')">
                <template #default="{ describedby, id }">
                  <textarea
                    :id="id"
                    v-model="state.edit.description"
                    :aria-describedby="describedby"
                    class="space-link-description-input"
                    :maxlength="MAX_LINK_DESCRIPTION_LENGTH"
                    required />
                </template>
              </BaseField>
              <div class="form-actions">
                <BaseButton @click="state.editingId = undefined">{{ t('cancel') }}</BaseButton>
                <BaseButton
                  :loading="updatingLink"
                  type="submit"
                  variant="primary">
                  {{ t('save') }}
                </BaseButton>
              </div>
            </form>
            <template v-else>
              <div class="space-link-text">
                <a
                  :href="link.url"
                  rel="noopener noreferrer"
                  target="_blank">
                  {{ link.url }}
                </a>
                <p class="muted">{{ link.description }}</p>
              </div>
              <div
                v-if="about.canEdit"
                class="space-link-actions">
                <BaseButton
                  :disabled="busy"
                  @click="startEdit(link)">
                  {{ t('edit') }}
                </BaseButton>
                <BaseButton
                  :disabled="busy"
                  variant="danger"
                  @click="removeLink(link.id)">
                  {{ t('delete') }}
                </BaseButton>
              </div>
            </template>
          </li>
        </ul>
        <p
          v-else
          class="muted">
          {{ t('noLinks') }}
        </p>
        <p
          v-if="linkMessage"
          class="form-error">
          {{ linkMessage }}
        </p>

        <form
          v-if="about.canEdit"
          class="space-link-form"
          @submit.prevent="addLink">
          <BaseField
            id="space-link-new-url"
            v-slot="{ id }"
            :label="t('url')">
            <BaseInput
              :id="id"
              v-model="state.added.url"
              :placeholder="t('urlPlaceholder')"
              required
              type="url" />
          </BaseField>
          <BaseField
            id="space-link-new-description"
            :label="t('linkDescription')">
            <template #default="{ describedby, id }">
              <textarea
                :id="id"
                v-model="state.added.description"
                :aria-describedby="describedby"
                class="space-link-description-input"
                :maxlength="MAX_LINK_DESCRIPTION_LENGTH"
                :placeholder="t('linkDescriptionPlaceholder')"
                required />
            </template>
          </BaseField>
          <div class="form-actions">
            <BaseButton
              :loading="creatingLink"
              type="submit">
              <IconPlus />
              {{ t('addLink') }}
            </BaseButton>
          </div>
        </form>
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { IconPlus } from '@tabler/icons-vue'

import MarkdownEditor from '~/components/markdown-editor/MarkdownEditor.vue'

import type { SpaceAboutSettingsDeps } from './SpaceAboutSettings.deps'
import type { SpaceLinkItem } from './SpaceAboutSettings.types'

const props = defineProps<{ deps: SpaceAboutSettingsDeps; spaceKey: string }>()

const MAX_LINK_DESCRIPTION_LENGTH = 1024

const confirm = useConfirm()
const { t } = useI18n({
  en: {
    about: 'About',
    aboutHint:
      'What this space is and how its work is organized. Shown on the space page and given to agents as context.',
    addLink: 'Add link',
    cancel: 'Cancel',
    delete: 'Delete',
    deleteConfirm: 'Delete this link?',
    description: 'Description',
    descriptionPlaceholder: 'For example: the backend and web app of our tracker…',
    edit: 'Edit',
    linkDescription: 'What it is',
    linkDescriptionPlaceholder: 'For example: Nuxt web app; run pnpm pre-commit before committing',
    links: 'Links',
    linksHint:
      "The space's repositories, docs, designs and dashboards. The agent works in the repositories it finds on your machine.",
    loadError: 'Could not load the description and links',
    loading: 'Loading…',
    noLinks: 'No links yet.',
    save: 'Save',
    saveDescription: 'Save description',
    url: 'URL',
    urlPlaceholder: 'https://github.com/…',
  },
  ru: {
    about: 'Описание',
    aboutHint:
      'Что это за раздел и как в нём организована работа. Показывается на странице раздела и передаётся агентам как контекст.',
    addLink: 'Добавить ссылку',
    cancel: 'Отмена',
    delete: 'Удалить',
    deleteConfirm: 'Удалить эту ссылку?',
    description: 'Описание',
    descriptionPlaceholder: 'Например: бэкенд и веб-приложение нашего трекера…',
    edit: 'Изменить',
    linkDescription: 'Что это',
    linkDescriptionPlaceholder:
      'Например: веб-приложение на Nuxt; перед коммитом запускайте pnpm pre-commit',
    links: 'Ссылки',
    linksHint:
      'Репозитории, документация, дизайн и дашборды раздела. Агент работает в тех репозиториях, которые найдёт на вашем компьютере.',
    loadError: 'Не удалось загрузить описание и ссылки',
    loading: 'Загрузка…',
    noLinks: 'Ссылок пока нет.',
    save: 'Сохранить',
    saveDescription: 'Сохранить описание',
    url: 'URL',
    urlPlaceholder: 'https://github.com/…',
  },
})

const state = reactive<{
  added: { description: string; url: string }
  description: string
  edit: { description: string; url: string }
  editingId: string | undefined
}>({
  added: { description: '', url: '' },
  description: '',
  edit: { description: '', url: '' },
  editingId: undefined,
})

const { data, message, pending, refresh } = await useApiQuery(
  () => `space-about-settings:${props.spaceKey}`,
  (signal) => props.deps.view({ signal, spaceKey: props.spaceKey }),
)

watch(
  data,
  (value) => {
    if (value) {
      state.description = value.description
    }
  },
  { immediate: true },
)

const {
  execute: executeSaveDescription,
  message: descriptionMessage,
  pending: savingDescription,
} = useApiAction(props.deps.saveDescription)
const {
  execute: executeCreateLink,
  message: createMessage,
  pending: creatingLink,
} = useApiAction(props.deps.createLink)
const {
  execute: executeUpdateLink,
  message: updateMessage,
  pending: updatingLink,
} = useApiAction(props.deps.updateLink)
const {
  execute: executeDeleteLink,
  message: deleteMessage,
  pending: deletingLink,
} = useApiAction(props.deps.deleteLink)

const busy = computed(() => creatingLink.value || updatingLink.value || deletingLink.value)
const linkMessage = computed(
  () => createMessage.value || updateMessage.value || deleteMessage.value,
)

const saveDescription = async (): Promise<void> => {
  await executeSaveDescription({ description: state.description, spaceKey: props.spaceKey })
}

const addLink = async (): Promise<void> => {
  const added = await executeCreateLink({
    description: state.added.description.trim(),
    spaceKey: props.spaceKey,
    url: state.added.url.trim(),
  })
  if (added) {
    state.added = { description: '', url: '' }
    await refresh()
  }
}

const startEdit = (link: SpaceLinkItem): void => {
  state.edit = { description: link.description, url: link.url }
  state.editingId = link.id
}

const saveLink = async (id: string): Promise<void> => {
  const saved = await executeUpdateLink({
    description: state.edit.description.trim(),
    id,
    spaceKey: props.spaceKey,
    url: state.edit.url.trim(),
  })
  if (saved) {
    state.editingId = undefined
    await refresh()
  }
}

const removeLink = async (id: string): Promise<void> => {
  if (
    (await confirm({ danger: true, title: t('deleteConfirm') })) &&
    (await executeDeleteLink({ id, spaceKey: props.spaceKey }))
  ) {
    await refresh()
  }
}
</script>

<style scoped>
.space-about-settings {
  display: grid;
  gap: var(--space-4);
}

.hint {
  margin: 0;
}

.space-links {
  display: grid;
  list-style: none;
  margin: 0;
  padding: 0;
}

.space-link {
  align-items: start;
  border-bottom: 1px solid var(--color-divider);
  display: flex;
  gap: var(--space-4);
  padding: var(--space-3) 0;
}

.space-link-text {
  flex: 1;
  min-width: 0;
}

.space-link-text a {
  font-weight: var(--font-weight-medium);
  overflow-wrap: anywhere;
}

.space-link-text p {
  margin: var(--space-1) 0 0;
  white-space: pre-line;
}

.space-link-actions {
  display: flex;
  flex: none;
  gap: var(--space-2);
}

.space-link-form {
  display: grid;
  flex: 1;
  gap: var(--space-3);
}

.space-link-description-input {
  min-height: 4.5rem;
  resize: vertical;
  width: 100%;
}
</style>
