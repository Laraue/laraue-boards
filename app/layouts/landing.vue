<template>
  <div
    ref="root"
    class="landing-root">
    <slot />
  </div>
</template>

<script setup lang="ts">
const root = useTemplateRef<HTMLElement>('root')

useScrollReveal(root)
</script>

<!-- Global on purpose: the landing shares the app's tokens (colors, Inter, theme) and only adds a
     reset, the reveal animation and a few aliases, all fenced under `.landing-root` so the app is
     not affected. -->
<style>
.landing-root {
  --anim-ease: ease;
  --anim-duration: 0.7s;
  --anim-duration-lg: 1.3s;
  --anim-stagger: 0.3s;
  --anim-stagger-sm: 0.18s;
  --anim-demo-duration: 0.45s;
  --anim-demo-step: 0.65s;
  --anim-pulse-duration: 2.2s;

  --landing-cta-bg: var(--color-accent);
  --landing-cta-border: transparent;

  background: var(--color-background);
  color: var(--color-text);
  font-size: 16px;
  line-height: 1.6;
  overflow-x: clip;
}

:root[data-theme='dark'] .landing-root {
  --landing-cta-bg: color-mix(in srgb, var(--color-accent) 38%, var(--color-background));
  --landing-cta-border: var(--color-divider);
}

.landing-root :where(*, *::before, *::after) {
  margin: 0;
  padding: 0;
}

.landing-root :where(h1, h2, h3) {
  font-size: inherit;
  letter-spacing: normal;
  overflow: visible;
  text-overflow: clip;
  white-space: normal;
}

.landing-root :where(ul) {
  list-style: none;
}

.landing-root :where(strong) {
  font-weight: 700;
}

@keyframes landing-fade-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (scripting: enabled) {
  .landing-root .reveal {
    opacity: 0;
  }
}

.landing-root .reveal.is-visible {
  animation: landing-fade-up var(--anim-duration) var(--anim-ease) both;
}

@media (prefers-reduced-motion: reduce) {
  .landing-root .reveal,
  .landing-root .reveal.is-visible {
    animation: none;
    opacity: 1;
  }
}
</style>
