<script setup lang="ts">
import type { Task, TaskStatus } from '@/types/task'
import TaskCard from './TaskCard.vue'

const props = defineProps<{
  status: TaskStatus
  title: string
  tasks: Task[]
}>()

// 列把卡片上抛的操作继续转发给 BoardView，自己不做任何数据修改
const emit = defineEmits<{
  move: [id: string, status: TaskStatus]
  edit: [task: Task]
  remove: [task: Task]
}>()

function onDrop(event: DragEvent) {
  const id = event.dataTransfer?.getData('text/plain')
  if (id) emit('move', id, props.status)
}
</script>

<template>
  <section
    class="flex min-h-64 flex-col rounded-xl bg-slate-200/60 p-3 dark:bg-slate-800/60"
    @dragover.prevent
    @drop="onDrop"
  >
    <header class="mb-3 flex items-center justify-between">
      <h2 class="text-sm font-semibold">{{ title }}</h2>
      <el-tag size="small" effect="plain" round>{{ tasks.length }}</el-tag>
    </header>

    <TransitionGroup name="card" tag="div" class="flex flex-1 flex-col gap-3">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @move="(target) => emit('move', task.id, target)"
        @edit="emit('edit', task)"
        @remove="emit('remove', task)"
      />
    </TransitionGroup>

    <p v-if="!tasks.length" class="py-8 text-center text-xs text-slate-400">拖拽任务到这里</p>
  </section>
</template>

<style scoped>
.card-enter-active,
.card-leave-active,
.card-move {
  transition: all 0.25s ease;
}
.card-enter-from,
.card-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
/* leave 的元素脱标，让剩余卡片的 move 位移动画平滑 */
.card-leave-active {
  position: absolute;
}
</style>
