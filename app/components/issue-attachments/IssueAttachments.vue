<template>
  <div class="issue-attachments">
    <input
      ref="inputEl"
      accept="image/png,image/jpeg,.png,.jpg,.jpeg"
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
      v-if="visibleAttachments.length || pendingPreviews.length"
      class="issue-attachment-gallery">
      <div
        v-for="(attachment, index) in visibleAttachments"
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
        <IconButton
          v-if="onRemoveAttachment && !disabled"
          class="issue-attachment-remove"
          :label="`${t('removeAttachment')} ${index + 1}`"
          @click="onRemoveAttachment(attachment.id)">
          <IconX />
        </IconButton>
      </div>
      <div
        v-for="(preview, index) in pendingPreviews"
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
        <IconButton
          v-if="!disabled"
          class="issue-attachment-remove"
          :label="`${t('remove')} ${preview.file.name}`"
          @click="removeFile(index)">
          <IconX />
        </IconButton>
        <div
          v-if="disabled"
          :aria-label="t('uploading')"
          class="issue-attachment-uploading"
          role="status">
          <IconLoader />
        </div>
      </div>
    </div>
    <Teleport to="body">
      <dialog
        ref="lightboxEl"
        :aria-label="t('attachmentPreview')"
        class="issue-attachment-lightbox"
        @click="closeLightboxFromBackdrop"
        @close="closeLightboxPreview">
        <button
          :aria-label="t('closePreview')"
          class="icon-btn issue-attachment-lightbox-close"
          type="button"
          @click="closeLightbox">
          <IconX />
        </button>
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
      </dialog>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { IconLoader, IconX } from '@tabler/icons-vue'

import { MAX_IMAGE_SIZE } from '~/constants/attachments'

import type { IssueAttachmentViewModel } from './IssueAttachments.types'

const props = defineProps<{
  attachments: IssueAttachmentViewModel[]
  disabled: boolean
  files: File[]
  onChange: (files: File[]) => void
  onRemoveAttachment?: (id: string) => void
  removedAttachmentIds?: string[]
}>()

const { t } = useI18n({
  en: {
    attachment: 'Attachment',
    attachmentPreview: 'Attachment preview',
    closePreview: 'Close attachment preview',
    loadingPreview: 'Loading attachment preview',
    open: 'Open',
    openAttachment: 'Open attachment',
    remove: 'Remove',
    removeAttachment: 'Remove attachment',
    tooLarge: 'Some images were not added because they are larger than 3 MB.',
    uploading: 'Uploading attachment',
  },
  ru: {
    attachment: 'Вложение',
    attachmentPreview: 'Предпросмотр вложения',
    closePreview: 'Закрыть предпросмотр вложения',
    loadingPreview: 'Загрузка предпросмотра вложения',
    open: 'Открыть',
    openAttachment: 'Открыть вложение',
    remove: 'Удалить',
    removeAttachment: 'Удалить вложение',
    tooLarge: 'Некоторые изображения не добавлены: их размер превышает 3 МБ.',
    uploading: 'Загрузка вложения',
  },
})

const activeAttachment = ref<null | { alt: string; url: string }>(null)
const attachmentError = ref('')
const inputEl = useTemplateRef('inputEl')
const lightboxEl = useTemplateRef('lightboxEl')
const lightboxLoading = ref(false)
const pendingPreviews = ref<Array<{ file: File; url: string }>>([])
const supportedImageTypes = new Set(['image/jpeg', 'image/png'])
const visibleAttachments = computed(() =>
  props.attachments.filter((attachment) => !props.removedAttachmentIds?.includes(attachment.id)),
)

const changeFiles = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = getSupportedImages(input.files ?? [])
  input.value = ''
  if (files.length) {
    props.onChange(files)
  }
}

const pasteFiles = (event: ClipboardEvent) => {
  if (props.disabled) {
    return
  }
  const pastedImages = getSupportedImages(event.clipboardData?.files ?? [])
  if (!pastedImages.length) {
    return
  }
  event.preventDefault()
  if (inputEl.value) {
    inputEl.value.value = ''
  }
  props.onChange([...props.files, ...pastedImages])
}

const getSupportedImages = (files: File[] | FileList) => {
  const images = Array.from(files).filter((file) => supportedImageTypes.has(file.type))
  attachmentError.value = images.some((file) => file.size > MAX_IMAGE_SIZE) ? t('tooLarge') : ''
  return images.filter((file) => file.size <= MAX_IMAGE_SIZE)
}

const removeFile = (index: number) => {
  if (inputEl.value) {
    inputEl.value.value = ''
  }
  props.onChange(props.files.filter((_, fileIndex) => fileIndex !== index))
}

const revokePreviews = () => {
  for (const preview of pendingPreviews.value) {
    URL.revokeObjectURL(preview.url)
  }
}

const openLightbox = async (url: string, alt: string) => {
  lightboxLoading.value = true
  activeAttachment.value = { alt, url }
  await nextTick()
  lightboxEl.value?.showModal()
}

const closeLightbox = () => {
  lightboxEl.value?.close()
}

const closeLightboxPreview = () => {
  activeAttachment.value = null
  lightboxLoading.value = false
}

const closeLightboxFromBackdrop = (event: MouseEvent) => {
  if (event.target === lightboxEl.value) {
    closeLightbox()
  }
}

watch(
  () => props.files,
  (files) => {
    revokePreviews()
    pendingPreviews.value = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))
  },
  { immediate: true },
)

onMounted(() => window.addEventListener('paste', pasteFiles))
onBeforeUnmount(() => {
  revokePreviews()
  window.removeEventListener('paste', pasteFiles)
})

// The page has the button for it (a paperclip by the description).
defineExpose({ pick: () => inputEl.value?.click() })
</script>

<style scoped>
/* Only a hidden input until there is something to show. */
.issue-attachments:not(:has(.issue-attachment-gallery, .issue-attachment-error)) {
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
  border-radius: 8px;
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
  height: 100dvh;
  inset: 0;
  margin: 0;
  max-height: none;
  max-width: none;
  overflow: hidden;
  padding: var(--space-8);
  transition: none;
  width: 100vw;
}

.issue-attachment-lightbox::backdrop {
  background: #000000bd;
  opacity: 1;
  transition: opacity var(--duration-base) var(--ease-standard);
}

.issue-attachment-lightbox[open] {
  display: grid;
  grid-template: minmax(0, 1fr) / minmax(0, 1fr);
  place-items: center;
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

.issue-attachment-lightbox-close {
  position: fixed;
  right: var(--space-4);
  top: var(--space-4);
  z-index: 1;
}

@starting-style {
  .issue-attachment-lightbox::backdrop {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .issue-attachment-lightbox::backdrop {
    transition: none;
  }
}
</style>
