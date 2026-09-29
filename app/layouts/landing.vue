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

useHead({
  link: [
    {
      href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Source+Sans+3:wght@300;400;600;700&display=swap',
      rel: 'stylesheet',
    },
  ],
})
</script>

<!-- Global on purpose: these tokens, the reset and the reveal animation are shared by every
     landing component, and everything is fenced under `.landing-root` so the app is not affected. -->
<style>
.landing-root {
  --ink: #0f0e0c;
  --paper: #f7f4ee;
  --cream: #ede9e0;
  --accent: #c84b2f;
  --accent-light: #f0ebe3;
  --muted: #7a7469;
  --border: #d9d4c9;
  --blue: #3b5bdb;
  --blue-light: #eef2ff;
  --serif: 'Montserrat', system-ui, sans-serif;
  --sans: 'Source Sans 3', system-ui, sans-serif;
  --mono: 'JetBrains Mono', monospace;
  --anim-ease: ease;
  --anim-duration: 0.7s;
  --anim-duration-lg: 1.3s;
  --anim-stagger: 0.3s;
  --anim-stagger-sm: 0.18s;
  --anim-demo-duration: 0.45s;
  --anim-demo-step: 0.65s;
  --anim-pulse-duration: 2.2s;

  background: var(--paper);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 16px;
  line-height: 1.6;
  overflow-x: clip;
}

.landing-root :where(*, *::before, *::after) {
  box-sizing: border-box;
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
