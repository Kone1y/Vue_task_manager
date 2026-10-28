<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  PRIORITY_LABEL,
  PRIORITY_ORDER,
  type Task,
  type TaskFormPayload,
} from '@/types/task'

const props = defineProps<{
  /** 编辑时传入原任务；新建传 null */
  initial?: Task | null
}>()

const emit = defineEmits<{
  submit: [payload: TaskFormPayload]
}>()

// 阶段二选型：结构固定的表单对象用 reactive，省掉 .value
const form = reactive<TaskFormPayload>({
  title: '',
  description: '',
  category: 'work',
  priority: 'medium',
})

const formRef = ref<FormInstance>()
const titleInputRef = ref<{ focus: () => void }>()

const rules: FormRules = {
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' },
    { max: 50, message: '标题不超过 50 字', trigger: 'blur' },
  ],
}

// 弹窗复用同一个表单实例：initial（编辑目标）变化时同步表单值
watch(
  () => props.initial,
  (task) => {
    if (task) {
      Object.assign(form, {
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
      })
    } else {
      reset()
    }
  },
  { immediate: true },
)

function reset() {
  Object.assign(form, { title: '', description: '', category: 'work', priority: 'medium' })
  formRef.value?.clearValidate()
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  // reactive 是 Proxy，展开即得纯对象快照，交给上层处理
  emit('submit', { ...form })
}

function focusTitle() {
  titleInputRef.value?.focus()
}

// 阶段三要求点：把"聚焦标题 / 触发提交"暴露给父组件 TaskDialog 调用
defineExpose({ focusTitle, submitForm: handleSubmit })
</script>

<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-position="top"
    @submit.prevent="handleSubmit"
  >
    <el-form-item label="标题" prop="title">
      <el-input ref="titleInputRef" v-model="form.title" placeholder="任务标题" maxlength="50" />
    </el-form-item>
    <el-form-item label="描述">
      <el-input
        v-model="form.description"
        type="textarea"
        :rows="3"
        placeholder="补充描述（可选）"
      />
    </el-form-item>
    <div class="grid grid-cols-2 gap-3">
      <el-form-item label="分类">
        <el-select v-model="form.category">
          <el-option v-for="c in CATEGORY_ORDER" :key="c" :value="c" :label="CATEGORY_LABEL[c]" />
        </el-select>
      </el-form-item>
      <el-form-item label="优先级">
        <el-select v-model="form.priority">
          <el-option v-for="p in PRIORITY_ORDER" :key="p" :value="p" :label="PRIORITY_LABEL[p]" />
        </el-select>
      </el-form-item>
    </div>
  </el-form>
</template>
