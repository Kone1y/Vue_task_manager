<script setup lang="ts">
import type { Task } from '@/types/task'

defineProps<{
  tasks: Task[]
}>()
</script>

<template>
  <ul class="divide-y divide-slate-200 dark:divide-slate-700">
    <li v-for="task in tasks" :key="task.id" class="py-3">
      <!-- 作用域插槽：列表只负责循环，每行怎么渲染由调用方决定；
           插槽体是后备内容，调用方不传时兜底 -->
      <slot name="item" :task="task">
        <span class="text-sm">{{ task.title }}</span>
      </slot>
    </li>
    <li v-if="!tasks.length" class="py-10 text-center text-sm text-slate-400">没有匹配的任务</li>
  </ul>
</template>
