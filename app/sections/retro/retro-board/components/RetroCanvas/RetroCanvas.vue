<template>
  <div
    ref="wrapper"
    class="canvas-wrapper"
    @dblclick="onDoubleClick"
    @pointerdown="startScenePan"
    @pointermove="onScenePointerMove"
    @wheel.prevent="onWheel">
    <div
      class="scene"
      :style="{
        transform: `translate(${state.offset.x}px, ${state.offset.y}px) scale(${state.scale})`,
      }">
      <slot :start-node-drag="startNodeDrag" />
    </div>
    <div
      class="zoom-controls"
      @dblclick.stop
      @pointerdown.stop>
      <button
        aria-label="Zoom out"
        class="icon-btn"
        type="button"
        @click="zoomBy(-1)">
        <Minus />
      </button>
      <button
        class="secondary zoom-value"
        title="Reset view"
        type="button"
        @click="reset">
        {{ Math.round(state.scale * 100) }}%
      </button>
      <button
        aria-label="Zoom in"
        class="icon-btn"
        type="button"
        @click="zoomBy(1)">
        <Plus />
      </button>
      <slot name="controls" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Minus, Plus } from '@lucide/vue'

const props = defineProps<{
  onBackgroundPointerDown: () => void
  onCanvasDoubleClick: (point: { x: number; y: number }) => void
  onCursorMove: (point: { x: number; y: number }) => void
  onNodeMove: (deltaX: number, deltaY: number) => void
  onNodeMoveEnd: () => void
}>()
// Pan/zoom mechanics follow the flow-editor SceneWrapper: delta-based drags, pointer-anchored zoom.
const MIN_SCALE = 0.2
const MAX_SCALE = 2
const ZOOM_SENSITIVITY_MOUSE = 0.025
const ZOOM_SENSITIVITY_PINCH = 0.125
const PAN_SENSITIVITY_TRACKPAD = 1
const AUTOPAN_EDGE = 48
const AUTOPAN_SPEED = 10

const wrapper = useTemplateRef<HTMLDivElement>('wrapper')
const pointers = new Map<number, { x: number; y: number }>()
let pinch: undefined | { centerX: number; centerY: number; distance: number }

const state = reactive({
  autoPan: { rafId: 0, x: 0, y: 0 },
  drag: 'none' as 'node' | 'none' | 'scene',
  last: { x: 0, y: 0 },
  offset: { x: 32, y: 112 },
  scale: 1,
  wheelInputType: null as 'mouse' | 'trackpad' | null,
})

const startScenePan = (event: PointerEvent) => {
  props.onBackgroundPointerDown()
  trackPointer(event)
  if (startPinch()) {
    return
  }
  state.wheelInputType = null
  state.drag = 'scene'
  state.last = { x: event.clientX, y: event.clientY }
  tapStart = { x: event.clientX, y: event.clientY }
}

const startNodeDrag = (event: PointerEvent) => {
  event.stopPropagation()
  trackPointer(event)
  if (startPinch()) {
    return
  }
  state.wheelInputType = null
  state.drag = 'node'
  state.last = { x: event.clientX, y: event.clientY }
}

const onPointerMove = (event: PointerEvent) => {
  if (event.pointerType === 'touch' && pointers.has(event.pointerId)) {
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.size > 1) {
      event.preventDefault()
      updatePinch()
      return
    }
  }
  if (state.drag === 'none') {
    return
  }
  event.preventDefault()
  const deltaX = event.clientX - state.last.x
  const deltaY = event.clientY - state.last.y

  if (deltaX === 0 && deltaY === 0) {
    return
  }
  state.last = { x: event.clientX, y: event.clientY }

  if (state.drag === 'scene') {
    state.offset = { x: state.offset.x + deltaX, y: state.offset.y + deltaY }
    return
  }
  props.onNodeMove(deltaX / state.scale, deltaY / state.scale)
  updateAutoPan(event.clientX, event.clientY)
}

const onPointerUp = (event: PointerEvent) => {
  pointers.delete(event.pointerId)
  if (pinch) {
    pinch = undefined
    const remaining = pointers.values().next().value
    state.drag = remaining ? 'scene' : 'none'
    if (remaining) {
      state.last = remaining
    }
    return
  }
  const finished = state.drag

  state.drag = 'none'
  state.wheelInputType = null
  stopAutoPan()
  if (finished === 'node') {
    props.onNodeMoveEnd()
  }
  if (finished === 'scene' && event.pointerType === 'touch') {
    detectDoubleTap(event)
  }
  tapStart = undefined
}

// Mobile browsers don't synthesize dblclick from a double-tap once touch-action: none disables the
// native zoom gesture that dblclick piggybacks on, so double-tap-to-create needs its own detection.
const TAP_MOVE_LIMIT = 24
const DOUBLE_TAP_MS = 300
let lastTap: undefined | { time: number; x: number; y: number }
let tapStart: undefined | { x: number; y: number }

const detectDoubleTap = (event: PointerEvent) => {
  if (
    !tapStart ||
    Math.hypot(event.clientX - tapStart.x, event.clientY - tapStart.y) > TAP_MOVE_LIMIT
  ) {
    lastTap = undefined
    return
  }
  const point = toScene(event.clientX, event.clientY)
  const now = Date.now()

  if (
    point &&
    lastTap &&
    now - lastTap.time < DOUBLE_TAP_MS &&
    Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) < TAP_MOVE_LIMIT
  ) {
    props.onCanvasDoubleClick(point)
    lastTap = undefined
    return
  }
  lastTap = { time: now, x: event.clientX, y: event.clientY }
}

const trackPointer = (event: PointerEvent) => {
  if (event.pointerType === 'touch') {
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  }
}

const pinchMetrics = () => {
  const [first, second] = [...pointers.values()]

  if (!first || !second) {
    return undefined
  }
  return {
    centerX: (first.x + second.x) / 2,
    centerY: (first.y + second.y) / 2,
    distance: Math.hypot(second.x - first.x, second.y - first.y),
  }
}

const startPinch = () => {
  const metrics = pinchMetrics()

  if (!metrics) {
    return false
  }
  if (state.drag === 'node') {
    props.onNodeMoveEnd()
  }
  stopAutoPan()
  state.drag = 'none'
  pinch = metrics
  return true
}

const updatePinch = () => {
  const next = pinchMetrics()

  if (!next) {
    return
  }
  if (!pinch) {
    pinch = next
    return
  }
  const rect = wrapper.value?.getBoundingClientRect()

  if (!rect || pinch.distance === 0) {
    return
  }
  const previous = pinch
  zoomAt(
    state.scale * (next.distance / previous.distance),
    next.centerX - rect.left,
    next.centerY - rect.top,
  )
  state.offset = {
    x: state.offset.x + next.centerX - previous.centerX,
    y: state.offset.y + next.centerY - previous.centerY,
  }
  pinch = next
}

const autoPanStep = () => {
  if (state.drag !== 'node' || (state.autoPan.x === 0 && state.autoPan.y === 0)) {
    return stopAutoPan()
  }
  const panX = state.autoPan.x * AUTOPAN_SPEED
  const panY = state.autoPan.y * AUTOPAN_SPEED

  state.offset = { x: state.offset.x + panX, y: state.offset.y + panY }
  props.onNodeMove(-panX / state.scale, -panY / state.scale)
  state.autoPan.rafId = requestAnimationFrame(autoPanStep)
}

const edgeFactor = (position: number, start: number, end: number) => {
  if (position < start + AUTOPAN_EDGE) {
    return Math.min((start + AUTOPAN_EDGE - position) / AUTOPAN_EDGE, 1)
  }
  if (position > end - AUTOPAN_EDGE) {
    return -Math.min((position - (end - AUTOPAN_EDGE)) / AUTOPAN_EDGE, 1)
  }
  return 0
}

const updateAutoPan = (clientX: number, clientY: number) => {
  const rect = wrapper.value?.getBoundingClientRect()

  if (!rect) {
    return
  }
  state.autoPan = {
    ...state.autoPan,
    x: edgeFactor(clientX, rect.left, rect.right),
    y: edgeFactor(clientY, rect.top, rect.bottom),
  }
  if (state.autoPan.rafId === 0 && (state.autoPan.x !== 0 || state.autoPan.y !== 0)) {
    state.autoPan.rafId = requestAnimationFrame(autoPanStep)
  }
}

const stopAutoPan = () => {
  if (state.autoPan.rafId !== 0) {
    cancelAnimationFrame(state.autoPan.rafId)
  }
  state.autoPan = { rafId: 0, x: 0, y: 0 }
}

const onWheel = (event: WheelEvent) => {
  const rect = wrapper.value?.getBoundingClientRect()

  if (!rect) {
    return
  }
  const threshold = 0.1
  const looksLikeTrackpad =
    (Math.abs(event.deltaY) > threshold && Math.abs(event.deltaY) % 1 !== 0) ||
    Math.abs(event.deltaX) > threshold

  state.wheelInputType ??= looksLikeTrackpad && !event.ctrlKey ? 'trackpad' : 'mouse'

  const pointerX = event.clientX - rect.left
  const pointerY = event.clientY - rect.top

  if (state.wheelInputType === 'trackpad' && !event.ctrlKey) {
    state.offset = {
      x: state.offset.x - event.deltaX * PAN_SENSITIVITY_TRACKPAD,
      y: state.offset.y - event.deltaY * PAN_SENSITIVITY_TRACKPAD,
    }
    return
  }

  const sensitivity =
    event.ctrlKey && state.wheelInputType === 'trackpad'
      ? ZOOM_SENSITIVITY_PINCH
      : ZOOM_SENSITIVITY_MOUSE
  const delta = -event.deltaY * sensitivity * (event.deltaMode === 1 ? 10 : 0.1)

  if (Math.abs(delta) < 1e-6) {
    return
  }
  zoomAt(state.scale * Math.exp(delta), pointerX, pointerY)
}

const zoomAt = (nextScale: number, pointerX: number, pointerY: number) => {
  const scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextScale))

  if (Math.abs(scale - state.scale) < 1e-7) {
    return
  }
  const sceneX = (pointerX - state.offset.x) / state.scale
  const sceneY = (pointerY - state.offset.y) / state.scale

  state.offset = { x: pointerX - sceneX * scale, y: pointerY - sceneY * scale }
  state.scale = scale
}

const zoomBy = (direction: number) => {
  const rect = wrapper.value?.getBoundingClientRect()
  const percent = Math.round(state.scale * 100)
  const next =
    direction > 0 ? Math.ceil(percent / 10) * 10 + 10 : Math.floor(percent / 10) * 10 - 10

  zoomAt(next / 100, (rect?.width ?? 0) / 2, (rect?.height ?? 0) / 2)
}

const toScene = (clientX: number, clientY: number) => {
  const rect = wrapper.value?.getBoundingClientRect()

  return rect
    ? {
        x: (clientX - rect.left - state.offset.x) / state.scale,
        y: (clientY - rect.top - state.offset.y) / state.scale,
      }
    : undefined
}

// Cursors travel in scene coordinates so they land in the same spot at any zoom level.
const onScenePointerMove = (event: PointerEvent) => {
  const point = toScene(event.clientX, event.clientY)

  if (point) {
    props.onCursorMove(point)
  }
}

const onDoubleClick = (event: MouseEvent) => {
  const point = toScene(event.clientX, event.clientY)

  if (point) {
    props.onCanvasDoubleClick(point)
  }
}

const reset = () => {
  state.offset = { x: 32, y: 112 }
  state.scale = 1
}

onMounted(() => {
  window.addEventListener('pointermove', onPointerMove, { passive: false })
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
  pointers.clear()
  stopAutoPan()
})

defineExpose({ reset })
</script>

<style scoped>
.canvas-wrapper {
  background:
    radial-gradient(circle, var(--color-border) 1px, transparent 1px) 0 0 / 24px 24px,
    var(--color-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  height: 100%;
  min-height: 0;
  overflow: hidden;
  overscroll-behavior: none;
  position: relative;
  touch-action: none;
  user-select: none;
}

.scene {
  height: 0;
  left: 0;
  overflow: visible;
  position: absolute;
  top: 0;
  transform-origin: top left;
  width: 0;
}

.zoom-controls {
  align-items: center;
  bottom: var(--space-4);
  display: flex;
  gap: var(--space-1);
  position: absolute;
  right: var(--space-4);
  z-index: 2;
}

.zoom-value {
  height: var(--icon-btn-size);
  justify-content: center;
  min-width: 60px;
  padding: 0 var(--space-2);
}
</style>
