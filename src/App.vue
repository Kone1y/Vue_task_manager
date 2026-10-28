<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import { THEME_KEY, useTheme } from '@/composables/useTheme'

const theme = useTheme()
// 依赖注入：把主题下发给任意深度的子组件，避免逐层 props
provide(THEME_KEY, theme)

const route = useRoute()
const appTitle = 'TaskFlow' // Task 15 改为读取 import.meta.env.VITE_APP_TITLE
</script>

<template>
  <div
    class="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100"
  >
    <AppHeader v-if="route.name !== 'login'" />
    <main class="mx-auto w-full max-w-6xl px-4 py-6">
      <RouterView />
    </main>
    <!-- v-once：静态内容只渲染一次，后续更新跳过 diff -->
    <footer v-once class="py-6 text-center text-xs text-slate-400">
      {{ appTitle }} · Vue3 学习项目
    </footer>
  </div>
</template>
