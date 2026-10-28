<script setup lang="ts">
// storeToRefs 显式导入（不依赖 auto-import preset 是否包含它，确定性优先）
import { storeToRefs } from 'pinia'
import TaskList from '@/components/common/TaskList.vue'
import TaskDialog from '@/components/task/TaskDialog.vue'
import TaskFilter from '@/components/task/TaskFilter.vue'
import { useTaskStore } from '@/stores/task'
import { CATEGORY_LABEL, PRIORITY_LABEL, type Task, type TaskSaveEvent } from '@/types/task'
import { formatDate } from '@/utils/date'

const store = useTaskStore()

// storeToRefs 解构陷阱：直接 const { keyword } = store 解构出来的是一次性普通值，
// 丢失响应性；storeToRefs 才能把 state / getter 转成仍然连接到 store 的 ref。
const { keyword, activeCategory, filteredTasks } = storeToRefs(store)

const dialog = ref<InstanceType<typeof TaskDialog> | null>(null)

function openCreate() {
  dialog.value?.open('create')
}

function openEdit(task: Task) {
  dialog.value?.open('edit', task)
}

function advance(task: Task) {
  // 一键推进：todo → doing → done
  store.moveTask(task.id, task.status === 'todo' ? 'doing' : 'done')
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

function handleSave(event: TaskSaveEvent) {
  if (event.mode === 'create') {
    store.addTask(event.form)
    ElMessage.success('任务已创建')
  } else if (event.task) {
    store.updateTask(event.task.id, event.form)
    ElMessage.success('任务已更新')
  }
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-lg font-bold">任务列表</h1>
      <el-button type="primary" @click="openCreate">新建任务</el-button>
    </div>

    <!-- v-model 绑定的是 storeToRefs 解构出的 ref，写入会直达 store -->
    <TaskFilter v-model:keyword="keyword" v-model:category="activeCategory" />

    <div class="rounded-xl bg-white px-4 shadow-sm dark:bg-slate-800">
      <TaskList :tasks="filteredTasks">
        <template #item="{ task }">
          <div class="flex flex-wrap items-center gap-3 py-1">
            <RouterLink
              :to="{ name: 'task-detail', params: { id: task.id } }"
              class="min-w-0 flex-1 truncate text-sm font-medium hover:text-primary"
              :class="{ 'line-through opacity-60': task.status === 'done' }"
            >
              {{ task.title }}
            </RouterLink>
            <el-tag size="small" effect="plain">{{ CATEGORY_LABEL[task.category] }}</el-tag>
            <el-tag size="small" effect="plain" type="info">
              {{ PRIORITY_LABEL[task.priority] }}优先级
            </el-tag>
            <span class="text-xs text-slate-400">{{ formatDate(task.createdAt) }}</span>
            <el-button
              v-if="task.status !== 'done'"
              size="small"
              text
              type="primary"
              @click="advance(task)"
            >
              {{ task.status === 'todo' ? '开始' : '完成' }}
            </el-button>
            <el-button size="small" text @click="openEdit(task)">编辑</el-button>
            <el-button size="small" text type="danger" @click="handleRemove(task)">删除</el-button>
          </div>
        </template>
      </TaskList>
    </div>

    <TaskDialog ref="dialog" @save="handleSave" />
  </section>
</template>
