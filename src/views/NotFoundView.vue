<template>
  <section class="p-6 space-y-4">
    <h1 class="text-2xl font-bold">404</h1>
    <p>页面不存在。</p>
    <RouterLink :to="{ name: 'board' }">
      <el-button type="primary">返回看板</el-button>
    </RouterLink>
  </section>
</template>
