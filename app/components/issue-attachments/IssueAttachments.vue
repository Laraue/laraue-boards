<template>
  <div class="issue-attachments">
    <input
      :id="inputId"
      ref="inputEl"
      accept="image/png,image/jpeg,.png,.jpg,.jpeg"
      class="issue-attachment-input"
      :disabled="disabled"
      multiple
      type="file"
      @change="changeFiles" />
    <strong class="section-label">Attachments</strong>
    <div class="issue-attachment-actions">
      <label
        :aria-disabled="disabled"
        class="secondary small issue-attachment-picker"
        :class="{ 'issue-attachment-picker--disabled': disabled }"
        :for="inputId">
        <ImagePlus />
        {{ files.length ? 'Choose other images' : 'Choose images' }}
      </label>
      <button
        v-if="files.length || attachmentError"
        class="secondary small"
        :disabled="disabled"
        type="button"
        @click="clearFiles">
        Clear
      </button>
      <span class="muted issue-attachment-paste-hint">or paste PNG/JPG with Ctrl+V</span>
    </div>
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
          :aria-label="`Open attachment ${index + 1}`"
          class="issue-attachment-open"
          type="button"
          @click="openLightbox(attachment.originalUrl, `Attachment ${index + 1}`)">
          <img
            :alt="`Attachment ${index + 1}`"
            :src="attachment.previewUrl" />
        </button>
        <button
          v-if="onRemoveAttachment && !disabled"
          :aria-label="`Remove attachment ${index + 1}`"
          class="icon-btn small issue-attachment-remove"
          type="button"
          @click="onRemoveAttachment(attachment.id)">
          <X />
        </button>
      </div>
      <div
        v-for="(preview, index) in pendingPreviews"
        :key="preview.url"
        class="issue-attachment-preview">
        <button
          :aria-label="`Open ${preview.file.name}`"
          class="issue-attachment-open"
          :disabled="disabled"
          type="button"
          @click="openLightbox(preview.url, preview.file.name)">
          <img
            :alt="preview.file.name"
            :src="preview.url" />
          <span>{{ preview.file.name }}</span>
        </button>
        <button
          v-if="!disabled"
          :aria-label="`Remove ${preview.file.name}`"
          class="icon-btn small issue-attachment-remove"
          type="button"
          @click="removeFile(index)">
          <X />
        </button>
        <div
          v-if="disabled"
          aria-label="Uploading attachment"
          class="issue-attachment-uploading"
          role="status">
          <Loader />
        </div>
      </div>
    </div>
    <Teleport to="body">
      <dialog
        ref="lightboxEl"
        aria-label="Attachment preview"
        class="issue-attachment-lightbox"
        @click="closeLightboxFromBackdrop"
        @close="closeLightboxPreview">
        <button
          aria-label="Close attachment preview"
          class="icon-btn issue-attachment-lightbox-close"
          type="button"
          @click="closeLightbox">
          <X />
        </button>
        <img
          v-if="activeAttachment"
          :alt="activeAttachment.alt"
          :src="activeAttachment.url"
          @error="lightboxLoading = false"
          @load="lightboxLoading = false" />
        <div
          v-if="lightboxLoading"
          aria-label="Loading attachment preview"
          class="issue-attachment-lightbox-loading"
          role="status">
          <Loader />
        </div>
      </dialog>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ImagePlus, Loader, X } from '@lucide/vue'

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

const activeAttachment = ref<null | { alt: string; url: string }>(null)
const attachmentError = ref('')
const inputId = useId()
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
  attachmentError.value = images.some((file) => file.size > MAX_IMAGE_SIZE)
    ? 'Some images were not added because they are larger than 3 MB.'
    : ''
  return images.filter((file) => file.size <= MAX_IMAGE_SIZE)
}

const clearFiles = () => {
  if (inputEl.value) {
    inputEl.value.value = ''
  }
  attachmentError.value = ''
  props.onChange([])
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
</script>

<style scoped>
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
  border: 1px solid var(--color-border);
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
  background: color-mix(in srgb, var(--color-surface) 65%, transparent);
  display: flex;
  inset: 0;
  justify-content: center;
  position: absolute;
}

.issue-attachment-uploading svg {
  animation: var(--animation-spin);
  color: var(--color-accent);
  height: 32px;
  width: 32px;
}

.issue-attachment-remove {
  position: absolute;
  right: var(--space-1);
  top: var(--space-1);
  z-index: 1;
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

.issue-attachment-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.issue-attachment-picker {
  cursor: pointer;
  margin: 0;
}

.issue-attachment-picker--disabled {
  cursor: not-allowed;
  opacity: 0.5;
  pointer-events: none;
}

.issue-attachments:has(.issue-attachment-input:focus-visible) .issue-attachment-picker {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-focus);
}

.issue-attachment-paste-hint {
  align-self: center;
  font-size: var(--font-size-small);
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
  height: 32px;
  width: 32px;
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
