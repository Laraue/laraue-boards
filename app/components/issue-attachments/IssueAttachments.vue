<template>
  <div class="issue-attachments">
    <input
      ref="inputEl"
      :accept="ATTACHMENT_ACCEPT"
      aria-hidden="true"
      class="issue-attachment-input"
      :disabled="disabled"
      multiple
      tabindex="-1"
      type="file"
      @change="changeFiles" />
    <span
      v-if="attachmentError"
      class="issue-attachment-error"
      role="alert">
      {{ attachmentError }}
    </span>
    <div
      v-if="visibleImages.length || pendingImages.length"
      class="issue-attachment-gallery">
      <div
        v-for="(attachment, index) in visibleImages"
        :key="attachment.id"
        class="issue-attachment-preview">
        <button
          :aria-label="`${t('openAttachment')} ${index + 1}`"
          class="issue-attachment-open"
          type="button"
          @click="openLightbox(attachment.originalUrl, `${t('attachment')} ${index + 1}`)">
          <img
            :alt="`${t('attachment')} ${index + 1}`"
            :src="attachment.previewUrl" />
        </button>
        <BaseIconButton
          v-if="onRemoveAttachment && !disabled"
          class="issue-attachment-remove"
          :label="`${t('removeAttachment')} ${index + 1}`"
          @click="onRemoveAttachment(attachment.id)">
          <IconX />
        </BaseIconButton>
      </div>
      <div
        v-for="preview in pendingImages"
        :key="preview.url"
        class="issue-attachment-preview">
        <button
          :aria-label="`${t('open')} ${preview.file.name}`"
          class="issue-attachment-open"
          :disabled="disabled"
          type="button"
          @click="openLightbox(preview.url, preview.file.name)">
          <img
            :alt="preview.file.name"
            :src="preview.url" />
          <span>{{ preview.file.name }}</span>
        </button>
        <BaseIconButton
          v-if="!disabled"
          class="issue-attachment-remove"
          :label="`${t('remove')} ${preview.file.name}`"
          @click="removeFile(preview.file)">
          <IconX />
        </BaseIconButton>
        <div
          v-if="disabled"
          :aria-label="t('uploading')"
          class="issue-attachment-uploading"
          role="status">
          <IconLoader />
        </div>
      </div>
    </div>
    <!-- Documents have no preview: a file with its name and size, opened as a download. -->
    <ul
      v-if="visibleDocuments.length || pendingDocuments.length"
      class="issue-attachment-files">
      <li
        v-for="attachment in visibleDocuments"
        :key="attachment.id"
        class="issue-attachment-file">
        <a
          class="issue-attachment-file-link"
          download
          :href="attachment.url"
          rel="noopener">
          <IconFileText />
          <span class="issue-attachment-file-name">{{ attachment.fileName || t('document') }}</span>
          <span
            v-if="attachment.fileSize !== undefined"
            class="issue-attachment-file-size">
            {{ formatFileSize(attachment.fileSize) }}
          </span>
        </a>
        <BaseIconButton
          v-if="onRemoveAttachment && !disabled"
          class="issue-attachment-file-remove"
          :label="`${t('remove')} ${attachment.fileName || t('document')}`"
          @click="onRemoveAttachment(attachment.id)">
          <IconX />
        </BaseIconButton>
      </li>
      <li
        v-for="file in pendingDocuments"
        :key="`${file.name}-${file.size}-${file.lastModified}`"
        class="issue-attachment-file">
        <span class="issue-attachment-file-link">
          <IconLoader
            v-if="disabled"
            :aria-label="t('uploading')"
            class="issue-attachment-file-uploading"
            role="status" />
          <IconFileText v-else />
          <span class="issue-attachment-file-name">{{ file.name }}</span>
          <span class="issue-attachment-file-size">{{ formatFileSize(file.size) }}</span>
        </span>
        <BaseIconButton
          v-if="!disabled"
          class="issue-attachment-file-remove"
          :label="`${t('remove')} ${file.name}`"
          @click="removeFile(file)">
          <IconX />
        </BaseIconButton>
      </li>
    </ul>
    <DialogRoot
      :open="activeAttachment !== null"
      @update:open="(open) => !open && closeLightbox()">
      <DialogPortal>
        <DialogOverlay class="base-dialog-overlay issue-attachment-lightbox-overlay" />
        <DialogContent
          :aria-describedby="undefined"
          class="issue-attachment-lightbox"
          @click="closeLightboxFromBackdrop"
          @open-auto-focus="focusLightbox">
          <VisuallyHidden>
            <DialogTitle>{{ t('attachmentPreview') }}</DialogTitle>
          </VisuallyHidden>
          <BaseIconButton
            class="issue-attachment-lightbox-close"
            :label="t('closePreview')"
            @click="closeLightbox">
            <IconX />
          </BaseIconButton>
          <img
            v-if="activeAttachment"
            :alt="activeAttachment.alt"
            :src="activeAttachment.url"
            @error="lightboxLoading = false"
            @load="lightboxLoading = false" />
          <div
            v-if="lightboxLoading"
            :aria-label="t('loadingPreview')"
            class="issue-attachment-lightbox-loading"
            role="status">
            <IconLoader />
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </div>
</template>

<script setup lang="ts">
import { IconFileText, IconLoader, IconX } from '@tabler/icons-vue'
import {
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  VisuallyHidden,
} from 'reka-ui'

import {
  ATTACHMENT_ACCEPT,
  DOCUMENT_EXTENSIONS,
  IMAGE_TYPES,
  MAX_DOCUMENT_SIZE,
  MAX_IMAGE_SIZE,
} from '~/constants/attachments'

import type { IssueAttachmentViewModel } from './IssueAttachments.types'

const props = defineProps<{
  attachments: IssueAttachmentViewModel[]
  disabled: boolean
  // Without onChange the attachments are only shown (a comment's): nothing is picked or pasted.
  files?: File[]
  onChange?: (files: File[]) => void
  onRemoveAttachment?: (id: string) => void
  removedAttachmentIds?: string[]
}>()

const { t } = useI18n({
  en: {
    attachment: 'Attachment',
    attachmentPreview: 'Attachment preview',
    closePreview: 'Close attachment preview',
    document: 'Document',
    kilobytes: '{size} KB',
    loadingPreview: 'Loading attachment preview',
    megabytes: '{size} MB',
    open: 'Open',
    openAttachment: 'Open attachment',
    remove: 'Remove',
    removeAttachment: 'Remove attachment',
    tooLarge: 'Some files were not added: images are limited to 3 MB, documents to 10 MB.',
    unsupported:
      'Some files were not added: only images (JPEG, PNG, WebP, GIF) and documents (PDF, DOCX, DOC, Markdown, TXT, JSON) can be attached.',
    uploading: 'Uploading attachment',
  },
  ru: {
    attachment: 'Вложение',
    attachmentPreview: 'Предпросмотр вложения',
    closePreview: 'Закрыть предпросмотр вложения',
    document: 'Документ',
    kilobytes: '{size} КБ',
    loadingPreview: 'Загрузка предпросмотра вложения',
    megabytes: '{size} МБ',
    open: 'Открыть',
    openAttachment: 'Открыть вложение',
    remove: 'Удалить',
    removeAttachment: 'Удалить вложение',
    tooLarge:
      'Некоторые файлы не добавлены: изображения — не больше 3 МБ, документы — не больше 10 МБ.',
    unsupported:
      'Некоторые файлы не добавлены: прикрепить можно только изображения (JPEG, PNG, WebP, GIF) и документы (PDF, DOCX, DOC, Markdown, TXT, JSON).',
    uploading: 'Загрузка вложения',
  },
})

const activeAttachment = ref<null | { alt: string; url: string }>(null)
const attachmentError = ref('')
const inputEl = useTemplateRef('inputEl')
const lightboxLoading = ref(false)
const pendingImages = ref<Array<{ file: File; url: string }>>([])
const visibleAttachments = computed(() =>
  props.attachments.filter((attachment) => !props.removedAttachmentIds?.includes(attachment.id)),
)
const visibleImages = computed(() =>
  visibleAttachments.value.flatMap((attachment) =>
    attachment.kind === 'image' ? [attachment] : [],
  ),
)
const visibleDocuments = computed(() =>
  visibleAttachments.value.flatMap((attachment) =>
    attachment.kind === 'document' ? [attachment] : [],
  ),
)
const pendingDocuments = computed(() =>
  (props.files ?? []).filter((file) => getFileKind(file) === 'document'),
)

const extensionOf = (file: File) => {
  const dot = file.name.lastIndexOf('.')
  return dot === -1 ? '' : file.name.slice(dot).toLowerCase()
}

const includes = (values: readonly string[], value: string) => values.includes(value)

const getFileKind = (file: File): 'document' | 'image' | null => {
  if (
    includes(IMAGE_TYPES.mimeTypes, file.type) ||
    includes(IMAGE_TYPES.extensions, extensionOf(file))
  ) {
    return 'image'
  }
  return includes(DOCUMENT_EXTENSIONS, extensionOf(file)) ? 'document' : null
}

const maxSizeOf = (kind: 'document' | 'image') =>
  kind === 'image' ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE

const changeFiles = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = getSupportedFiles(input.files ?? [])
  input.value = ''
  if (files.length) {
    props.onChange?.(files)
  }
}

const pasteFiles = (event: ClipboardEvent) => {
  if (props.disabled || !props.onChange) {
    return
  }
  const pastedFiles = getSupportedFiles(event.clipboardData?.files ?? [])
  if (!pastedFiles.length) {
    return
  }
  event.preventDefault()
  if (inputEl.value) {
    inputEl.value.value = ''
  }
  props.onChange([...(props.files ?? []), ...pastedFiles])
}

const getSupportedFiles = (files: File[] | FileList) => {
  const all = Array.from(files)
  const supported = all.flatMap((file) => {
    const kind = getFileKind(file)
    return kind ? [{ file, kind }] : []
  })
  const fitting = supported.filter(({ file, kind }) => file.size <= maxSizeOf(kind))
  attachmentError.value =
    supported.length < all.length
      ? t('unsupported')
      : fitting.length < supported.length
        ? t('tooLarge')
        : ''
  return fitting.map(({ file }) => file)
}

// Decimal units, like the limits.
const formatFileSize = (size: number) =>
  size < 1_000_000
    ? t('kilobytes', { size: Math.max(1, Math.round(size / 1_000)) })
    : t('megabytes', { size: (size / 1_000_000).toFixed(1) })

const removeFile = (file: File) => {
  if (inputEl.value) {
    inputEl.value.value = ''
  }
  props.onChange?.((props.files ?? []).filter((pending) => pending !== file))
}

const revokePreviews = () => {
  for (const preview of pendingImages.value) {
    URL.revokeObjectURL(preview.url)
  }
}

const openLightbox = (url: string, alt: string) => {
  lightboxLoading.value = true
  activeAttachment.value = { alt, url }
}

const closeLightbox = () => {
  activeAttachment.value = null
  lightboxLoading.value = false
}

// Focus the preview itself: on the close button its tooltip would show at once.
const focusLightbox = (event: Event) => {
  event.preventDefault()
  if (event.target instanceof HTMLElement) {
    event.target.focus({ preventScroll: true })
  }
}

// The content fills the screen around the image: a click beside the image closes the preview.
const closeLightboxFromBackdrop = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeLightbox()
  }
}

watch(
  () => props.files,
  (files) => {
    revokePreviews()
    pendingImages.value = (files ?? [])
      .filter((file) => getFileKind(file) === 'image')
      .map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }))
  },
  { immediate: true },
)

// Only where files can be added: shown attachments (a comment's) mustn't take the page's pastes.
onMounted(() => {
  if (props.onChange) {
    window.addEventListener('paste', pasteFiles)
  }
})
onBeforeUnmount(() => {
  revokePreviews()
  window.removeEventListener('paste', pasteFiles)
})

// The page has the button for it (a paperclip by the description).
defineExpose({ pick: () => inputEl.value?.click() })
</script>

<style scoped>
/* Only a hidden input until there is something to show. */
.issue-attachments:not(
  :has(.issue-attachment-gallery, .issue-attachment-files, .issue-attachment-error)
) {
  display: none;
}

.issue-attachments {
  display: grid;
  gap: var(--space-3);
  position: relative;
}

.issue-attachment-gallery {
  --attachment-size: 64px;
  display: grid;
  gap: var(--space-2);
  grid-auto-rows: var(--attachment-size);
  grid-template-columns: repeat(auto-fill, var(--attachment-size));
}

.issue-attachment-preview {
  background: var(--color-feed);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-control);
  overflow: hidden;
  position: relative;
}

.issue-attachment-open {
  background: transparent;
  border: 0;
  color: inherit;
  cursor: zoom-in;
  height: 100%;
  padding: 0;
  width: 100%;
}

.issue-attachment-open:disabled {
  cursor: wait;
}

.issue-attachment-gallery img {
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.issue-attachment-preview .issue-attachment-open > span {
  background: color-mix(in srgb, var(--color-surface) 88%, transparent);
  bottom: 0;
  font-size: var(--font-size-caption);
  inset-inline: 0;
  overflow: hidden;
  padding: var(--space-1) var(--space-2);
  position: absolute;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.issue-attachment-files {
  display: grid;
  gap: var(--space-1);
  list-style: none;
  margin: 0;
  padding: 0;
}

.issue-attachment-file {
  align-items: center;
  background: var(--color-feed);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-control);
  display: flex;
  gap: var(--space-2);
  min-width: 0;
  padding-inline-end: var(--space-1);
}

.issue-attachment-file-link {
  align-items: center;
  color: inherit;
  display: flex;
  flex: 1;
  gap: var(--space-2);
  min-width: 0;
  padding: var(--space-2);
  text-decoration: none;
}

a.issue-attachment-file-link:hover .issue-attachment-file-name {
  text-decoration: underline;
}

.issue-attachment-file-link svg {
  color: var(--color-muted);
  flex: none;
  height: var(--icon-size);
  width: var(--icon-size);
}

.issue-attachment-file-link .issue-attachment-file-uploading {
  animation: var(--animation-spin);
}

.issue-attachment-file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.issue-attachment-file-size {
  color: var(--color-muted);
  flex: none;
  font-size: var(--font-size-caption);
}

:deep(.issue-attachment-file-remove) {
  --icon-btn-size: var(--icon-btn-size-small);
}

.issue-attachment-uploading {
  align-items: center;
  background: color-mix(in srgb, var(--color-feed) 85%, transparent);
  display: flex;
  inset: 0;
  justify-content: center;
  position: absolute;
}

.issue-attachment-uploading svg {
  animation: var(--animation-spin);
  color: var(--color-muted);
  height: var(--icon-size);
  width: var(--icon-size);
}

:deep(.issue-attachment-remove) {
  --icon-btn-size: var(--icon-btn-size-small);

  background: var(--color-feed);
  position: absolute;
  right: var(--space-1);
  top: var(--space-1);
  z-index: 1;
}

@media (hover: hover) and (pointer: fine) {
  .issue-attachment-preview:not(:hover, :focus-within) :deep(.issue-attachment-remove) {
    opacity: 0;
  }
}

.issue-attachment-input {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

.issue-attachment-error {
  color: var(--color-danger);
  font-size: var(--font-size-small);
}

.issue-attachment-lightbox {
  background: transparent;
  border: 0;
  border-radius: 0;
  box-sizing: border-box;
  display: grid;
  grid-template: minmax(0, 1fr) / minmax(0, 1fr);
  inset: 0;
  outline: none;
  overflow: hidden;
  padding: var(--space-8);
  place-items: center;
  position: fixed;
  z-index: 48;
}

.issue-attachment-lightbox > img {
  height: auto;
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
  width: auto;
}

.issue-attachment-lightbox-loading {
  align-items: center;
  display: flex;
  inset: 0;
  justify-content: center;
  pointer-events: none;
  position: fixed;
}

.issue-attachment-lightbox-loading svg {
  animation: var(--animation-spin);
  color: var(--color-accent);
  height: 24px;
  width: 24px;
}

.issue-attachment-lightbox :deep(.issue-attachment-lightbox-close) {
  position: fixed;
  right: var(--space-4);
  top: var(--space-4);
  z-index: 1;
}

/* Darker than a dialog's backdrop: the image is the only thing to look at. */
/* Above the issue dialog it opens from. */
.base-dialog-overlay.issue-attachment-lightbox-overlay {
  background: #000000bd;
  z-index: 47;
}
</style>
