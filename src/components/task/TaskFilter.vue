<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { CATEGORY_LABEL, CATEGORY_ORDER, type Category } from '@/types/task'

// defineModel：替代 "props + emit('update:xxx')" 样板，父组件直接 v-model:keyword
const keyword = defineModel<string>('keyword', { default: '' })
const category = defineModel<Category | 'all'>('category', { default: 'all' })
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <el-input
      v-model="keyword"
      placeholder="搜索标题 / 描述"
      clearable
      :prefix-icon="Search"
      class="w-full sm:w-64"
    />
    <el-radio-group v-model="category">
      <el-radio-button value="all">全部</el-radio-button>
      <el-radio-button v-for="c in CATEGORY_ORDER" :key="c" :value="c">
        {{ CATEGORY_LABEL[c] }}
      </el-radio-button>
    </el-radio-group>
  </div>
</template>
