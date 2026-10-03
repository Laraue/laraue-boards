<template>
  <div class="issue-description">
    <!-- Rendered on the server and until the editor mounts, so the text does not jump in. -->
    <!-- eslint-disable vue/no-v-html -- sanitized by renderMarkdown -->
    <div
      v-if="!editor"
      class="issue-description-content">
      <div
        class="tiptap"
        v-html="fallback" />
    </div>
    <!-- eslint-enable vue/no-v-html -->
    <template v-else>
      <EditorContent
        class="issue-description-content"
        :editor="editor" />
      <!-- Tiptap moves the menus' own elements, so a div of ours carries their look. -->
      <template v-if="!disabled">
        <BubbleMenu
          :editor="editor"
          plugin-key="textMenu"
          :should-show="showTextMenu">
          <!-- mousedown.prevent: a click in the menu keeps the text selected. -->
          <div
            class="issue-description-menu"
            @mousedown.prevent>
            <div class="issue-description-style">
              <button
                :aria-expanded="styleMenuOpen"
                aria-haspopup="menu"
                class="issue-description-style-trigger"
                :title="t('textStyle')"
                type="button"
                @click="styleMenuOpen = !styleMenuOpen">
                Aa
                <IconChevronDown />
              </button>
              <div
                v-if="styleMenuOpen"
                class="issue-description-list issue-description-style-list"
                role="menu">
                <button
                  v-for="style in textStyles"
                  :key="style.label"
                  :aria-checked="style.isActive?.()"
                  class="issue-description-list-item"
                  role="menuitemradio"
                  type="button"
                  @click="applyStyle(style)">
                  <component :is="style.icon" />
                  {{ style.label }}
                </button>
              </div>
            </div>
            <template
              v-for="group in textActions"
              :key="group[0]!.label">
              <span class="issue-description-menu-divider" />
              <IconButton
                v-for="action in group"
                :key="action.label"
                :class="{ active: action.isActive?.() }"
                :label="action.label"
                @click="action.run">
                <component :is="action.icon" />
              </IconButton>
            </template>
          </div>
        </BubbleMenu>
        <BubbleMenu
          :editor="editor"
          plugin-key="tableMenu"
          :should-show="showTableMenu">
          <div
            class="issue-description-menu"
            @mousedown.prevent>
            <template
              v-for="(group, index) in tableActions"
              :key="index">
              <span
                v-if="index"
                class="issue-description-menu-divider" />
              <IconButton
                v-for="action in group"
                :key="action.label"
                :label="action.label"
                @click="action.run">
                <component :is="action.icon" />
              </IconButton>
            </template>
          </div>
        </BubbleMenu>
        <!-- "/" on a line: the blocks it can become, filtered by what follows the slash. -->
        <FloatingMenu
          :editor="editor"
          :options="{ offset: 4, placement: 'bottom-start' }"
          plugin-key="slashMenu"
          :should-show="showSlashMenu">
          <div
            :aria-label="t('blocks')"
            class="issue-description-list"
            role="listbox">
            <template
              v-for="(command, index) in slashCommands"
              :key="command.label">
              <span
                v-if="index && command.group !== slashCommands[index - 1]!.group"
                class="issue-description-list-divider" />
              <button
                :aria-selected="index === slash.index"
                class="issue-description-list-item"
                role="option"
                type="button"
                @click="runSlashCommand(command)"
                @mousedown.prevent
                @mouseenter="slash.index = index">
                <component :is="command.icon" />
                {{ command.label }}
                <kbd v-if="command.shortcut">{{ command.shortcut }}</kbd>
              </button>
            </template>
          </div>
        </FloatingMenu>
      </template>
    </template>
    <div
      v-if="!disabled"
      class="issue-description-footer">
      <slot name="actions" />
      <IconButton
        :disabled="!model.trim()"
        :label="t('improveWithAi')"
        :loading="summarizing"
        :tooltip="t('improveWithAiHint')"
        @click="summarizeContent">
        <IconSparkles />
      </IconButton>
      <span class="issue-description-hint">
        <kbd>/</kbd>
        {{ t('slashHint') }}
      </span>
      <p
        v-if="message"
        class="form-error"
        role="alert">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  IconBlockquote,
  IconBold,
  IconChevronDown,
  IconCode,
  IconColumnInsertRight,
  IconColumnRemove,
  IconH1,
  IconH2,
  IconH3,
  IconItalic,
  IconLink,
  IconList,
  IconListCheck,
  IconListNumbers,
  IconPilcrow,
  IconRowInsertBottom,
  IconRowRemove,
  IconSeparatorHorizontal,
  IconSourceCode,
  IconSparkles,
  IconStrikethrough,
  IconTable,
  IconTableOff,
} from '@tabler/icons-vue'
import Image from '@tiptap/extension-image'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { TableKit } from '@tiptap/extension-table'
import { Placeholder } from '@tiptap/extensions'
import { Markdown } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { BubbleMenu, FloatingMenu } from '@tiptap/vue-3/menus'
import type { Component } from 'vue'

import { renderMarkdown } from '~/utils/renderMarkdown'

import type { IssueDescriptionDeps } from './IssueDescription.deps'

const props = defineProps<{ deps: IssueDescriptionDeps; disabled?: boolean }>()

const { t } = useI18n({
  en: {
    addColumn: 'Add a column',
    addRow: 'Add a row',
    blocks: 'Blocks',
    bold: 'Bold (Ctrl+B)',
    bulletedList: 'Bulleted list',
    checklist: 'Checklist',
    codeBlock: 'Code block',
    content: 'Content',
    deleteColumn: 'Delete the column',
    deleteRow: 'Delete the row',
    deleteTable: 'Delete the table',
    descriptionPlaceholder: 'Add a description… Type / for a heading, list or table',
    divider: 'Divider',
    heading1: 'Heading 1',
    heading2: 'Heading 2',
    heading3: 'Heading 3',
    improveWithAi: 'Clean up and title with AI',
    improveWithAiHint:
      'Fixes grammar and structure with AI and writes a title. Review it before saving.',
    improvingWithAi: 'Cleaning up…',
    inlineCode: 'Inline code',
    italic: 'Italic (Ctrl+I)',
    link: 'Link',
    linkAddress: 'Link address',
    numberedList: 'Numbered list',
    quote: 'Quote',
    slashHint: 'a heading, list, table and more',
    strikethrough: 'Strikethrough',
    table: 'Table',
    text: 'Text',
    textStyle: 'Text style',
  },
  ru: {
    addColumn: 'Добавить столбец',
    addRow: 'Добавить строку',
    blocks: 'Блоки',
    bold: 'Жирный (Ctrl+B)',
    bulletedList: 'Маркированный список',
    checklist: 'Чек-лист',
    codeBlock: 'Блок кода',
    content: 'Содержимое',
    deleteColumn: 'Удалить столбец',
    deleteRow: 'Удалить строку',
    deleteTable: 'Удалить таблицу',
    descriptionPlaceholder: 'Добавьте описание… / — заголовок, список или таблица',
    divider: 'Разделитель',
    heading1: 'Заголовок 1',
    heading2: 'Заголовок 2',
    heading3: 'Заголовок 3',
    improveWithAi: 'Привести в порядок и озаглавить с ИИ',
    improveWithAiHint:
      'ИИ исправит грамматику и структуру и придумает заголовок. Проверьте результат перед сохранением.',
    improvingWithAi: 'Приводим в порядок…',
    inlineCode: 'Встроенный код',
    italic: 'Курсив (Ctrl+I)',
    link: 'Ссылка',
    linkAddress: 'Адрес ссылки',
    numberedList: 'Нумерованный список',
    quote: 'Цитата',
    slashHint: 'заголовок, список, таблица и другое',
    strikethrough: 'Зачёркивание',
    table: 'Таблица',
    text: 'Текст',
    textStyle: 'Стиль текста',
  },
})

const model = defineModel<string>({ required: true })
// The AI summary comes with a title; the page owning the title field shares it here.
const titleModel = defineModel<string>('title', { default: '' })

const fallback = computed(() => renderMarkdown(model.value))

// The markdown the editor holds, to tell its own changes from new content coming in.
let editorMarkdown = model.value

const editor = useEditor({
  content: model.value,
  contentType: 'markdown',
  editable: !props.disabled,
  editorProps: {
    attributes: { 'aria-label': t('content'), 'aria-multiline': 'true', role: 'textbox' },
    handleKeyDown: (_view, event) => handleSlashKey(event),
  },
  extensions: [
    StarterKit.configure({ link: { openOnClick: false } }),
    // Inline, as markdown has it: an image is part of a paragraph.
    Image.configure({ inline: true }),
    TableKit,
    TaskList,
    TaskItem.configure({ nested: true }),
    Markdown,
    // Only for an empty description; an empty line in a written one stays blank, as in Linear.
    Placeholder.configure({ placeholder: () => t('descriptionPlaceholder') }),
  ],
  onSelectionUpdate: () => {
    styleMenuOpen.value = false
  },
  onUpdate: ({ editor: current }) => {
    editorMarkdown = current.getMarkdown().trimEnd()
    model.value = editorMarkdown
    message.value = undefined
  },
})

// New content from outside: the issue loaded again or the AI rewrote it.
watch(model, (markdown) => {
  if (markdown !== editorMarkdown) {
    editorMarkdown = markdown
    editor.value?.commands.setContent(markdown, { contentType: 'markdown', emitUpdate: false })
  }
})

watch(
  () => props.disabled,
  (disabled) => editor.value?.setEditable(!disabled),
)

type EditorAction = {
  icon: Component
  isActive?: () => boolean
  label: string
  run: () => void
  // The editor's own key for it, shown in the slash list.
  shortcut?: string
}

// Only called from the menus, which exist once the editor does.
const chain = () => editor.value!.chain().focus()
const isActive = (name: string, attributes?: Record<string, unknown>) =>
  editor.value?.isActive(name, attributes) ?? false

const setLink = () => {
  const href = window.prompt(
    t('linkAddress'),
    editor.value?.getAttributes('link').href ?? 'https://',
  )
  if (href === null) {
    return
  }
  const link = chain().extendMarkRange('link')
  ;(href ? link.setLink({ href }) : link.unsetLink()).run()
}

const headings: EditorAction[] = ([1, 2, 3] as const).map((level) => ({
  icon: [IconH1, IconH2, IconH3][level - 1]!,
  isActive: () => isActive('heading', { level }),
  label: t(`heading${level}`),
  run: () => chain().toggleHeading({ level }).run(),
  shortcut: `Ctrl Alt ${level}`,
}))
const lists: EditorAction[] = [
  {
    icon: IconList,
    isActive: () => isActive('bulletList'),
    label: t('bulletedList'),
    run: () => chain().toggleBulletList().run(),
    shortcut: 'Ctrl ⇧ 8',
  },
  {
    icon: IconListNumbers,
    isActive: () => isActive('orderedList'),
    label: t('numberedList'),
    run: () => chain().toggleOrderedList().run(),
    shortcut: 'Ctrl ⇧ 7',
  },
  {
    icon: IconListCheck,
    isActive: () => isActive('taskList'),
    label: t('checklist'),
    run: () => chain().toggleTaskList().run(),
    shortcut: 'Ctrl ⇧ 9',
  },
]
const quote: EditorAction = {
  icon: IconBlockquote,
  isActive: () => isActive('blockquote'),
  label: t('quote'),
  run: () => chain().toggleBlockquote().run(),
  shortcut: 'Ctrl ⇧ B',
}
const codeBlock: EditorAction = {
  icon: IconSourceCode,
  isActive: () => isActive('codeBlock'),
  label: t('codeBlock'),
  run: () => chain().toggleCodeBlock().run(),
  shortcut: 'Ctrl Alt C',
}

// The style of the selected lines, in the menu's dropdown.
const textStyles: EditorAction[] = [
  {
    icon: IconPilcrow,
    isActive: () => isActive('paragraph'),
    label: t('text'),
    run: () => chain().setParagraph().run(),
  },
  ...headings,
]
const styleMenuOpen = ref(false)
const applyStyle = (style: EditorAction) => {
  style.run()
  styleMenuOpen.value = false
}

// Over selected text, like Linear: its style (the dropdown), its marks, then blocks and lists.
const textActions: EditorAction[][] = [
  [
    {
      icon: IconBold,
      isActive: () => isActive('bold'),
      label: t('bold'),
      run: () => chain().toggleBold().run(),
    },
    {
      icon: IconItalic,
      isActive: () => isActive('italic'),
      label: t('italic'),
      run: () => chain().toggleItalic().run(),
    },
    {
      icon: IconStrikethrough,
      isActive: () => isActive('strike'),
      label: t('strikethrough'),
      run: () => chain().toggleStrike().run(),
    },
    {
      icon: IconCode,
      isActive: () => isActive('code'),
      label: t('inlineCode'),
      run: () => chain().toggleCode().run(),
    },
    { icon: IconLink, isActive: () => isActive('link'), label: t('link'), run: setLink },
  ],
  [quote, codeBlock],
  lists,
]

// What "/" offers: every block a line can become, in groups like Linear's.
const blockActions: EditorAction[][] = [
  headings,
  lists,
  [
    quote,
    codeBlock,
    {
      icon: IconTable,
      label: t('table'),
      run: () => chain().insertTable({ cols: 3, rows: 3, withHeaderRow: true }).run(),
    },
    {
      icon: IconSeparatorHorizontal,
      label: t('divider'),
      run: () => chain().setHorizontalRule().run(),
    },
  ],
]

type SlashContext = {
  state: {
    selection: {
      $from: {
        parent: { textBetween: (from: number, to: number) => string; type: { name: string } }
        parentOffset: number
        pos: number
        start: () => number
      }
      empty: boolean
    }
  }
}

// The text after a "/" that starts a paragraph and the option picked in its list. Escape
// dismisses the list until the slash is gone.
const slash = reactive({ dismissed: false, from: 0, index: 0, query: null as null | string, to: 0 })

const updateSlash = ({ state: { selection } }: SlashContext) => {
  const { $from, empty } = selection
  const text = $from.parent.textBetween(0, $from.parentOffset)
  const query =
    empty && $from.parent.type.name === 'paragraph' && /^\/\S*$/.test(text)
      ? text.slice(1).toLowerCase()
      : null
  if (query === null) {
    slash.dismissed = false
  }
  if (query !== slash.query) {
    slash.index = 0
  }
  Object.assign(slash, { from: $from.start(), query, to: $from.pos })
}

const slashCommands = computed(() =>
  slash.query === null || slash.dismissed
    ? []
    : blockActions.flatMap((group, index) =>
        group
          .filter((action) => action.label.toLowerCase().includes(slash.query!))
          .map((action) => ({ ...action, group: index })),
      ),
)

// Called by the menu on every change of the text or the selection, before it decides to show:
// the slash is read there, so the list is never one keystroke behind.
const showSlashMenu = ({ editor: current }: { editor: SlashContext }) => {
  updateSlash(current)
  return slashCommands.value.length > 0
}

const runSlashCommand = (command: EditorAction) => {
  chain().deleteRange({ from: slash.from, to: slash.to }).run()
  command.run()
}

const handleSlashKey = (event: KeyboardEvent) => {
  const commands = slashCommands.value
  if (!commands.length) {
    return false
  }
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    const step = event.key === 'ArrowDown' ? 1 : -1
    slash.index = (slash.index + step + commands.length) % commands.length
  } else if (event.key === 'Enter') {
    runSlashCommand(commands[slash.index]!)
  } else if (event.key === 'Escape') {
    slash.dismissed = true
    // An empty change, so the menu asks again whether to show and hides.
    editor.value?.view.dispatch(editor.value.state.tr)
  } else {
    return false
  }
  return true
}

const tableActions: EditorAction[][] = [
  [
    { icon: IconRowInsertBottom, label: t('addRow'), run: () => chain().addRowAfter().run() },
    {
      icon: IconColumnInsertRight,
      label: t('addColumn'),
      run: () => chain().addColumnAfter().run(),
    },
  ],
  [
    { icon: IconRowRemove, label: t('deleteRow'), run: () => chain().deleteRow().run() },
    { icon: IconColumnRemove, label: t('deleteColumn'), run: () => chain().deleteColumn().run() },
    { icon: IconTableOff, label: t('deleteTable'), run: () => chain().deleteTable().run() },
  ],
]

// The text menu needs a selection outside a table; in a table, the table's menu shows instead.
type MenuContext = {
  editor: { isActive: (name: string) => boolean; state: { selection: { empty: boolean } } }
}
const showTextMenu = ({ editor: current }: MenuContext) =>
  !current.state.selection.empty && !current.isActive('table')
const showTableMenu = ({ editor: current }: MenuContext) => current.isActive('table')

const {
  execute: summarize,
  message,
  pending: summarizing,
} = useApiAction(props.deps.summarizeContent)

const summarizeContent = async (): Promise<void> => {
  const summary = await summarize({ content: model.value })
  if (!summary) {
    return
  }
  model.value = summary.value.content
  if (summary.value.title) {
    titleModel.value = summary.value.title
  }
}
</script>

<style scoped>
.issue-description {
  display: grid;
  gap: var(--space-4);
}

.issue-description-content :deep(.tiptap) {
  min-height: calc(3 * 1.6em);
  outline: none;
}

.issue-description-content :deep(.tiptap:focus-visible) {
  box-shadow: none;
}

.issue-description-content :deep(p.is-editor-empty:first-child::before) {
  color: var(--color-muted);
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

.issue-description-footer {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.issue-description-hint {
  color: var(--color-muted);
  font-size: var(--font-size-small);
  margin-left: var(--space-2);
}

.issue-description-hint kbd {
  background: var(--color-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-small);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-caption);
  padding: 0 var(--space-1);
}

.issue-description-footer .form-error {
  margin: 0 0 0 var(--space-2);
}

/* The menus over a selection, a table and an empty line. */
.issue-description-menu {
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-popover);
  display: flex;
  gap: 2px;
  padding: var(--space-1);
}

.issue-description-list {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-popover);
  display: grid;
  min-width: 220px;
  padding: var(--space-1);
}

.issue-description-list-item {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: var(--radius-control);
  color: var(--color-text);
  display: flex;
  gap: var(--space-2);
  min-height: var(--control-height-small);
  padding: 0 var(--space-2);
  text-align: left;
}

.issue-description-list-item:is([aria-selected='true'], :hover) {
  background: var(--color-hover);
}

.issue-description-list-item[aria-checked='true'] {
  color: var(--color-accent);
}

.issue-description-list-item > svg {
  color: var(--color-muted);
}

.issue-description-list-item > kbd {
  color: var(--color-muted);
  font-family: inherit;
  font-size: var(--font-size-small);
  margin-left: auto;
  padding-left: var(--space-4);
}

.issue-description-list-divider {
  background: var(--color-divider);
  height: 1px;
  margin: var(--space-1) 0;
}

.issue-description-style {
  position: relative;
}

.issue-description-style-trigger {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: var(--radius-control);
  color: var(--color-muted);
  display: inline-flex;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  gap: 2px;
  height: var(--icon-btn-size);
  padding: 0 var(--space-2);
}

.issue-description-style-trigger:is(:hover, [aria-expanded='true']) {
  background: var(--color-hover);
  color: var(--color-text);
}

.issue-description-style-trigger > svg {
  height: 12px;
  width: 12px;
}

.issue-description-style-list {
  left: 0;
  position: absolute;
  top: calc(100% + var(--space-2));
  z-index: 1;
}

.issue-description-menu-divider {
  align-self: stretch;
  background: var(--color-divider);
  margin: var(--space-1) 2px;
  width: 1px;
}

.issue-description-menu :deep(.active) {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

/* The text, read or written. Only inside .tiptap: Tiptap appends its menus next to it. */
.issue-description-content {
  overflow-wrap: anywhere;
}

.issue-description-content :deep(.tiptap :is(p, li, blockquote)) {
  white-space: break-spaces;
}

.issue-description-content :deep(.tiptap > *) {
  line-height: 1.6;
  margin: 0;
}

.issue-description-content :deep(.tiptap > * + *) {
  margin-top: var(--space-3);
}

.issue-description-content :deep(.tiptap :is(h1, h2, h3, h4, h5, h6)) {
  font-weight: var(--font-weight-semibold);
  line-height: 1.25;
}

.issue-description-content :deep(.tiptap h1) {
  font-size: 20px;
}

.issue-description-content :deep(.tiptap h2) {
  font-size: 17px;
}

.issue-description-content :deep(.tiptap :is(h3, h4, h5, h6)) {
  font-size: var(--font-size-body);
}

.issue-description-content :deep(.tiptap :is(h1, h2, h3, h4, h5, h6) + *) {
  margin-top: var(--space-2);
}

.issue-description-content :deep(.tiptap :is(ul, ol)) {
  margin: 0;
  padding-left: var(--space-5);
}

.issue-description-content :deep(.tiptap li + li) {
  margin-top: var(--space-1);
}

.issue-description-content :deep(.tiptap li > p) {
  margin: 0;
}

.issue-description-content :deep(.tiptap ul[data-type='taskList']) {
  list-style: none;
  padding-left: 0;
}

.issue-description-content :deep(.tiptap ul[data-type='taskList'] li) {
  align-items: baseline;
  display: flex;
  gap: var(--space-2);
}

.issue-description-content :deep(.tiptap img) {
  border-radius: var(--radius-control);
  max-width: 100%;
}

.issue-description-content :deep(.tiptap hr) {
  border: 0;
  border-top: 1px solid var(--color-divider);
}

.issue-description-content :deep(.tiptap table) {
  border-collapse: collapse;
  display: block;
  overflow-x: auto;
  width: max-content;
}

.issue-description-content :deep(.tiptap :is(th, td)) {
  border: 1px solid var(--color-border);
  min-width: 80px;
  padding: var(--space-1) var(--space-3);
  text-align: left;
}

.issue-description-content :deep(.tiptap :is(th, td) > p) {
  margin: 0;
}

.issue-description-content :deep(.tiptap th) {
  background: var(--color-soft);
  font-weight: var(--font-weight-semibold);
}

.issue-description-content :deep(.tiptap .selectedCell) {
  background: var(--color-accent-soft);
}

.issue-description-content :deep(.tiptap blockquote) {
  border-left: 3px solid var(--color-border);
  color: var(--color-muted);
  margin-left: 0;
  padding-left: var(--space-3);
}

.issue-description-content :deep(.tiptap :is(pre, code)) {
  background: var(--color-hover);
  border-radius: var(--radius-small);
  font-family: var(--font-family-mono);
}

.issue-description-content :deep(.tiptap code) {
  padding: 0 var(--space-1);
}

.issue-description-content :deep(.tiptap pre) {
  overflow-x: auto;
  padding: var(--space-3);
}

.issue-description-content :deep(.tiptap pre code) {
  padding: 0;
}

.issue-description-content :deep(.tiptap a) {
  color: var(--color-accent);
}
</style>
