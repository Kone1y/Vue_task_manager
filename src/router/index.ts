import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 路由元信息的类型增强：让 meta.title / meta.requiresAuth 有类型提示
declare module 'vue-router' {
  interface RouteMeta {
    /** 浏览器标签页标题 */
    title?: string
    /** 面包屑显示文本 */
    breadcrumb?: string
    /** 是否需要登录（Login Guard 依据） */
    requiresAuth?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: { name: 'board' } },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/board',
      name: 'board',
      component: () => import('@/views/BoardView.vue'),
      meta: { title: '任务看板', breadcrumb: '看板', requiresAuth: true },
    },
    {
      path: '/list',
      name: 'list',
      component: () => import('@/views/ListView.vue'),
      meta: { title: '任务列表', breadcrumb: '列表', requiresAuth: true },
    },
    {
      // 动态路由：:id 是路径参数，组件内通过 route.params.id 读取
      path: '/task/:id',
      name: 'task-detail',
      component: () => import('@/views/DetailView.vue'),
      meta: { title: '任务详情', breadcrumb: '详情', requiresAuth: true },
    },
    {
      path: '/performance',
      name: 'performance',
      component: () => import('@/views/PerfView.vue'),
      meta: { title: '性能实验室', breadcrumb: '性能', requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: '页面不存在' },
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

// Login Guard：未登录访问受保护页面 → 跳登录页并记录来路；
// 已登录再访问 /login → 直接进看板。
// 注意：useUserStore() 必须写在守卫回调内部（懒执行），不能写在模块顶层。
router.beforeEach((to) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && userStore.isLoggedIn) {
    return { name: 'board' }
  }
})

// 路由元信息应用：统一切换浏览器标签标题
router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · TaskFlow` : 'TaskFlow'
})

export default router
