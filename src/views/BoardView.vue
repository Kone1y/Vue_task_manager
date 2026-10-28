<script setup lang="ts">
import { CircleCheck, Document, Loading } from '@element-plus/icons-vue'
import TaskColumn from '@/components/task/TaskColumn.vue'
import TaskFilter from '@/components/task/TaskFilter.vue'
import { useTaskStore } from '@/stores/task'
import { STATUS_LABEL, type Task, type TaskStatus } from '@/types/task'

const store = useTaskStore()

// markRaw：列配置里的 icon 是组件对象。组件对象一旦被深度代理，
// 渲染开销会显著增大并触发 Vue 运行时警告，所以标记为"永不代理"
const columns = [
  {
    key: 'todo' as TaskStatus,
    title: STATUS_LABEL.todo,
    icon: markRaw(Document),
    accent: 'bg-sky-500',
  },
  {
    key: 'doing' as TaskStatus,
    title: STATUS_LABEL.doing,
    icon: markRaw(Loading),
    accent: 'bg-amber-500',
  },
  {
    key: 'done' as TaskStatus,
    title: STATUS_LABEL.done,
    icon: markRaw(CircleCheck),
    accent: 'bg-emerald-500',
  },
]

// computed 派生三列数据：store.filteredTasks 变化时自动重算
const tasksByStatus = computed<Record<TaskStatus, Task[]>>(() => ({
  todo: store.filteredTasks.filter((task) => task.status === 'todo'),
  doing: store.filteredTasks.filter((task) => task.status === 'doing'),
  done: store.filteredTasks.filter((task) => task.status === 'done'),
}))

function handleMove(id: string, status: TaskStatus) {
  store.moveTask(id, status)
}

async function handleRemove(task: Task) {
  const confirmed = await ElMessageBox.confirm(`确定删除「${task.title}」吗？`, '删除任务', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => true)
    .catch(() => false)
  if (confirmed) store.removeTask(task.id)
}
</script>

<template>
  <section class="space-y-4">
    <!-- 统计条：2 列起步，sm 起四列（响应式设计要求点） -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div class="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
        <p class="text-xs text-slate-500">全部任务</p>
        <p class="mt-1 text-2xl font-bold">{{ store.tasksCount }}</p>
      </div>
      <div
        v-for="col in columns"
        :key="col.key"
        class="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800"
      >
        <div class="flex items-center gap-2">
          <span class="size-2 rounded-full" :class="col.accent" />
          <p class="text-xs text-slate-500">{{ col.title }}</p>
        </div>
        <p class="mt-1 text-2xl font-bold">{{ store.countsByStatus[col.key] }}</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <TaskFilter v-model:keyword="store.keyword" v-model:category="store.activeCategory" />
      <el-button v-if="!store.tasksCount" plain @click="store.loadDemoData()">
        载入示例数据
      </el-button>
    </div>

    <!-- 看板：手机单列纵向堆叠，md 起三列并排 -->
    <div class="grid gap-4 md:grid-cols-3">
      <TaskColumn
        v-for="col in columns"
        :key="col.key"
        :status="col.key"
        :title="col.title"
        :tasks="tasksByStatus[col.key]"
        @move="handleMove"
        @remove="handleRemove"
      />
    </div>
  </section>
</template>
