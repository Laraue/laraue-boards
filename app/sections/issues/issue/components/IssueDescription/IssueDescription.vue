<template>
  <div
    class="issue-description"
    :class="{ 'issue-description--writing': isWriting }">
    <div class="issue-description-frame">
      <div
        v-if="isWriting"
        aria-label="Markdown formatting"
        class="markdown-toolbar"
        role="toolbar">
        <div class="markdown-toolbar-group">
          <button
            aria-label="Return to visual"
            class="markdown-toolbar-return"
            title="Visual"
            type="button"
            @click="state.editing = false">
            <Eye aria-hidden="true" />
            Visual
          </button>
        </div>
        <div class="markdown-toolbar-group">
          <button
            aria-label="Bold"
            title="Bold (Ctrl+B)"
            type="button"
            @click="wrap('**', '**', 'bold text')">
            <Bold aria-hidden="true" />
          </button>
          <button
            aria-label="Italic"
            title="Italic (Ctrl+I)"
            type="button"
            @click="wrap('*', '*', 'italic text')">
            <Italic aria-hidden="true" />
          </button>
          <button
            aria-label="Strikethrough"
            title="Strikethrough"
            type="button"
            @click="wrap('~~', '~~', 'strikethrough text')">
            <Strikethrough aria-hidden="true" />
          </button>
          <select
            aria-label="Heading level"
            title="Heading level"
            value=""
            @change="insertHeading">
            <option
              disabled
              value="">
              H
            </option>
            <option value="#">H1</option>
            <option value="##">H2</option>
            <option value="###">H3</option>
            <option value="####">H4</option>
            <option value="#####">H5</option>
            <option value="######">H6</option>
          </select>
        </div>

        <div class="markdown-toolbar-group">
          <button
            aria-label="Quote"
            title="Quote"
            type="button"
            @click="prefixLines('> ', 'Quote')">
            <Quote aria-hidden="true" />
          </button>
          <button
            aria-label="Bulleted list"
            title="Bulleted list"
            type="button"
            @click="prefixLines('- ', 'List item')">
            <List aria-hidden="true" />
          </button>
          <button
            aria-label="Numbered list"
            title="Numbered list"
            type="button"
            @click="prefixLines('', 'List item', true)">
            <ListOrdered aria-hidden="true" />
          </button>
        </div>

        <div class="markdown-toolbar-group">
          <button
            aria-label="Inline code"
            title="Inline code"
            type="button"
            @click="wrap('`', '`', 'code')">
            <Code aria-hidden="true" />
          </button>
          <button
            aria-label="Code block"
            title="Code block"
            type="button"
            @click="wrap('```\n', '\n```', 'code')">
            <SquareCode aria-hidden="true" />
          </button>
          <button
            aria-label="Link"
            title="Link (Ctrl+K)"
            type="button"
            @click="insertLink">
            <LinkIcon aria-hidden="true" />
          </button>
          <button
            aria-label="Image"
            title="Image"
            type="button"
            @click="wrap('![', '](https://example.com/image.jpg)', 'description')">
            <ImageIcon aria-hidden="true" />
          </button>
        </div>
      </div>

      <textarea
        v-if="isWriting"
        ref="textarea"
        v-model="model"
        aria-label="Content"
        placeholder="Describe the issue. Markdown is supported."
        rows="8"
        @keydown="handleKeydown" />

      <!-- eslint-disable-next-line vue/no-v-html -- sanitized by renderMarkdown -->
      <article
        v-else
        :aria-label="disabled ? 'Description preview' : 'Edit description'"
        class="issue-description-preview"
        :class="{ 'issue-description-preview--editable': !disabled }"
        :role="disabled ? undefined : 'button'"
        :tabindex="disabled ? undefined : 0"
        @click="startEditing"
        @keydown.enter.prevent="startEditing"
        @keydown.space.prevent="startEditing"
        v-html="preview" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Bold,
  Code,
  Eye,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  SquareCode,
  Strikethrough,
} from '@lucide/vue'

import { renderMarkdown } from '~/utils/renderMarkdown'

const props = defineProps<{ disabled?: boolean }>()

const model = defineModel<string>({ required: true })
const state = reactive({ editing: false })
const textarea = useTemplateRef<HTMLTextAreaElement>('textarea')

const isWriting = computed(() => state.editing && !props.disabled)
const preview = computed(() =>
  model.value.trim()
    ? renderMarkdown(model.value)
    : '<p class="issue-description-empty">Nothing here yet.</p>',
)

const startEditing = async (event: Event) => {
  if (props.disabled || (event.target as Element).closest('a')) {
    return
  }
  state.editing = true
  await nextTick()
  textarea.value?.focus()
}

// execCommand is deprecated but stays the only insert that keeps the textarea undo stack.
// Typed locally so the TS6387 deprecation hint does not fire; swap to a standard undoable insert API when one ships.
const insertText = (value: string) =>
  (
    document as unknown as {
      execCommand: (command: string, showUi: boolean, value: string) => boolean
    }
  ).execCommand('insertText', false, value)

const restoreSelection = async (start: number, end: number) => {
  await nextTick()
  textarea.value?.focus()
  textarea.value?.setSelectionRange(start, end)
}

const replace = async (
  start: number,
  end: number,
  replacement: string,
  selectionStart: number,
  selectionEnd: number,
) => {
  const element = textarea.value
  if (!element) {
    return
  }

  element.focus()
  element.setSelectionRange(start, end)
  let inserted = false
  try {
    inserted = insertText(replacement)
  } catch {
    inserted = false
  }
  if (!inserted) {
    element.setRangeText(replacement, start, end, 'end')
  }
  model.value = element.value
  await restoreSelection(selectionStart, selectionEnd)
}

const wrap = async (before: string, after = before, placeholder = 'text') => {
  const element = textarea.value
  if (!element) {
    return
  }

  const { selectionEnd: end, selectionStart: start } = element
  const content = model.value.slice(start, end) || placeholder
  await replace(
    start,
    end,
    `${before}${content}${after}`,
    start + before.length,
    start + before.length + content.length,
  )
}

const prefixLines = async (prefix: string, placeholder = 'text', ordered = false) => {
  const element = textarea.value
  if (!element) {
    return
  }

  const lineStart = model.value.lastIndexOf('\n', element.selectionStart - 1) + 1
  const nextLineBreak = model.value.indexOf('\n', element.selectionEnd)
  const lineEnd = nextLineBreak === -1 ? model.value.length : nextLineBreak
  const block = model.value.slice(lineStart, lineEnd) || placeholder
  const formatted = block
    .split('\n')
    .map((line, index) => `${ordered ? `${index + 1}. ` : prefix}${line}`)
    .join('\n')
  await replace(lineStart, lineEnd, formatted, lineStart, lineStart + formatted.length)
}

const insertHeading = (event: Event) => {
  const select = event.target as HTMLSelectElement
  void prefixLines(`${select.value} `, 'Heading')
  select.value = ''
}

const insertLink = () => wrap('[', '](https://example.com)', 'link text')

const handleKeydown = (event: KeyboardEvent) => {
  if (!event.ctrlKey && !event.metaKey) {
    return
  }

  const actions: Record<string, () => void> = {
    b: () => void wrap('**', '**', 'bold text'),
    i: () => void wrap('*', '*', 'italic text'),
    k: () => void insertLink(),
  }
  const action = actions[event.key.toLowerCase()]
  if (action) {
    event.preventDefault()
    action()
  }
}
</script>

<style scoped>
.issue-description {
  display: flex;
  flex-direction: column;
  min-height: 200px;
}

/* Editor frame */

.issue-description-frame {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
  transition:
    border-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard);
}

.issue-description--writing .issue-description-frame:focus-within {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-focus);
}

.markdown-toolbar {
  align-items: center;
  border-bottom: 1px solid var(--color-divider);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-3);
  padding: var(--space-1) var(--space-2);
}

.markdown-toolbar-group {
  display: flex;
  gap: var(--space-1);
}

.markdown-toolbar-group + .markdown-toolbar-group {
  border-left: 1px solid var(--color-divider);
  padding-left: var(--space-3);
}

.markdown-toolbar button,
.markdown-toolbar select {
  align-items: center;
  background-color: transparent;
  border: 0;
  border-radius: var(--radius-small);
  color: var(--color-muted);
  display: inline-flex;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  height: var(--control-height-small);
  justify-content: center;
  min-width: var(--control-height-small);
  padding: 0 var(--space-2);
  transition:
    background var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard);
  width: auto;
}

.markdown-toolbar .lucide {
  height: 15px;
  width: 15px;
}

.markdown-toolbar select {
  background-position: right var(--space-1) center;
  padding-right: var(--space-5);
}

.markdown-toolbar :is(button, select):hover {
  background-color: var(--color-hover);
  color: var(--color-text);
}

.markdown-toolbar button:active {
  background-color: var(--color-accent-soft);
  color: var(--color-accent);
}

.markdown-toolbar-return {
  gap: var(--space-1);
}

.markdown-toolbar :is(button, select):focus-visible {
  box-shadow: var(--shadow-focus);
  outline: none;
}

.issue-description-frame textarea,
.issue-description-preview {
  flex-grow: 1;
  max-height: none;
  min-height: 200px;
}

.issue-description-frame textarea {
  background: transparent;
  border: 0;
  border-radius: 0;
  line-height: 1.6;
  padding: var(--space-3);
  resize: none;
}

.issue-description-frame textarea:focus {
  border: 0;
  box-shadow: none;
}

.issue-description-preview {
  overflow-wrap: anywhere;
  padding: var(--space-3);
}

.issue-description-preview--editable {
  cursor: text;
}

.issue-description-preview :deep(.issue-description-empty) {
  color: var(--color-muted);
  font-size: var(--font-size-small);
  margin: 0;
}

.issue-description-preview :deep(> *) {
  line-height: 1.6;
}

.issue-description-preview :deep(> * + *) {
  margin-top: var(--space-3);
}

.issue-description-preview :deep(h1),
.issue-description-preview :deep(h2),
.issue-description-preview :deep(h3),
.issue-description-preview :deep(h4),
.issue-description-preview :deep(h5),
.issue-description-preview :deep(h6) {
  font-weight: var(--font-weight-semibold);
  line-height: 1.25;
  margin-bottom: 0;
}

.issue-description-preview :deep(h1) {
  font-size: 20px;
}

.issue-description-preview :deep(h2) {
  font-size: 17px;
}

.issue-description-preview :deep(:is(h3, h4, h5, h6)) {
  font-size: var(--font-size-body);
}

.issue-description-preview :deep(:is(h1, h2, h3, h4, h5, h6) + *) {
  margin-top: var(--space-2);
}

.issue-description-preview :deep(:is(ul, ol)) {
  padding-left: var(--space-5);
}

.issue-description-preview :deep(li + li) {
  margin-top: var(--space-1);
}

.issue-description-preview :deep(img) {
  border-radius: var(--radius-control);
  max-width: 100%;
}

.issue-description-preview :deep(hr) {
  border: 0;
  border-top: 1px solid var(--color-divider);
}

.issue-description-preview :deep(table) {
  border-collapse: collapse;
  display: block;
  overflow-x: auto;
  width: max-content;
}

.issue-description-preview :deep(:is(th, td)) {
  border: 1px solid var(--color-border);
  padding: var(--space-1) var(--space-3);
  text-align: left;
}

.issue-description-preview :deep(th) {
  background: var(--color-soft);
  font-weight: var(--font-weight-semibold);
}

.issue-description-preview :deep(blockquote) {
  border-left: 3px solid var(--color-border);
  color: var(--color-muted);
  margin-left: 0;
  padding-left: var(--space-3);
}

.issue-description-preview :deep(pre),
.issue-description-preview :deep(code) {
  background: var(--color-hover);
  border-radius: var(--radius-small);
  font-family: monospace;
}

.issue-description-preview :deep(code) {
  padding: 0 var(--space-1);
}

.issue-description-preview :deep(pre) {
  overflow-x: auto;
  padding: var(--space-3);
}

.issue-description-preview :deep(pre code) {
  padding: 0;
}

.issue-description-preview :deep(a) {
  color: var(--color-accent);
}
</style>
