<script setup lang="ts">
import { Moon, Sunny } from '@element-plus/icons-vue'
import { THEME_KEY } from '@/composables/useTheme'
import { useUserStore } from '@/stores/user'

const now = ref(new Date())
let timer: number | undefined

// 生命周期钩子：挂载启动时钟，卸载前清理
onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 1000)
})
onUnmounted(() => {
  if (timer !== undefined) window.clearInterval(timer)
})

const clock = computed(() => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(now.value.getHours())}:${pad(now.value.getMinutes())}:${pad(now.value.getSeconds())}`
})

// 解构成顶层变量后，模板里 isDark 才会被自动解包（不需要 .value）
const { isDark, toggle } = inject(THEME_KEY)!

const route = useRoute()
const userStore = useUserStore()
const router = useRouter()

const breadcrumbs = computed(() =>
  route.matched.filter((record) => record.meta.breadcrumb).map((record) => record.meta.breadcrumb!),
)

function handleLogout() {
  userStore.logout()
  router.push({ name: 'login' })
}

const navItems = [
  { name: 'board', label: '看板' },
  { name: 'list', label: '列表' },
  { name: 'performance', label: '性能' },
] as const
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90"
  >
    <div class="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4">
      <RouterLink :to="{ name: 'board' }" class="text-lg font-bold text-primary"
        >TaskFlow</RouterLink
      >

      <el-breadcrumb v-if="breadcrumbs.length" separator="/" class="hidden md:block">
        <el-breadcrumb-item :to="{ name: 'board' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-for="item in breadcrumbs" :key="item">
          {{ item }}
        </el-breadcrumb-item>
      </el-breadcrumb>

      <nav class="ml-auto flex items-center gap-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="{ name: item.name }"
          custom
          v-slot="{ navigate, isActive }"
        >
          <el-button text :type="isActive ? 'primary' : ''" @click="navigate">
            {{ item.label }}
          </el-button>
        </RouterLink>
      </nav>

      <span class="hidden font-mono text-sm text-slate-500 lg:inline">{{ clock }}</span>

      <el-button :icon="isDark ? Sunny : Moon" circle text @click="toggle" />

      <el-dropdown v-if="userStore.isLoggedIn">
        <span class="cursor-pointer text-sm font-medium">{{ userStore.name }}</span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>
