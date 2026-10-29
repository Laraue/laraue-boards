<template>
  <section
    class="section"
    :class="type">
    <div class="section-inner">
      <LandingHeading
        :post-title="postTitle"
        :pre-title="preTitle"
        :title="title" />
      <div class="section-body">
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import LandingHeading from './LandingHeading.vue'

defineProps<{
  postTitle?: string
  preTitle?: string
  title: string
  type: 'alt' | 'plain'
}>()
</script>

<style scoped>
.section {
  border-bottom: 1px solid var(--color-divider);
  padding: 112px 24px;
}

.section.alt {
  background: var(--color-workspace);
}

.section-inner {
  margin: 0 auto;
  /* The width of the header and footer (1360px with 24px of padding), so the page lines up with them. */
  max-width: 1312px;
}

.section-body {
  margin-top: 56px;
}

@media (width <= 900px) {
  .section {
    padding: 72px 16px;
  }

  .section-body {
    margin-top: 40px;
  }
}
</style>
