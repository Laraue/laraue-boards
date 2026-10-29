<template>
  <div />
</template>

<script setup lang="ts">
import { definePageMeta } from '#app/composables/pages'

// Connected accounts apply to the user in every organization, so they moved to /account.
definePageMeta({ redirect: '/account' })
</script>
