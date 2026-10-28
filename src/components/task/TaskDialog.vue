<script setup lang="ts">
import AppModal from '@/components/common/AppModal.vue'
import type { Task, TaskFormPayload, TaskSaveEvent } from '@/types/task'

// 阶段三要求点：TaskForm 单独分包，首次打开弹窗才加载（路由懒加载同理）
const TaskForm = defineAsyncComponent(() => import('./TaskForm.vue'))

const visible = ref(false)
const mode = ref<'create' | 'edit'>('create')
const current = ref<Task | null>(null)
const formRef = ref<{ focusTitle: () => void; submitForm: () => void } | null>(null)

const emit = defineEmits<{
  save: [event: TaskSaveEvent]
}>()

// defineExpose 给视图层一个命令式 API，视图不必各自维护 visible/编辑目标状态
function open(createOrEdit: 'create' | 'edit', task?: Task | null) {
  mode.value = createOrEdit
  current.value = task ?? null
  visible.value = true
}

function close() {
  visible.value = false
}

// 入场动画结束后再聚焦，此时 TaskForm 已挂载
function onAfterEnter() {
  formRef.value?.focusTitle()
}

function handleSubmit(payload: TaskFormPayload) {
  emit('save', { mode: mode.value, task: current.value, form: payload })
  close()
}

defineExpose({ open, close })
</script>

<template>
  <AppModal
    v-model="visible"
    :title="mode === 'create' ? '新建任务' : '编辑任务'"
    @after-enter="onAfterEnter"
  >
    <TaskForm ref="formRef" :initial="current" @submit="handleSubmit" />

    <!-- 具名插槽 footer：弹窗底部的操作按钮由调用方组装 -->
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="formRef?.submitForm()">保存</el-button>
    </template>
  </AppModal>
</template>
