<template>
  <section class="space-about-fields">
    <BaseSectionHeader :title="t('about')" />
    <p class="muted hint">{{ t('aboutHint') }}</p>
    <MarkdownEditor
      v-model="description"
      :disabled="disabled"
      :label="t('description')"
      :placeholder="t('descriptionPlaceholder')" />

    <BaseSectionHeader :title="t('links')" />
    <p class="muted hint">{{ t('linksHint') }}</p>
    <ul
      v-if="links.length"
      class="space-links">
      <li
        v-for="(link, index) in links"
        :key="link.id ?? `new-${index}`"
        class="space-link">
        <BaseField
          :id="`space-link-${index}-url`"
          v-slot="{ id }"
          :label="t('url')">
          <BaseInput
            :id="id"
            :disabled="disabled"
            :model-value="link.url"
            :placeholder="t('urlPlaceholder')"
            :required="isFilled(link)"
            type="url"
            @update:model-value="change(index, { url: $event })" />
        </BaseField>
        <BaseField
          :id="`space-link-${index}-description`"
          :label="t('linkDescription')">
          <template #default="{ describedby, id }">
            <textarea
              :id="id"
              :aria-describedby="describedby"
              class="space-link-description"
              :disabled="disabled"
              :maxlength="MAX_LINK_DESCRIPTION_LENGTH"
              :placeholder="t('linkDescriptionPlaceholder')"
              :required="isFilled(link)"
              :value="link.description"
              @input="
                change(index, { description: ($event.target as HTMLTextAreaElement).value })
              " />
          </template>
        </BaseField>
        <BaseButton
          v-if="!disabled"
          class="space-link-remove"
          @click="remove(index)">
          <IconTrash />
          {{ t('remove') }}
        </BaseButton>
      </li>
    </ul>
    <p
      v-else
      class="muted">
      {{ t('noLinks') }}
    </p>
    <BaseButton
      v-if="!disabled"
      class="space-link-add"
      @click="add">
      <IconPlus />
      {{ t('addLink') }}
    </BaseButton>
  </section>
</template>

<script setup lang="ts">
import { IconPlus, IconTrash } from '@tabler/icons-vue'

import MarkdownEditor from '~/components/markdown-editor/MarkdownEditor.vue'

import type { SpaceLinkDraft } from '../../SpaceSettingsPage.deps'

defineProps<{ disabled: boolean }>()

const MAX_LINK_DESCRIPTION_LENGTH = 1024

const description = defineModel<string>('description', { required: true })
const links = defineModel<SpaceLinkDraft[]>('links', { required: true })

const { t } = useI18n({
  en: {
    about: 'About',
    aboutHint:
      'What this space is and how its work is organized. Shown on the space page and given to agents as context.',
    addLink: 'Add link',
    description: 'Description',
    descriptionPlaceholder: 'For example: the backend and web app of our tracker…',
    linkDescription: 'What it is',
    linkDescriptionPlaceholder: 'For example: the web app - board, issue and settings pages',
    links: 'Links',
    linksHint:
      "Where the space's work lives - repositories, docs, designs, dashboards - with what each is for. Shown to everyone on the space page and given to agents as context.",
    noLinks: 'No links yet.',
    remove: 'Remove',
    url: 'URL',
    urlPlaceholder: 'https://github.com/…',
  },
  ru: {
    about: 'Описание',
    aboutHint:
      'Что это за раздел и как в нём организована работа. Показывается на странице раздела и передаётся агентам как контекст.',
    addLink: 'Добавить ссылку',
    description: 'Описание',
    descriptionPlaceholder: 'Например: бэкенд и веб-приложение нашего трекера…',
    linkDescription: 'Что это',
    linkDescriptionPlaceholder: 'Например: веб-приложение - страницы досок, задач и настроек',
    links: 'Ссылки',
    linksHint:
      'Где находится работа раздела - репозитории, документация, дизайн, дашборды - и для чего каждая ссылка. Видны всем на странице раздела и передаются агентам как контекст.',
    noLinks: 'Ссылок пока нет.',
    remove: 'Убрать',
    url: 'URL',
    urlPlaceholder: 'https://github.com/…',
  },
})

// A row left empty is dropped on save, so it needs nothing filled in.
const isFilled = (link: SpaceLinkDraft): boolean => !!(link.url.trim() || link.description.trim())

const change = (index: number, patch: Partial<SpaceLinkDraft>): void => {
  links.value = links.value.map((link, i) => (i === index ? { ...link, ...patch } : link))
}

const add = (): void => {
  links.value = [...links.value, { description: '', url: '' }]
}

const remove = (index: number): void => {
  links.value = links.value.filter((_, i) => i !== index)
}
</script>

<style scoped>
.space-about-fields {
  display: grid;
  gap: var(--space-4);
}

.hint {
  margin: 0;
}

.space-links {
  display: grid;
  gap: var(--space-4);
  list-style: none;
  margin: 0;
  padding: 0;
}

.space-link {
  border-bottom: 1px solid var(--color-divider);
  display: grid;
  gap: var(--space-3);
  padding-bottom: var(--space-4);
}

.space-link-description {
  min-height: 4.5rem;
  resize: vertical;
  width: 100%;
}

.space-link-remove,
.space-link-add {
  justify-self: start;
}
</style>
