<script setup lang="ts">
import { useHead } from '@vueuse/head';

const { t } = useI18n();
useHead({ title: computed(() => t('app.aboutTitle', 'About - IT Tools')) });
</script>

<template>
  <c-markdown :markdown="$t('about.content')" mx-auto mt-50px max-w-600px />
</template>
