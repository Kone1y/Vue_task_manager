<script setup lang="ts">
import { useTaskStore } from '@/stores/task'
import { CATEGORY_LABEL, PRIORITY_LABEL, STATUS_LABEL, STATUS_ORDER } from '@/types/task'
import { formatDate } from '@/utils/date'

const route = useRoute()
const router = useRouter()
const store = useTaskStore()

// 动态路由参数：/task/:id → route.params.id
// TS 里它的类型是 string | string[]，单段参数直接断言 string
const task = computed(() => store.getTaskById(route.params.id as string))

// computed 跟随路由参数变化：/task/a 跳 /task/b 时组件被复用，task 自动重算
const steps = STATUS_ORDER

function goBack() {
  router.back()
}
</script>

<template>
  <section class="space-y-4">
    <el-page-header @back="goBack">
      <template #content>
        <span class="font-semibold">{{ task?.title ?? '任务不存在' }}</span>
      </template>
    </el-page-header>

    <el-card v-if="task" shadow="never">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="状态">{{ STATUS_LABEL[task.status] }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{
          CATEGORY_LABEL[task.category]
        }}</el-descriptions-item>
        <el-descriptions-item label="优先级">
          {{ PRIORITY_LABEL[task.priority] }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDate(task.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="完成时间">
          {{ task.completedAt ? formatDate(task.completedAt) : '未完成' }}
        </el-descriptions-item>
        <el-descriptions-item label="ID">
          <span class="font-mono text-xs">{{ task.id }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <p v-if="task.description" class="mt-4 whitespace-pre-wrap text-sm leading-6">
        {{ task.description }}
      </p>

      <div class="mt-6">
        <el-steps :active="steps.indexOf(task.status)" align-center class="mb-4">
          <el-step v-for="s in steps" :key="s" :title="STATUS_LABEL[s]" />
        </el-steps>
        <div class="flex gap-2">
          <el-button
            v-for="s in steps"
            :key="s"
            size="small"
            :type="s === task.status ? 'primary' : ''"
            :disabled="s === task.status"
            @click="store.moveTask(task.id, s)"
          >
            {{ STATUS_LABEL[s] }}
          </el-button>
        </div>
      </div>
    </el-card>

    <el-empty v-else description="任务不存在或已被删除">
      <el-button type="primary" @click="router.push({ name: 'board' })">返回看板</el-button>
    </el-empty>
  </section>
</template>
