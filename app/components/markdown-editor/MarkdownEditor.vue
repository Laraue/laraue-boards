<template>
  <div class="markdown-editor">
    <!-- Rendered on the server and until the editor mounts, so the text does not jump in. -->
    <!-- eslint-disable vue/no-v-html -- sanitized by renderMarkdown -->
    <div
      v-if="!editor"
      class="markdown-editor-content">
      <div
        v-if="fallback"
        class="tiptap markdown"
        v-html="fallback" />
      <div
        v-else
        class="tiptap markdown">
        <p
          class="is-editor-empty"
          :data-placeholder="disabled ? undefined : placeholder">
          <br />
        </p>
      </div>
    </div>
    <!-- eslint-enable vue/no-v-html -->
    <template v-else>
      <EditorContent
        class="markdown-editor-content"
        :editor="editor" />
      <!-- Tiptap moves the menus' own elements, so a div of ours carries their look. -->
      <template v-if="!disabled">
        <BubbleMenu
          class="markdown-editor-popup"
          :editor="editor"
          :options="selectionMenuOptions"
          plugin-key="textMenu"
          :should-show="showTextMenu">
          <!-- mousedown.prevent: a click in the menu keeps the text selected. -->
          <div
            class="markdown-editor-menu markdown-editor-text-menu"
            @mousedown.prevent>
            <div class="markdown-editor-style">
              <BaseTooltip :text="t('textStyle')">
                <button
                  :aria-expanded="styleMenuOpen"
                  aria-haspopup="menu"
                  :aria-label="t('textStyle')"
                  class="markdown-editor-style-trigger"
                  type="button"
                  @click="styleMenuOpen = !styleMenuOpen">
                  Aa
                  <IconChevronDown />
                </button>
              </BaseTooltip>
              <div
                v-if="styleMenuOpen"
                class="markdown-editor-list markdown-editor-style-list"
                role="menu">
                <button
                  v-for="style in textStyles"
                  :key="style.label"
                  :aria-checked="style.isActive?.()"
                  class="markdown-editor-list-item"
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
              <span class="markdown-editor-menu-divider" />
              <BaseIconButton
                v-for="action in group"
                :key="action.label"
                :class="{ active: action.isActive?.() }"
                :label="action.label"
                @click="action.run">
                <component :is="action.icon" />
              </BaseIconButton>
            </template>
          </div>
        </BubbleMenu>
        <BubbleMenu
          class="markdown-editor-popup"
          :editor="editor"
          :options="selectionMenuOptions"
          plugin-key="tableMenu"
          :should-show="showTableMenu">
          <div
            class="markdown-editor-menu markdown-editor-table-menu"
            @mousedown.prevent>
            <template
              v-for="(group, index) in tableActions"
              :key="index">
              <span
                v-if="index"
                class="markdown-editor-menu-divider" />
              <BaseIconButton
                v-for="action in group"
                :key="action.label"
                :label="action.label"
                @click="action.run">
                <component :is="action.icon" />
              </BaseIconButton>
            </template>
          </div>
        </BubbleMenu>
        <!-- "/" on a line: the blocks it can become, filtered by what follows the slash. -->
        <FloatingMenu
          class="markdown-editor-popup"
          :editor="editor"
          :options="{ ...selectionMenuOptions, offset: 4, placement: 'bottom-start' }"
          plugin-key="slashMenu"
          :should-show="showSlashMenu">
          <div
            :aria-label="t('blocks')"
            class="markdown-editor-list"
            role="listbox">
            <template
              v-for="(command, index) in slashCommands"
              :key="command.label">
              <span
                v-if="index && command.group !== slashCommands[index - 1]!.group"
                class="markdown-editor-list-divider" />
              <button
                :aria-selected="index === slash.index"
                class="markdown-editor-list-item"
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
  IconStrikethrough,
  IconTable,
  IconTableOff,
} from '@tabler/icons-vue'
import { Image } from '@tiptap/extension-image'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { TableKit } from '@tiptap/extension-table'
import { Placeholder } from '@tiptap/extensions'
import { Markdown } from '@tiptap/markdown'
import { StarterKit } from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { BubbleMenu, FloatingMenu } from '@tiptap/vue-3/menus'
import type { Component } from 'vue'

import { renderMarkdown } from '~/utils/renderMarkdown'

const props = defineProps<{
  disabled?: boolean
  label: string
  // Ctrl+Enter; without it, Ctrl+Enter breaks the line as usual.
  onSubmit?: () => void
  placeholder?: string
}>()

const { t } = useI18n({
  en: {
    addColumn: 'Add a column',
    addRow: 'Add a row',
    blocks: 'Blocks',
    bold: 'Bold (Ctrl+B)',
    bulletedList: 'Bulleted list',
    checklist: 'Checklist',
    codeBlock: 'Code block',
    deleteColumn: 'Delete the column',
    deleteRow: 'Delete the row',
    deleteTable: 'Delete the table',
    divider: 'Divider',
    heading1: 'Heading 1',
    heading2: 'Heading 2',
    heading3: 'Heading 3',
    inlineCode: 'Inline code',
    italic: 'Italic (Ctrl+I)',
    link: 'Link',
    linkAddress: 'Link address',
    numberedList: 'Numbered list',
    quote: 'Quote',
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
    deleteColumn: 'Удалить столбец',
    deleteRow: 'Удалить строку',
    deleteTable: 'Удалить таблицу',
    divider: 'Разделитель',
    heading1: 'Заголовок 1',
    heading2: 'Заголовок 2',
    heading3: 'Заголовок 3',
    inlineCode: 'Встроенный код',
    italic: 'Курсив (Ctrl+I)',
    link: 'Ссылка',
    linkAddress: 'Адрес ссылки',
    numberedList: 'Нумерованный список',
    quote: 'Цитата',
    strikethrough: 'Зачёркивание',
    table: 'Таблица',
    text: 'Текст',
    textStyle: 'Стиль текста',
  },
})

const model = defineModel<string>({ required: true })

const fallback = computed(() => renderMarkdown(model.value))

const selectionMenuOptions = {
  flip: { padding: 8 },
  offset: 8,
  placement: 'top' as const,
  shift: { padding: 8 },
  strategy: 'fixed' as const,
}

// The markdown the editor holds, to tell its own changes from new content coming in.
let editorMarkdown = model.value

const editor = useEditor({
  content: model.value,
  contentType: 'markdown',
  editable: !props.disabled,
  editorProps: {
    attributes: {
      'aria-label': props.label,
      'aria-multiline': 'true',
      class: 'markdown',
      role: 'textbox',
    },
    handleKeyDown: (_view, event) => handleSlashKey(event) || handleSubmitKey(event),
  },
  extensions: [
    StarterKit.configure({ link: { openOnClick: false }, trailingNode: false }),
    // Inline, as markdown has it: an image is part of a paragraph.
    Image.configure({ inline: true }),
    TableKit,
    TaskList,
    TaskItem.configure({ nested: true }),
    Markdown,
    // Only for an empty text; an empty line in a written one stays blank, as in Linear.
    Placeholder.configure({ placeholder: () => props.placeholder ?? '' }),
  ],
  onSelectionUpdate: () => {
    styleMenuOpen.value = false
  },
  onUpdate: ({ editor: current }) => {
    editorMarkdown = current.getMarkdown().trimEnd()
    model.value = editorMarkdown
  },
})

// New content from outside: loaded again, cleared after sending or rewritten by the AI.
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

// Safari's keyboard changes the visual viewport without resizing the page layout.
const updateMenuPositions = () => {
  for (const pluginKey of ['textMenu', 'tableMenu', 'slashMenu']) {
    editor.value?.commands.setMeta(pluginKey, 'updatePosition')
  }
}
onMounted(() => {
  document.addEventListener('scroll', updateMenuPositions, true)
  window.visualViewport?.addEventListener('resize', updateMenuPositions)
  window.visualViewport?.addEventListener('scroll', updateMenuPositions)
})
onBeforeUnmount(() => {
  document.removeEventListener('scroll', updateMenuPositions, true)
  window.visualViewport?.removeEventListener('resize', updateMenuPositions)
  window.visualViewport?.removeEventListener('scroll', updateMenuPositions)
})

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

// Before the editor's own keys, which make Ctrl+Enter a line break.
const handleSubmitKey = (event: KeyboardEvent) => {
  if (!props.onSubmit || event.key !== 'Enter' || !(event.ctrlKey || event.metaKey)) {
    return false
  }
  props.onSubmit()
  return true
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
// For a button next to the editor: a "/" on an empty line, opening the list of blocks.
const insertSlash = () => {
  const current = editor.value
  if (!current) {
    return
  }
  const { $from, empty } = current.state.selection
  if (empty && $from.parent.type.name === 'paragraph' && !$from.parent.textContent) {
    current.chain().focus().insertContent('/').run()
    return
  }
  current
    .chain()
    .insertContentAt(current.state.doc.content.size, {
      content: [{ text: '/', type: 'text' }],
      type: 'paragraph',
    })
    .focus('end')
    .run()
}

defineExpose({ insertSlash })
</script>

<style scoped>
.markdown-editor-content :deep(.tiptap) {
  outline: none;
}

.markdown-editor-content :deep(.tiptap:focus-visible) {
  box-shadow: none;
}

.markdown-editor-content :deep(p.is-editor-empty:first-child::before) {
  color: var(--color-muted);
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* Tiptap's own element for each menu: over what follows, such as the comments below. */
.markdown-editor-popup {
  z-index: 10;
}

/* The menus over a selection, a table and an empty line. */
.markdown-editor-menu {
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-popover);
  box-shadow: var(--shadow-popover);
  display: flex;
  gap: 2px;
  max-width: calc(100vw - var(--space-8));
  padding: var(--space-1);
}

.markdown-editor-list {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-popover);
  box-shadow: var(--shadow-popover);
  display: grid;
  max-height: 40dvh;
  max-width: calc(100vw - var(--space-8));
  min-width: 220px;
  overflow-y: auto;
  padding: var(--space-1);
}

.markdown-editor-list-item {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: var(--radius-control);
  color: var(--color-text);
  display: flex;
  gap: var(--space-2);
  min-height: var(--control-height-small);
  padding: 0 var(--space-3);
  text-align: left;
}

.markdown-editor-list-item:is([aria-selected='true'], :hover) {
  background: var(--color-soft);
}

.markdown-editor-list-item[aria-checked='true'] {
  color: var(--color-accent);
}

.markdown-editor-list-item > svg {
  color: var(--color-muted);
}

.markdown-editor-list-item > kbd {
  color: var(--color-muted);
  font-family: inherit;
  font-size: var(--font-size-small);
  margin-left: auto;
  padding-left: var(--space-4);
}

.markdown-editor-list-divider {
  background: var(--color-divider);
  height: 1px;
  margin: var(--space-1) 0;
}

.markdown-editor-style {
  position: relative;
}

.markdown-editor-style-trigger {
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

.markdown-editor-style-trigger:is(:hover, [aria-expanded='true']) {
  background: var(--color-hover);
  color: var(--color-text);
}

.markdown-editor-style-trigger > svg {
  height: 12px;
  width: 12px;
}

.markdown-editor-style-list {
  left: 0;
  position: absolute;
  top: calc(100% + var(--space-2));
  z-index: 1;
}

.markdown-editor-menu-divider {
  align-self: stretch;
  background: var(--color-divider);
  margin: var(--space-1) 2px;
  width: 1px;
}

.markdown-editor-menu :deep(.active) {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

@media (max-width: 600px) {
  .markdown-editor-menu {
    display: grid;
  }

  .markdown-editor-text-menu {
    grid-template-columns: repeat(6, auto);
  }

  .markdown-editor-table-menu {
    grid-template-columns: repeat(4, auto);
  }

  .markdown-editor-menu-divider {
    display: none;
  }
}
</style>
