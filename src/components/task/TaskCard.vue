<script setup lang="ts">
import {
  CATEGORY_LABEL,
  PRIORITY_LABEL,
  STATUS_LABEL,
  type Category,
  type Task,
  type TaskStatus,
} from '@/types/task'
import { formatDate } from '@/utils/date'

// 阶段三要求点：defineProps 声明只读入参
defineProps<{
  task: Task
}>()

// defineEmits：类型化事件签名，卡片自己不改数据，操作全部上抛（单向数据流）
const emit = defineEmits<{
  move: [status: TaskStatus]
  edit: []
  remove: []
}>()

const CATEGORY_TAG: Record<Category, 'primary' | 'success' | 'warning'> = {
  work: 'primary',
  study: 'success',
  life: 'warning',
}

const PRIORITY_DOT: Record<Task['priority'], string> = {
  low: 'bg-slate-400',
  medium: 'bg-amber-500',
  high: 'bg-red-500',
}
</script>

<template>
  <article
    draggable="true"
    class="cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md active:cursor-grabbing dark:border-slate-700 dark:bg-slate-800"
    @dragstart="$event.dataTransfer?.setData('text/plain', task.id)"
  >
    <div class="mb-2 flex items-start justify-between gap-2">
      <RouterLink
        :to="{ name: 'task-detail', params: { id: task.id } }"
        class="font-medium hover:text-primary"
        :class="{ 'line-through opacity-60': task.status === 'done' }"
      >
        {{ task.title }}
      </RouterLink>
      <span
        class="mt-1 size-2 shrink-0 rounded-full"
        :class="PRIORITY_DOT[task.priority]"
        :title="`优先级：${PRIORITY_LABEL[task.priority]}`"
      />
    </div>

    <p v-if="task.description" class="mb-3 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
      {{ task.description }}
    </p>

    <div class="mb-3 flex flex-wrap items-center gap-2 text-xs">
      <el-tag size="small" :type="CATEGORY_TAG[task.category]" effect="plain">
        {{ CATEGORY_LABEL[task.category] }}
      </el-tag>
      <el-tag v-if="task.status === 'done'" size="small" type="success" effect="plain">
        {{ STATUS_LABEL.done }}
      </el-tag>
      <span class="text-slate-400">{{ formatDate(task.createdAt) }}</span>
    </div>

    <div class="flex items-center gap-1">
      <el-button
        v-if="task.status === 'todo'"
        size="small"
        type="primary"
        plain
        @click="emit('move', 'doing')"
      >
        开始
      </el-button>
      <el-button
        v-if="task.status === 'doing'"
        size="small"
        type="success"
        plain
        @click="emit('move', 'done')"
      >
        完成
      </el-button>
      <el-button v-if="task.status === 'done'" size="small" plain @click="emit('move', 'todo')">
        重新打开
      </el-button>
      <el-button size="small" text @click="emit('edit')">编辑</el-button>
      <el-button size="small" text type="danger" @click="emit('remove')">删除</el-button>
    </div>
  </article>
</template>
