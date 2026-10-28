<script setup lang="ts">
import { Minus, TrendCharts } from '@element-plus/icons-vue'
import type { Component } from 'vue'

interface PerfRow {
  id: number
  label: string
  score: number
  selected: boolean
  icon: Component // markRaw 过的组件对象
}

const rowCount = ref(5000)
const useMemo = ref(true)
const renderMs = ref<number | null>(null)

// shallowRef：只追踪 .value 的整体替换，内部行对象不被深度代理，
// 万行级数据不再付出 Proxy 化开销
const rows = shallowRef<PerfRow[]>([])

function generate() {
  const next: PerfRow[] = Array.from({ length: rowCount.value }, (_, i) => ({
    id: i,
    label: `任务 #${i}`,
    score: Math.round(Math.random() * 100),
    selected: false,
    // markRaw：组件对象永远不该被代理，否则触发运行时性能警告
    icon: markRaw(i % 2 === 0 ? TrendCharts : Minus),
  }))
  const start = performance.now()
  rows.value = next
  nextTick().then(() => {
    renderMs.value = Math.round((performance.now() - start) * 100) / 100
  })
}

// 浅层模式的"修改"必须整体替换数组；直接改 rows.value[0].score 不会触发更新
function bumpScores() {
  const start = performance.now()
  rows.value = rows.value.map((row) => ({ ...row, score: row.score + 1 }))
  nextTick().then(() => {
    renderMs.value = Math.round((performance.now() - start) * 100) / 100
  })
}

function selectRandom() {
  const list = rows.value
  if (!list.length) return
  const target = Math.floor(Math.random() * list.length)
  rows.value = list.map((row, i) => (i === target ? { ...row, selected: !row.selected } : row))
}

// 与列表毫无关系的响应式状态，用来观察 v-memo 的价值
const unrelated = ref(0)
</script>

<template>
  <section class="space-y-4">
    <!-- v-once：纯静态说明只渲染一次，之后的组件更新直接跳过 -->
    <div v-once class="rounded-xl bg-white p-4 text-sm leading-6 shadow-sm dark:bg-slate-800">
      <p class="font-semibold">性能实验室（阶段五）</p>
      <p>
        shallowRef 只对 .value 整体替换做响应追踪，避开大数据量的深度代理； v-memo
        缓存依赖未变化的行，无关更新不再整表重渲染。 实验：生成 2 万行 → 连点「无关更新」→ 对比开/关
        v-memo 的耗时。
      </p>
    </div>

    <div
      class="flex flex-wrap items-center gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800"
    >
      <el-input-number v-model="rowCount" :min="1000" :max="20000" :step="1000" />
      <el-checkbox :model-value="true" disabled>
        shallowRef 已启用（rows 即 shallowRef）
      </el-checkbox>
      <el-checkbox v-model="useMemo">v-memo</el-checkbox>
      <el-button type="primary" @click="generate">生成列表</el-button>
      <el-button :disabled="!rows.length" @click="bumpScores">全部 score+1</el-button>
      <el-button :disabled="!rows.length" @click="selectRandom">随机勾选一行</el-button>
      <el-button @click="unrelated++">无关更新（{{ unrelated }}）</el-button>
      <el-tag v-if="renderMs !== null" type="warning">耗时 {{ renderMs }} ms</el-tag>
    </div>

    <div class="max-h-[60vh] overflow-auto rounded-xl bg-white px-4 shadow-sm dark:bg-slate-800">
      <div
        v-for="row in rows"
        :key="row.id"
        v-memo="useMemo ? [row.selected, row.score] : [row.score, unrelated]"
        class="flex items-center gap-3 border-b border-slate-100 py-2 text-sm dark:border-slate-700"
      >
        <el-checkbox :model-value="row.selected" />
        <el-icon><component :is="row.icon" /></el-icon>
        <span class="flex-1">{{ row.label }}</span>
        <span class="font-mono">{{ row.score }}</span>
      </div>
      <p v-if="!rows.length" class="py-10 text-center text-sm text-slate-400">
        点击「生成列表」开始实验
      </p>
    </div>
  </section>
</template>
