<script setup lang="ts">
import { CircleCheck, Document, Loading } from '@element-plus/icons-vue'
import TaskColumn from '@/components/task/TaskColumn.vue'
import TaskFilter from '@/components/task/TaskFilter.vue'
import TaskDialog from '@/components/task/TaskDialog.vue'
import { useNotification } from '@/composables/useNotification'
import { useTaskStore } from '@/stores/task'
import { STATUS_LABEL, type Task, type TaskSaveEvent, type TaskStatus } from '@/types/task'

const message = useNotification()
const store = useTaskStore()

// markRaw：icon 是组件对象，标记为永不被深度代理
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

const tasksByStatus = computed<Record<TaskStatus, Task[]>>(() => ({
  todo: store.filteredTasks.filter((task) => task.status === 'todo'),
  doing: store.filteredTasks.filter((task) => task.status === 'doing'),
  done: store.filteredTasks.filter((task) => task.status === 'done'),
}))

// 模板 ref 拿到 TaskDialog defineExpose 出来的 open/close
const dialog = ref<InstanceType<typeof TaskDialog> | null>(null)

function openCreate() {
  dialog.value?.open('create')
}

function openEdit(task: Task) {
  dialog.value?.open('edit', task)
}

function handleSave(event: TaskSaveEvent) {
  if (event.mode === 'create') {
    store.addTask(event.form)
    message.success('任务已创建')
  } else if (event.task) {
    store.updateTask(event.task.id, event.form)
    message.success('任务已更新')
  }
}

function handleMove(id: string, status: TaskStatus) {
  store.moveTask(id, status)
  if (status === 'done') {
    const task = store.getTaskById(id)
    if (task) message.notifySuccess('看板', `「${task.title}」已完成`)
  }
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
      <div class="flex gap-2">
        <el-button v-if="!store.tasksCount" plain @click="store.loadDemoData()">
          载入示例数据
        </el-button>
        <el-button type="primary" @click="openCreate">新建任务</el-button>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <TaskColumn
        v-for="col in columns"
        :key="col.key"
        :status="col.key"
        :title="col.title"
        :tasks="tasksByStatus[col.key]"
        @move="handleMove"
        @edit="openEdit"
        @remove="handleRemove"
      />
    </div>

    <TaskDialog ref="dialog" @save="handleSave" />
  </section>
</template>
