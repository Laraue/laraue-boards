<template>
  <div
    ref="root"
    class="app-popover"
    @focusout="closeOnFocusOut"
    @mouseenter="openOnHover"
    @mouseleave="closeAfterHover"
    @keydown.right="openSubmenu"
    @keydown.left="closeSubmenu"
    @keydown.esc="closeOnEscape">
    <slot
      name="trigger"
      :open="open"
      :toggle="toggle" />
    <div
      v-if="open"
      ref="content"
      class="app-popover-content"
      :class="{ 'app-popover-content-side': side === 'right' }"
      :style="{
        left: `${position.left}px`,
        maxHeight: `calc(100dvh - ${viewportPadding * 2}px)`,
        maxWidth: `calc(100vw - ${viewportPadding * 2}px)`,
        top: `${position.top}px`,
        visibility: positioned ? 'visible' : 'hidden',
      }">
      <slot :close="close" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    align?: 'end' | 'start'
    hover?: boolean
    open?: boolean
    side?: 'bottom' | 'right'
    viewportPadding?: number
  }>(),
  {
    align: 'start',
    hover: false,
    open: undefined,
    side: 'bottom',
    viewportPadding: 16,
  },
)
const root = useTemplateRef('root')
const content = useTemplateRef('content')
const emit = defineEmits<{ 'update:open': [value: boolean] }>()
const localOpen = ref(false)
const open = computed({
  get: () => props.open ?? localOpen.value,
  set: (value: boolean) => {
    localOpen.value = value
    emit('update:open', value)
  },
})
const positioned = ref(false)
const position = reactive({ left: 0, top: 0 })
let positionFrame: number | undefined

const close = () => {
  open.value = false
}

const toggle = () => {
  open.value = props.hover || !open.value
}

const openOnHover = () => {
  if (props.hover) open.value = true
}

const closeAfterHover = () => {
  if (props.hover) close()
}

const openSubmenu = async (event: KeyboardEvent) => {
  if (props.side !== 'right') return
  event.preventDefault()
  event.stopPropagation()
  open.value = true
  await nextTick()
  content.value?.querySelector<HTMLElement>('input, button')?.focus()
}

const closeSubmenu = (event: KeyboardEvent) => {
  if (props.side === 'right') closeOnEscape(event)
}

const updatePosition = () => {
  if (!open.value || !root.value || !content.value) {
    return
  }

  const triggerRect = root.value.getBoundingClientRect()
  const contentRect = content.value.getBoundingClientRect()
  const gap = Number.parseFloat(getComputedStyle(root.value).getPropertyValue('--space-2')) || 8
  const maxLeft = Math.max(
    props.viewportPadding,
    window.innerWidth - props.viewportPadding - contentRect.width,
  )
  const below = triggerRect.bottom + gap
  const above = triggerRect.top - gap - contentRect.height

  const alignedLeft =
    props.align === 'end' ? triggerRect.right - contentRect.width : triggerRect.left
  const sideLeft =
    triggerRect.right + gap + contentRect.width <= window.innerWidth - props.viewportPadding
      ? triggerRect.right + gap
      : triggerRect.left - gap - contentRect.width
  const left = Math.min(
    Math.max(props.side === 'right' ? sideLeft : alignedLeft, props.viewportPadding),
    maxLeft,
  )
  const bottomTop =
    below + contentRect.height <= window.innerHeight - props.viewportPadding
      ? below
      : Math.max(props.viewportPadding, above)
  const top =
    props.side === 'right'
      ? Math.max(
          props.viewportPadding,
          Math.min(
            triggerRect.top,
            window.innerHeight - props.viewportPadding - contentRect.height,
          ),
        )
      : bottomTop

  if (position.left !== left || position.top !== top) {
    position.left = left
    position.top = top
  }
  positioned.value = true
  positionFrame = requestAnimationFrame(updatePosition)
}

const closeOnOutsideClick = (event: MouseEvent) => {
  if (event.button === 0 && root.value && !root.value.contains(event.target as Node)) {
    close()
  }
}

const closeOnFocusOut = (event: FocusEvent) => {
  const next = event.relatedTarget as Node | null
  if (next && !root.value?.contains(next)) {
    close()
  }
}

const closeOnEscape = (event: KeyboardEvent) => {
  if (!open.value) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  close()
  root.value?.querySelector<HTMLElement>('button, summary')?.focus()
}

onMounted(() => {
  document.addEventListener('click', closeOnOutsideClick)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutsideClick)
  cancelAnimationFrame(positionFrame ?? 0)
})

watch(
  open,
  async (isOpen) => {
    cancelAnimationFrame(positionFrame ?? 0)
    positioned.value = false
    if (isOpen) {
      await nextTick()
      updatePosition()
    }
  },
  { flush: 'post' },
)
</script>

<style scoped>
.app-popover {
  position: relative;
  width: fit-content;
}

.app-popover-content {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-popover);
  color: var(--color-text);
  overflow: auto;
  position: fixed;
  width: var(--app-popover-width, max-content);
  z-index: 31;
}

.app-popover-content-side {
  overflow: visible;
}

.app-popover-content-side::before {
  bottom: 0;
  content: '';
  left: calc(-1 * var(--space-2));
  position: absolute;
  right: calc(-1 * var(--space-2));
  top: 0;
  z-index: -1;
}
</style>
