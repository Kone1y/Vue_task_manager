<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { MOCK_PASSWORD, useUserStore } from '@/stores/user'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

// 选型：字段固定、频繁整体变化的表单用 reactive；单一原始值（loading）用 ref。不要混用。
const form = reactive({
  username: '',
  password: '',
})

const formRef = ref<FormInstance>()
const loading = ref(false)

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' },
  ],
}

async function handleLogin() {
  // validate 校验失败会 reject，用 catch 归一为 false
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  // 模拟网络延迟，让 loading 态肉眼可见
  await new Promise((resolve) => setTimeout(resolve, 300))
  const ok = userStore.login(form.username, form.password)
  loading.value = false

  if (!ok) {
    ElMessage.error(`登录失败，演示密码为 ${MOCK_PASSWORD}`)
    return
  }
  ElMessage.success(`欢迎，${userStore.name}！`)
  // 回到守卫记录的来路，没有则进看板
  const redirect = route.query.redirect
  router.push(typeof redirect === 'string' ? redirect : { name: 'board' })
}
</script>

<template>
  <section class="flex min-h-screen items-center justify-center px-4">
    <el-card class="w-full max-w-sm" shadow="always">
      <template #header>
        <h1 class="text-center text-xl font-bold">TaskFlow 登录</h1>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @keyup.enter="handleLogin"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="用户名" autocomplete="username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            show-password
            autocomplete="current-password"
          />
        </el-form-item>
        <el-button type="primary" class="w-full" :loading="loading" @click="handleLogin">
          登录
        </el-button>
      </el-form>

      <p class="mt-3 text-center text-xs text-slate-400">演示账号：任意用户名 / 密码 123456</p>
    </el-card>
  </section>
</template>
