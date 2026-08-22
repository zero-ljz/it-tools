<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { createSeoHead, siteName } from '@/composable/seo';

const { t } = useI18n();
useHead(computed(() => createSeoHead({
  title: t('app.aboutTitle', `关于 - ${siteName}`),
  description: '了解 IApp 开发者工具箱的开源许可、技术实现和问题反馈方式。',
  path: '/about',
})));
</script>

<template>
  <c-markdown :markdown="$t('about.content')" mx-auto mt-50px max-w-600px />
</template>
