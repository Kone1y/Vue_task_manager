# TaskFlow —— Vue3 任务管理系统 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 create-vue 脚手架（`D:\AppCode\langchain\vue_las`）基础上，清理演示代码，构建一个带任务看板、分类筛选、LocalStorage 持久化、深色模式、响应式布局的任务管理系统 TaskFlow，覆盖用户指定的 6 个学习阶段。

**Architecture:** 纯前端 SPA，无后端。Pinia 管理全局状态（TaskStore / UserStore），自写 Pinia 持久化插件同步 LocalStorage；Vue Router 做登录守卫 + 动态路由；Element Plus 提供基础组件，Tailwind CSS v4 负责原子化布局；所有业务逻辑集中在 stores 与 composables，视图组件只做组装。

**Tech Stack:** Vue 3.5 (`<script setup>`) + Vite 8 + TypeScript + Pinia 4 + Vue Router 5 + Element Plus + Tailwind CSS 4 + unplugin-auto-import / unplugin-vue-components + Husky + Vitest + Playwright（既有）。

---

## 约定（执行前必读）

- 所有命令在 `D:\AppCode\langchain\vue_las` 目录下执行；shell 为 bash（Windows Git Bash）。
- 项目当前**不是 git 仓库**，Task 1 会 `git init`。提交信息用 Conventional Commits（`feat:` / `test:` / `chore:` / `build:`）。
- git 用户名若未配置，先执行：`git config user.name "Kone1y"`、`git config user.email "Kone1y@users.noreply.github.com"`。
- Node 版本要求 ≥ 22.18（`node -v` 确认）。
- 依赖安装一律用 `npm install <pkg>`（不要改用 pnpm/yarn，lockfile 是 npm 的）。
- 单测命令：`npx vitest run <文件路径>`（`npm run test:unit` 是 watch 模式）。
- 每个任务结束必须跑一次 `npm run type-check`，通过了再提交。
- **演示登录**：用户名任意，密码固定 `123456`（`src/stores/user.ts` 中的 `MOCK_PASSWORD` 常量）。

## 学习阶段 → 任务映射

| 阶段 | 内容 | 对应任务 |
|---|---|---|
| 一 | Vite 深度配置、ESLint+Prettier+Husky、Tailwind | Task 1–3 |
| 二 | ref/reactive、computed 过滤、watchEffect、生命周期 | Task 4–9 |
| 三 | defineProps/Emits/Expose、provide/inject、插槽、异步组件 | Task 7、10、11 |
| 四 | Pinia 双 Store、持久化插件、storeToRefs、动态路由、守卫、meta | Task 5、6、12 |
| 五 | useLocalStorage/useNotification、shallowRef/markRaw、v-once/v-memo | Task 4、13、14 |
| 六 | 环境变量、manualChunks+Gzip、Docker、GitHub Actions | Task 15–18 |
| 收尾 | e2e 冒烟、README、整体验证 | Task 19 |

> 注：`useLocalStorage` 在 Task 4 提前实现（深色模式与持久化都依赖它），阶段五只剩 useNotification 与性能优化，属有意重排，不是遗漏。

## 目标文件结构

```
vue_las/
├── .env.development            # 开发环境变量（VITE_APP_TITLE 等）
├── .env.production             # 生产环境变量
├── .github/workflows/ci.yml    # GitHub Actions CI
├── .husky/pre-commit           # git 钩子 → lint-staged
├── Dockerfile                  # 两阶段构建：node 构建 → nginx 托管
├── nginx.conf                  # SPA history 回退 + gzip + 缓存
├── .dockerignore
├── auto-imports.d.ts           # unplugin-auto-index 生成，提交入库
├── components.d.ts             # unplugin-vue-components 生成，提交入库
├── index.html                  # 重写：zh-CN + TaskFlow 标题
├── vite.config.ts              # 别名 + Tailwind + 自动导入 + 分包 + gzip
├── eslint.config.ts            # 追加自动导入 globals
├── docs/plans/                 # 本计划
├── e2e/vue.spec.ts             # 重写：登录 → 看板 → 新建任务 冒烟
└── src/
    ├── main.ts                 # pinia(挂持久化插件) + router + EP 暗色变量
    ├── App.vue                 # 布局 + provide 主题 + v-once 页脚
    ├── assets/main.css         # Tailwind 入口（无 preflight，避免与 EP 冲突）
    ├── types/task.ts           # Task/TaskStatus/Category/Priority + 标签常量
    ├── utils/date.ts           # formatDate
    ├── composables/
    │   ├── useLocalStorage.ts  # 响应式 localStorage（TDD）
    │   ├── useTheme.ts         # 深色模式：useLocalStorage + watchEffect + provide/inject 键
    │   └── useNotification.ts  # ElMessage/ElNotification 封装（TDD）
    ├── stores/
    │   ├── task.ts             # 任务 CRUD + computed 过滤/统计（TDD）
    │   ├── user.ts             # 登录态（TDD）
    │   └── plugins/persistence.ts  # Pinia 持久化插件（TDD）
    ├── router/index.ts         # 路由表 + 登录守卫 + meta 标题 + RouteMeta 类型
    ├── views/
    │   ├── LoginView.vue       # 登录（reactive 表单 + el-form 校验）
    │   ├── BoardView.vue       # 看板：统计 + 筛选 + 三列 + 拖拽 + 弹窗
    │   ├── ListView.vue        # 列表：筛选 + 作用域插槽行 + 操作
    │   ├── DetailView.vue      # /task/:id 动态路由详情
    │   ├── PerfView.vue        # 性能实验室：shallowRef/v-memo/markRaw 演示
    │   └── NotFoundView.vue    # 404
    └── components/
        ├── layout/AppHeader.vue        # 导航 + 时钟(生命周期) + 主题切换(inject) + 用户菜单
        ├── common/AppModal.vue         # Teleport+Transition+具名插槽+defineModel
        ├── common/TaskList.vue         # 作用域插槽列表（含组件测试）
        └── task/
            ├── TaskColumn.vue          # 看板列：drop 目标 + 卡片插槽转发
            ├── TaskCard.vue            # 任务卡：props/emits、状态推进、详情链接
            ├── TaskForm.vue            # 表单（reactive + 校验 + defineExpose focusTitle）
            └── TaskDialog.vue          # defineAsyncComponent 加载 TaskForm + defineExpose open/close

删除：App_1.vue、HelloWorld.vue、TheWelcome.vue、WelcomeItem.vue、icons/、
     AboutView.vue、HomeView.vue、counter.ts、base.css、logo.svg、旧 HelloWorld.spec.ts
```

---

## 阶段一：项目架构与环境准备

### Task 1: git 初始化 + 清理脚手架 + 最小可运行骨架

**Files:**
- Delete: `src/components/App_1.vue`、`src/components/HelloWorld.vue`、`src/components/TheWelcome.vue`、`src/components/WelcomeItem.vue`、`src/components/icons/`（整个目录）、`src/components/__tests__/`（整个目录）、`src/views/AboutView.vue`、`src/views/HomeView.vue`、`src/stores/counter.ts`、`src/assets/base.css`、`src/assets/logo.svg`
- Rewrite: `index.html`、`src/App.vue`、`src/router/index.ts`、`src/assets/main.css`
- Create: `src/views/BoardView.vue`

- [ ] **Step 1: git 初始化并确认身份配置**

```bash
node -v          # 期望 v22.18+ 或 v24+
git init
git config user.name || git config user.name "Kone1y"
git config user.email || git config user.email "Kone1y@users.noreply.github.com"
git add -A && git commit -m "chore: create-vue 脚手架基线"
```

- [ ] **Step 2: 删除演示文件**

```bash
rm src/components/App_1.vue src/components/HelloWorld.vue src/components/TheWelcome.vue src/components/WelcomeItem.vue
rm -r src/components/icons src/components/__tests__
rm src/views/AboutView.vue src/views/HomeView.vue
rm src/stores/counter.ts
rm src/assets/base.css src/assets/logo.svg
```

- [ ] **Step 3: 重写 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" href="/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TaskFlow</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 4: 重写 src/router/index.ts（最小骨架，Task 6 再扩展）**

```ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'board',
      component: () => import('@/views/BoardView.vue'),
      meta: { title: '任务看板' },
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
```

- [ ] **Step 5: 新建占位 src/views/BoardView.vue**

```vue
<template>
  <section class="p-6">
    <h1 class="text-xl font-bold">任务看板</h1>
    <p>骨架占位，看板将在 Task 9 实现。</p>
  </section>
</template>
```

- [ ] **Step 6: 重写 src/App.vue（临时占位，Task 7 再扩展）**

```vue
<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>
```

- [ ] **Step 7: 清空 src/assets/main.css**

```css
/* Tailwind 将在 Task 2 接入 */
```

- [ ] **Step 8: 验证**

```bash
npm run type-check   # 期望 PASS，无输出错误
npm run dev          # 后台启动；curl -s http://localhost:5173 应返回含 <title>TaskFlow</title> 的 HTML；浏览器访问显示“任务看板”
```

- [ ] **Step 9: 提交**

```bash
git add -A && git commit -m "chore: 清理脚手架演示代码，搭建 TaskFlow 最小骨架"
```

### Task 2: Tailwind CSS 4 + Element Plus + 自动导入插件 + Vite 深度配置

**Files:**
- Modify: `package.json`（依赖）
- Rewrite: `vite.config.ts`、`src/assets/main.css`、`src/main.ts`、`env.d.ts`
- Modify: `tsconfig.app.json`、`eslint.config.ts`
- Create（构建时自动生成，提交入库）: `auto-imports.d.ts`、`components.d.ts`

- [ ] **Step 1: 安装依赖**

```bash
npm install element-plus @element-plus/icons-vue
npm install -D tailwindcss @tailwindcss/vite unplugin-auto-import unplugin-vue-components
npm rm @vitejs/plugin-vue-jsx
```

若 `vite-plugin-compression` 留到 Task 16 再装，本任务不装。

- [ ] **Step 2: 重写 vite.config.ts（别名保留 + 新插件 + 生产 gzip 预留位）**

```ts
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    AutoImport({
      // vue / vue-router / pinia 的 API 全局自动导入：ref、computed、useRoute…
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()],
      dts: 'auto-imports.d.ts',
      // 生成 .eslintrc-auto-import.json（globals 清单），供 eslint.config.ts 读取
      eslintrc: { enabled: true },
    }),
    Components({
      // 模板里的 el-* 组件按需自动注册（含样式）
      resolvers: [ElementPlusResolver()],
      dts: 'components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

- [ ] **Step 3: 重写 src/assets/main.css —— Tailwind 4 入口**

关键点：**跳过 preflight**（Tailwind 的样式重置会把 `button` 背景清空，破坏 Element Plus 按钮），并声明 class 版深色变体。

```css
/* Tailwind CSS 4 入口：刻意不引入 preflight，避免与 Element Plus 样式互相覆盖 */
@layer theme, base, components, utilities;
@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/utilities.css' layer(utilities);

/* 深色模式改由 .dark 类驱动（配合 useTheme composable），而非系统 media query */
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* 品牌色对齐 Element Plus 主色，可在模板里用 bg-primary / text-primary */
  --color-primary: #409eff;
}
```

- [ ] **Step 4: 重写 src/main.ts —— 挂载 Element Plus 暗色变量**

```ts
import './assets/main.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
```

- [ ] **Step 5: 扩展 env.d.ts —— 环境变量类型（Task 15 的 .env 文件先立好类型契约）**

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

- [ ] **Step 6: tsconfig.app.json 把生成的 d.ts 纳入类型检查**

将 `include` 改为：

```json
  "include": ["env.d.ts", "src/**/*", "src/**/*.vue", "auto-imports.d.ts", "components.d.ts"],
```

- [ ] **Step 7: 让 lint 体系认识自动导入的全局变量**

`.eslintrc-auto-import.json` 由 Step 8 首次 `npm run dev` 时生成（globals 清单）。先改 `eslint.config.ts`：

在文件顶部 `import skipFormatting ...` 之后加：

```ts
import { readFileSync } from 'node:fs'

// AutoImport eslintrc 生成物，globals 清单（提交入库，CI 里 eslint 依赖它）
const autoImport = JSON.parse(readFileSync('.eslintrc-auto-import.json', 'utf-8')) as {
  globals: Record<string, 'readonly' | 'writable'>
}
```

并把 `globalIgnores(...)` 一行改为（忽略生成的 d.ts，json 本身不匹配 lint 的文件规则无需忽略）：

```ts
  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', 'auto-imports.d.ts', 'components.d.ts']),
```

在 `vueTsConfigs.recommended,` 之后插入一段，把 globals 喂给 flat config：

```ts
  {
    name: 'app/auto-import-globals',
    languageOptions: {
      globals: autoImport.globals,
    },
  },
```

再改 `.oxlintrc.json`：TS 项目里 `no-undef` 只会误报（真正的未定义标识符由 vue-tsc 兜底），显式关闭：

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["eslint", "typescript", "unicorn", "oxc", "vue", "vitest"],
  "env": {
    "browser": true
  },
  "categories": {
    "correctness": "error"
  },
  "rules": {
    "no-undef": "off"
  }
}
```

> 注意顺序：必须先 `npm run dev`（生成 json）再 `npm run lint`，否则 eslint.config.ts 读不到文件会直接抛错。CI 里该文件已提交入库，不受影响。

- [ ] **Step 8: 验证**

```bash
npm run dev
```

临时把 `src/views/BoardView.vue` 模板换成下面内容做冒烟验证（验证完还原回占位版）：

```vue
<template>
  <section class="p-6 space-y-4">
    <h1 class="text-xl font-bold text-primary">任务看板</h1>
    <el-button type="primary" @click="visible = !visible">切换</el-button>
    <el-tag v-if="visible" type="success">Tailwind 与 Element Plus 均正常</el-tag>
  </section>
</template>

<script setup lang="ts">
// 注意：ref 没有显式 import —— 这就是 unplugin-auto-import 生效的证据
const visible = ref(false)
</script>
```

期望：页面标题为品牌蓝色；点击按钮出现绿色 `el-tag`；`npm run type-check` PASS；`npm run lint` 无 no-undef 报错。验证后把 BoardView 还原为 Task 1 的占位模板。

- [ ] **Step 9: 提交**

```bash
git add -A && git commit -m "build: 集成 Tailwind 4、Element Plus 按需自动导入与路径别名配置"
```

### Task 3: Husky + lint-staged 提交门禁

**Files:**
- Modify: `package.json`（scripts.prepare + lint-staged 配置）
- Create: `.husky/pre-commit`

- [ ] **Step 1: 安装并初始化 Husky**

```bash
npm install -D husky lint-staged
npx husky init
```

`npx husky init` 会自动：添加 `"prepare": "husky"` 脚本、创建 `.husky/pre-commit`（内容默认是 `npm test`）。

- [ ] **Step 2: 覆写 .husky/pre-commit 内容**

```
npx lint-staged
```

- [ ] **Step 3: package.json 加入 lint-staged 配置**

在顶层（与 `"scripts"` 平级）添加：

```json
  "lint-staged": {
    "*.{ts,vue,mts}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,html,md}": [
      "prettier --write"
    ]
  },
```

- [ ] **Step 4: 验证钩子生效**

```bash
echo "#  hook 测试   " > docs/hook-test.md
git add docs/hook-test.md
git commit -m "test: 验证 pre-commit 钩子"
```

期望：提交时终端先输出 lint-staged 的执行日志（prettier 格式化了该 md 文件），提交成功。然后删掉临时文件：

```bash
rm docs/hook-test.md
git add -A && git commit -m "chore: 移除钩子验证临时文件"
```

- [ ] **Step 5: 提交配置**

```bash
git add -A && git commit -m "build: 集成 Husky + lint-staged 提交门禁"
```

---

## 阶段二/四：类型契约 + 状态层（先逻辑后 UI，全部 TDD）

### Task 4: 领域类型 + useLocalStorage composable（TDD）

**Files:**
- Create: `src/types/task.ts`、`src/utils/date.ts`
- Create: `src/composables/useLocalStorage.ts`
- Test: `src/composables/__tests__/useLocalStorage.spec.ts`

- [ ] **Step 1: 编写领域类型 src/types/task.ts**

```ts
export type TaskStatus = 'todo' | 'doing' | 'done'
export type Category = 'work' | 'study' | 'life'
export type Priority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description: string
  category: Category
  status: TaskStatus
  priority: Priority
  createdAt: number
  completedAt: number | null
}

/** 新建/编辑表单提交的数据（不含系统生成的字段） */
export interface TaskFormPayload {
  title: string
  description: string
  category: Category
  priority: Priority
}

/** TaskDialog 向视图抛出的保存事件 */
export interface TaskSaveEvent {
  mode: 'create' | 'edit'
  task: Task | null
  form: TaskFormPayload
}

export const STATUS_ORDER: TaskStatus[] = ['todo', 'doing', 'done']
export const CATEGORY_ORDER: Category[] = ['work', 'study', 'life']
export const PRIORITY_ORDER: Priority[] = ['low', 'medium', 'high']

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: '待办',
  doing: '进行中',
  done: '已完成',
}

export const CATEGORY_LABEL: Record<Category, string> = {
  work: '工作',
  study: '学习',
  life: '生活',
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: '低',
  medium: '中',
  high: '高',
}
```

- [ ] **Step 2: 编写 src/utils/date.ts**

```ts
export function formatDate(timestamp: number): string {
  const d = new Date(timestamp)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
```

- [ ] **Step 3: 先写失败测试 src/composables/__tests__/useLocalStorage.spec.ts**

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useLocalStorage } from '../useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('localStorage 为空时返回初始值', () => {
    const theme = useLocalStorage('k-theme', 'light')
    expect(theme.value).toBe('light')
  })

  it('修改 ref 会以 JSON 序列化写入 localStorage', () => {
    const count = useLocalStorage('k-count', 0)
    count.value = 42
    expect(localStorage.getItem('k-count')).toBe('42')
  })

  it('对象类型支持深层修改并被持久化', () => {
    const pref = useLocalStorage('k-pref', { dark: false, size: 12 })
    pref.value.dark = true
    expect(JSON.parse(localStorage.getItem('k-pref')!)).toEqual({ dark: true, size: 12 })
  })

  it('重新创建 composable 时能读回已保存的值', () => {
    useLocalStorage('k-again', { a: 1 }).value = { a: 2 }
    const again = useLocalStorage('k-again', { a: 1 })
    expect(again.value).toEqual({ a: 2 })
  })

  it('localStorage 里的非法 JSON 时回退初始值', () => {
    localStorage.setItem('k-broken', '{oops')
    const v = useLocalStorage('k-broken', 'fallback')
    expect(v.value).toBe('fallback')
  })
})
```

- [ ] **Step 4: 运行确认失败**

```bash
npx vitest run src/composables/__tests__/useLocalStorage.spec.ts
```

期望：FAIL，`Cannot find module '../useLocalStorage'`。

- [ ] **Step 5: 实现 src/composables/useLocalStorage.ts**

```ts
import { ref, watch, type Ref } from 'vue'

/**
 * 把一个 ref 双向同步到 localStorage。
 * - 读：初始化时读回；JSON 损坏时回退初始值
 * - 写：deep watch 任何变化都序列化写回
 */
export function useLocalStorage<T>(key: string, initialValue: T): Ref<T> {
  function read(): T {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? initialValue : (JSON.parse(raw) as T)
    } catch {
      return initialValue
    }
  }

  const data = ref(read()) as Ref<T>

  watch(
    data,
    (value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {
        // 隐私模式等写入失败场景：静默降级为纯内存状态
      }
    },
    { deep: true },
  )

  return data
}
```

- [ ] **Step 6: 运行测试确认通过**

```bash
npx vitest run src/composables/__tests__/useLocalStorage.spec.ts
```

期望：5 个用例全部 PASS。

- [ ] **Step 7: 提交**

```bash
git add -A && git commit -m "feat: 领域类型定义与 useLocalStorage 组合式函数(TDD)"
```

### Task 5: TaskStore + 自写 Pinia 持久化插件（TDD）

**Files:**
- Create: `src/stores/plugins/persistence.ts`
- Create: `src/stores/task.ts`
- Test: `src/stores/__tests__/persistence.spec.ts`、`src/stores/__tests__/task.spec.ts`

- [ ] **Step 1: 先写持久化插件的失败测试 src/stores/__tests__/persistence.spec.ts**

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTaskStore } from '../task'
import { createPersistence } from '../plugins/persistence'

const draft = {
  title: '写周报',
  description: '整理本周进展',
  category: 'work',
  priority: 'medium',
} as const

describe('createPersistence（Pinia 插件）', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('未安装插件时不写 localStorage', () => {
    setActivePinia(createPinia())
    useTaskStore().addTask(draft)
    expect(localStorage.getItem('taskflow:task')).toBeNull()
  })

  it('安装后状态变化写入 localStorage', () => {
    setActivePinia(createPinia().use(createPersistence()))
    useTaskStore().addTask(draft)
    const raw = localStorage.getItem('taskflow:task')
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw!).tasks[0]!.title).toBe('写周报')
  })

  it('新 pinia 实例（模拟刷新页面）能从 localStorage 恢复', () => {
    setActivePinia(createPinia().use(createPersistence()))
    useTaskStore().addTask(draft)

    setActivePinia(createPinia().use(createPersistence()))
    const restored = useTaskStore()
    expect(restored.tasks).toHaveLength(1)
    expect(restored.tasks[0]!.title).toBe('写周报')
  })

  it('损坏的存档会被清除并回退初始状态', () => {
    localStorage.setItem('taskflow:task', '{oops')
    setActivePinia(createPinia().use(createPersistence()))
    expect(useTaskStore().tasks).toHaveLength(0)
    expect(localStorage.getItem('taskflow:task')).toBeNull()
  })
})
```

- [ ] **Step 2: 运行确认失败**

```bash
npx vitest run src/stores/__tests__/persistence.spec.ts
```

期望：FAIL，找不到 `../plugins/persistence` 与 `../task` 模块。

- [ ] **Step 3: 实现 src/stores/plugins/persistence.ts**

```ts
import type { PiniaPluginContext } from 'pinia'

const KEY_PREFIX = 'taskflow:'

/** 需要持久化的 store id 白名单 */
const PERSISTED_STORES = ['task', 'user']

export function createPersistence() {
  return ({ store }: PiniaPluginContext) => {
    if (!PERSISTED_STORES.includes(store.$id)) return

    const storageKey = `${KEY_PREFIX}${store.$id}`

    // 恢复：pinia 实例创建时读档，$patch 一次性合并进 state
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        store.$patch(JSON.parse(saved))
      } catch {
        localStorage.removeItem(storageKey)
      }
    }

    // 写档：订阅本 store 的所有 mutation
    store.$subscribe((_mutation, state) => {
      localStorage.setItem(storageKey, JSON.stringify(state))
    })
  }
}
```

- [ ] **Step 4: 编写 TaskStore 的失败测试 src/stores/__tests__/task.spec.ts**

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTaskStore } from '../task'
import type { TaskFormPayload } from '@/types/task'

const draft = (title: string): TaskFormPayload => ({
  title,
  description: `${title}的描述`,
  category: 'work',
  priority: 'medium',
})

describe('useTaskStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('addTask 生成 id/createdAt 并置为 todo、新任务排最前', () => {
    const store = useTaskStore()
    store.addTask(draft('任务一'))
    store.addTask(draft('任务二'))
    expect(store.tasks).toHaveLength(2)
    expect(store.tasks[0]!.title).toBe('任务二')
    const first = store.tasks[0]!
    expect(first.status).toBe('todo')
    expect(first.id).toBeTruthy()
    expect(first.createdAt).toBeGreaterThan(0)
    expect(first.completedAt).toBeNull()
  })

  it('moveTask: 推进到 done 记录 completedAt，移出 done 清空它', () => {
    const store = useTaskStore()
    store.addTask(draft('A'))
    const id = store.tasks[0]!.id

    store.moveTask(id, 'doing')
    expect(store.tasks[0]!.status).toBe('doing')
    expect(store.tasks[0]!.completedAt).toBeNull()

    store.moveTask(id, 'done')
    expect(store.tasks[0]!.completedAt).toBeGreaterThan(0)

    store.moveTask(id, 'todo')
    expect(store.tasks[0]!.completedAt).toBeNull()
  })

  it('updateTask 只合并传入的字段', () => {
    const store = useTaskStore()
    store.addTask(draft('B'))
    const task = store.tasks[0]!
    store.updateTask(task.id, { title: 'B2', priority: 'high' })
    expect(store.tasks[0]!.title).toBe('B2')
    expect(store.tasks[0]!.priority).toBe('high')
    expect(store.tasks[0]!.description).toBe(task.description)
  })

  it('removeTask 删除指定任务', () => {
    const store = useTaskStore()
    store.addTask(draft('C1'))
    store.addTask(draft('C2'))
    store.removeTask(store.tasks[0]!.id)
    expect(store.tasks).toHaveLength(1)
    expect(store.tasks[0]!.title).toBe('C1')
  })

  it('filteredTasks: 关键词对标题/描述做大小写不敏感匹配，可与分类叠加', () => {
    const store = useTaskStore()
    store.addTask({ ...draft('Learn Vue'), description: 'script setup', category: 'study' })
    store.addTask({ ...draft('买菜'), description: '西红柿和鸡蛋', category: 'life' })

    store.keyword = 'vue'
    expect(store.filteredTasks).toHaveLength(1)

    store.keyword = ''
    store.activeCategory = 'life'
    expect(store.filteredTasks).toHaveLength(1)
    expect(store.filteredTasks[0]!.title).toBe('买菜')

    store.activeCategory = 'all'
    expect(store.filteredTasks).toHaveLength(2)
  })

  it('countsByStatus 与 tasksCount 统计正确', () => {
    const store = useTaskStore()
    store.addTask(draft('D1'))
    store.addTask(draft('D2'))
    store.moveTask(store.tasks[1]!.id, 'done')
    expect(store.countsByStatus).toEqual({ todo: 1, doing: 0, done: 1 })
    expect(store.tasksCount).toBe(2)
  })

  it('getTaskById 返回任务或 undefined', () => {
    const store = useTaskStore()
    store.addTask(draft('E'))
    const id = store.tasks[0]!.id
    expect(store.getTaskById(id)?.title).toBe('E')
    expect(store.getTaskById('not-exist')).toBeUndefined()
  })
})
```

- [ ] **Step 5: 运行确认失败**

```bash
npx vitest run src/stores/__tests__/task.spec.ts
```

期望：FAIL，找不到 `../task` 模块。

- [ ] **Step 6: 实现 src/stores/task.ts（Setup Store 写法）**

```ts
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Category, Task, TaskFormPayload, TaskStatus } from '@/types/task'

export const useTaskStore = defineStore('task', () => {
  // 实战选型：任务列表用 ref。
  // reactive 适合“固定结构的表单对象”；数组整体替换 + 逐项操作的场景用 ref 更直观（见计划阶段二说明）。
  const tasks = ref<Task[]>([])

  // 筛选条件
  const keyword = ref('')
  const activeCategory = ref<Category | 'all'>('all')

  const tasksCount = computed(() => tasks.value.length)

  const countsByStatus = computed(() => {
    const counts: Record<TaskStatus, number> = { todo: 0, doing: 0, done: 0 }
    for (const task of tasks.value) counts[task.status] += 1
    return counts
  })

  // 实时过滤：computed 依赖 keyword / activeCategory / tasks 任一变化自动重算
  const filteredTasks = computed(() => {
    const kw = keyword.value.trim().toLowerCase()
    return tasks.value.filter((task) => {
      const matchCategory = activeCategory.value === 'all' || task.category === activeCategory.value
      if (!matchCategory) return false
      if (!kw) return true
      return task.title.toLowerCase().includes(kw) || task.description.toLowerCase().includes(kw)
    })
  })

  function getTaskById(id: string): Task | undefined {
    return tasks.value.find((task) => task.id === id)
  }

  function addTask(form: TaskFormPayload, status: TaskStatus = 'todo') {
    tasks.value.unshift({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      completedAt: null,
      status,
      ...form,
    })
  }

  function updateTask(id: string, patch: Partial<TaskFormPayload>) {
    const task = getTaskById(id)
    if (task) Object.assign(task, patch)
  }

  function moveTask(id: string, status: TaskStatus) {
    const task = getTaskById(id)
    if (!task || task.status === status) return
    task.status = status
    task.completedAt = status === 'done' ? Date.now() : null
  }

  function removeTask(id: string) {
    tasks.value = tasks.value.filter((task) => task.id !== id)
  }

  function loadDemoData() {
    addTask({ title: '熟悉 Vue3 组合式 API', description: '过一遍 ref/computed/watchEffect 差异', category: 'study', priority: 'high' })
    addTask({ title: '写周报', description: '整理本周进展与下周计划', category: 'work', priority: 'medium' })
    addTask({ title: '跑步 5 公里', description: '周三和周五各一次', category: 'life', priority: 'low' })
    moveTask(tasks.value[0]!.id, 'doing')
  }

  return {
    tasks,
    keyword,
    activeCategory,
    tasksCount,
    countsByStatus,
    filteredTasks,
    getTaskById,
    addTask,
    updateTask,
    moveTask,
    removeTask,
    loadDemoData,
  }
})
```

注意：`loadDemoData` 里 `tasks.value[0]!` 依赖 `addTask` 的 `unshift` 行为（新任务在最前），测试 Task 9 看板时按“进行中列有 1 条”验证。

- [ ] **Step 7: 运行全部 store 测试确认通过**

```bash
npx vitest run src/stores/__tests__/
```

期望：persistence 4 个 + task 7 个用例全部 PASS。

> 陷阱提示（写入学习笔记）：测试里 `store.tasks[0]!.title` 的 `!` 源自 tsconfig 的 `noUncheckedIndexedAccess`；而组件里解构 store 必须用 `storeToRefs(store)`，直接 `const { tasks } = store` 会丢失响应性 —— 这是阶段四要求掌握的 StoreToRefs 解构陷阱，Task 9 的 BoardView 会实际用到。

- [ ] **Step 8: 提交**

```bash
git add -A && git commit -m "feat: TaskStore 与 Pinia LocalStorage 持久化插件(TDD)"
```

### Task 6: UserStore（TDD）+ 完整路由表（登录守卫 / meta 标题 / 动态路由占位）

**Files:**
- Create: `src/stores/user.ts`
- Test: `src/stores/__tests__/user.spec.ts`
- Rewrite: `src/router/index.ts`
- Modify: `src/main.ts`（挂持久化插件）
- Create 占位视图: `src/views/LoginView.vue`、`src/views/ListView.vue`、`src/views/DetailView.vue`、`src/views/PerfView.vue`、`src/views/NotFoundView.vue`

- [ ] **Step 1: 先写失败测试 src/stores/__tests__/user.spec.ts**

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '../user'

describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始为未登录', () => {
    expect(useUserStore().isLoggedIn).toBe(false)
  })

  it('密码错误时登录失败', () => {
    const store = useUserStore()
    expect(store.login('demo', 'wrong-password')).toBe(false)
    expect(store.isLoggedIn).toBe(false)
  })

  it('用户名为空白时登录失败', () => {
    const store = useUserStore()
    expect(store.login('   ', '123456')).toBe(false)
    expect(store.isLoggedIn).toBe(false)
  })

  it('密码正确时登录成功，用户名去除首尾空白', () => {
    const store = useUserStore()
    expect(store.login('  demo ', '123456')).toBe(true)
    expect(store.name).toBe('demo')
    expect(store.isLoggedIn).toBe(true)
  })

  it('logout 清空登录态', () => {
    const store = useUserStore()
    store.login('demo', '123456')
    store.logout()
    expect(store.isLoggedIn).toBe(false)
  })
})
```

- [ ] **Step 2: 运行确认失败**

```bash
npx vitest run src/stores/__tests__/user.spec.ts
```

期望：FAIL，找不到 `../user` 模块。

- [ ] **Step 3: 实现 src/stores/user.ts**

```ts
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

/** 演示项目写死的登录密码 */
export const MOCK_PASSWORD = '123456'

export const useUserStore = defineStore('user', () => {
  const name = ref('')

  // computed 派生登录态：name 一变 isLoggedIn 自动更新
  const isLoggedIn = computed(() => name.value.length > 0)

  function login(username: string, password: string): boolean {
    const trimmed = username.trim()
    if (password !== MOCK_PASSWORD || !trimmed) return false
    name.value = trimmed
    return true
  }

  function logout() {
    name.value = ''
  }

  return { name, isLoggedIn, login, logout }
})
```

- [ ] **Step 4: 运行测试确认通过**

```bash
npx vitest run src/stores/__tests__/user.spec.ts
```

期望：5 个用例 PASS。

- [ ] **Step 5: 重写 src/router/index.ts —— 路由表 + Login Guard + meta**

```ts
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
```

- [ ] **Step 6: 创建五个占位视图（路由懒加载指向的文件必须存在，否则 type-check 报找不到模块）**

`src/views/LoginView.vue`：

```vue
<template>
  <section class="p-6">登录页占位，Task 8 实现。</section>
</template>
```

`src/views/ListView.vue`：

```vue
<template>
  <section class="p-6">列表页占位，Task 11 实现。</section>
</template>
```

`src/views/DetailView.vue`：

```vue
<template>
  <section class="p-6">详情页占位，Task 12 实现。</section>
</template>
```

`src/views/PerfView.vue`：

```vue
<template>
  <section class="p-6">性能实验室占位，Task 14 实现。</section>
</template>
```

`src/views/NotFoundView.vue`：

```vue
<template>
  <section class="p-6 space-y-4">
    <h1 class="text-2xl font-bold">404</h1>
    <p>页面不存在。</p>
    <RouterLink :to="{ name: 'board' }">
      <el-button type="primary">返回看板</el-button>
    </RouterLink>
  </section>
</template>
```

- [ ] **Step 7: src/main.ts 挂载持久化插件**

```ts
import './assets/main.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { createPersistence } from './stores/plugins/persistence'

const app = createApp(App)

const pinia = createPinia()
pinia.use(createPersistence())

// 顺序很重要：先装 pinia，路由守卫里才能 useUserStore()
app.use(pinia)
app.use(router)

app.mount('#app')
```

- [ ] **Step 8: 验证**

```bash
npm run type-check   # 期望 PASS
npm run dev
```

浏览器验证：直接访问 `http://localhost:5173/board` → 应被守卫重定向到 `/login?redirect=/board`（占位登录页）；标签页标题显示「任务看板 · TaskFlow」。

- [ ] **Step 9: 提交**

```bash
git add -A && git commit -m "feat: UserStore 登录态与路由守卫、meta 标题、动态路由骨架"
```

### Task 7: 深色模式（useTheme + provide/inject）+ App 骨架 + AppHeader（生命周期时钟）

**Files:**
- Create: `src/composables/useTheme.ts`、`src/components/layout/AppHeader.vue`
- Rewrite: `src/App.vue`

- [ ] **Step 1: 实现 src/composables/useTheme.ts**

```ts
import type { InjectionKey, Ref } from 'vue'
import { useLocalStorage } from './useLocalStorage'

export interface ThemeContext {
  isDark: Ref<boolean>
  toggle: () => void
}

/** provide/inject 的强类型键：inject(THEME_KEY) 自动推导为 ThemeContext | undefined */
export const THEME_KEY: InjectionKey<ThemeContext> = Symbol('theme')

function prefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export function useTheme(): ThemeContext {
  // 持久化到 localStorage，刷新后保持上次选择
  const isDark = useLocalStorage<boolean>('taskflow:dark', prefersDark())

  // watchEffect：自动追踪 isDark，变化时重新执行副作用（阶段二要求点）
  watchEffect(() => {
    document.documentElement.classList.toggle('dark', isDark.value)
  })

  function toggle() {
    isDark.value = !isDark.value
  }

  return { isDark, toggle }
}
```

- [ ] **Step 2: 重写 src/App.vue —— 布局 + provide 主题 + v-once 页脚**

```vue
<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import { THEME_KEY, useTheme } from '@/composables/useTheme'

const theme = useTheme()
// 依赖注入：把主题下发给任意深度的子组件，避免逐层 props（阶段三要求点）
provide(THEME_KEY, theme)

const route = useRoute()
const appTitle = 'TaskFlow' // Task 15 改为读取 import.meta.env.VITE_APP_TITLE
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
    <AppHeader v-if="route.name !== 'login'" />
    <main class="mx-auto w-full max-w-6xl px-4 py-6">
      <RouterView />
    </main>
    <!-- v-once：静态内容只渲染一次，后续更新跳过 diff（阶段五要求点） -->
    <footer v-once class="py-6 text-center text-xs text-slate-400">
      {{ appTitle }} · Vue3 学习项目
    </footer>
  </div>
</template>
```

说明：`ref / provide / useRoute / RouterView` 均由 unplugin-auto-import 提供，无需手写 import——这正是 Task 2 配置的成果。

- [ ] **Step 3: 实现 src/components/layout/AppHeader.vue**

```vue
<script setup lang="ts">
import { Moon, Sunny } from '@element-plus/icons-vue'
import { THEME_KEY } from '@/composables/useTheme'
import { useUserStore } from '@/stores/user'

const now = ref(new Date())
let timer: number | undefined

// 生命周期钩子：挂载启动时钟，卸载前清理（阶段二要求点：onMounted / onUnmounted）
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
  <header class="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
    <div class="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4">
      <RouterLink :to="{ name: 'board' }" class="text-lg font-bold text-primary">TaskFlow</RouterLink>

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
```

- [ ] **Step 4: 验证**

```bash
npm run type-check   # 期望 PASS
npm run dev
```

浏览器验证清单：
1. `/board`（未登录仍会跳登录页，可先临时访问占位页看头部）——头部导航、面包屑「首页 / 看板」正常显示；
2. 点击圆形主题按钮 → 整页背景在亮/暗之间切换，刷新后主题保持（localStorage）；
3. 时钟每秒跳动；
4. 响应式：窗口缩到手机宽度，面包屑与时钟按 `hidden` 规则隐藏，导航仍可用。

- [ ] **Step 5: 提交**

```bash
git add -A && git commit -m "feat: 深色模式(useTheme+provide/inject)、App 布局与 AppHeader 时钟"
```

---

## 阶段二/三：页面与组件

### Task 8: 登录页（reactive 表单 + el-form 校验 + 守卫闭环）

**Files:**
- Rewrite: `src/views/LoginView.vue`

- [ ] **Step 1: 实现 src/views/LoginView.vue**

```vue
<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { MOCK_PASSWORD, useUserStore } from '@/stores/user'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

// 选型（阶段二）：字段固定、频繁整体变化的表单用 reactive；
// 单一原始值（loading）用 ref。对比记忆，不要混用。
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
```

说明：`ElMessage` 没有手写 import——由 unplugin-auto-import 的 ElementPlusResolver 自动注入（Task 2 配置）。

- [ ] **Step 2: 验证完整守卫闭环**

```bash
npm run type-check   # 期望 PASS
npm run dev
```

浏览器验证：
1. 访问 `/board` → 重定向 `/login?redirect=/board`；
2. 空表单点登录 → 出现校验错误；
3. 密码填错 → ElMessage 报错提示；
4. `demo / 123456` → 登录成功，落回 `/board`，右上角出现用户名下拉；
5. 刷新 `/board` → 仍然保持登录（user store 被持久化插件存进 localStorage，key 为 `taskflow:user`）；
6. 用户菜单 → 退出登录 → 回到登录页。

- [ ] **Step 3: 提交**

```bash
git add -A && git commit -m "feat: 登录页与登录守卫闭环(reactive 表单校验)"
```

### Task 9: 任务看板（TaskColumn / TaskCard / TaskFilter + 拖拽换列）

**Files:**
- Create: `src/components/task/TaskFilter.vue`、`src/components/task/TaskCard.vue`、`src/components/task/TaskColumn.vue`
- Rewrite: `src/views/BoardView.vue`

> 本任务看板先支持：状态推进、删除、筛选、拖拽。「新建 / 编辑」弹窗在 Task 10 接入。

- [ ] **Step 1: 实现 src/components/task/TaskFilter.vue（defineModel 双 v-model）**

```vue
<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { CATEGORY_LABEL, CATEGORY_ORDER, type Category } from '@/types/task'

// defineModel：替代 “props + emit('update:xxx')” 样板，父组件直接 v-model:keyword
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
```

- [ ] **Step 2: 实现 src/components/task/TaskCard.vue（defineProps / defineEmits + 拖拽源）**

```vue
<script setup lang="ts">
import {
  CATEGORY_LABEL,
  PRIORITY_LABEL,
  STATUS_LABEL,
  type Category,
  type Task,
  type TaskStatus,
} from '@/types/task'
import { formatDate } from '@/utils/date'

// 阶段三要求点：defineProps 声明只读入参
defineProps<{
  task: Task
}>()

// defineEmits：类型化事件签名，卡片自己不改数据，操作全部上抛（单向数据流）
const emit = defineEmits<{
  move: [status: TaskStatus]
  remove: []
}>()

const CATEGORY_TAG: Record<Category, '' | 'success' | 'warning'> = {
  work: '',
  study: 'success',
  life: 'warning',
}

const PRIORITY_DOT: Record<Task['priority'], string> = {
  low: 'bg-slate-400',
  medium: 'bg-amber-500',
  high: 'bg-red-500',
}
</script>

<template>
  <article
    draggable="true"
    class="cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md active:cursor-grabbing dark:border-slate-700 dark:bg-slate-800"
    @dragstart="$event.dataTransfer?.setData('text/plain', task.id)"
  >
    <div class="mb-2 flex items-start justify-between gap-2">
      <RouterLink
        :to="{ name: 'task-detail', params: { id: task.id } }"
        class="font-medium hover:text-primary"
        :class="{ 'line-through opacity-60': task.status === 'done' }"
      >
        {{ task.title }}
      </RouterLink>
      <span
        class="mt-1 size-2 shrink-0 rounded-full"
        :class="PRIORITY_DOT[task.priority]"
        :title="`优先级：${PRIORITY_LABEL[task.priority]}`"
      />
    </div>

    <p v-if="task.description" class="mb-3 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
      {{ task.description }}
    </p>

    <div class="mb-3 flex flex-wrap items-center gap-2 text-xs">
      <el-tag size="small" :type="CATEGORY_TAG[task.category]" effect="plain">
        {{ CATEGORY_LABEL[task.category] }}
      </el-tag>
      <el-tag v-if="task.status === 'done'" size="small" type="success" effect="plain">
        {{ STATUS_LABEL.done }}
      </el-tag>
      <span class="text-slate-400">{{ formatDate(task.createdAt) }}</span>
    </div>

    <div class="flex items-center gap-1">
      <el-button
        v-if="task.status === 'todo'"
        size="small"
        type="primary"
        plain
        @click="emit('move', 'doing')"
      >
        开始
      </el-button>
      <el-button
        v-if="task.status === 'doing'"
        size="small"
        type="success"
        plain
        @click="emit('move', 'done')"
      >
        完成
      </el-button>
      <el-button v-if="task.status === 'done'" size="small" plain @click="emit('move', 'todo')">
        重新打开
      </el-button>
      <el-button size="small" text type="danger" @click="emit('remove')">删除</el-button>
    </div>
  </article>
</template>
```

- [ ] **Step 3: 实现 src/components/task/TaskColumn.vue（drop 目标 + TransitionGroup + 事件转发）**

```vue
<script setup lang="ts">
import type { Task, TaskStatus } from '@/types/task'
import TaskCard from './TaskCard.vue'

const props = defineProps<{
  status: TaskStatus
  title: string
  tasks: Task[]
}>()

// 列把卡片上抛的操作继续转发给 BoardView，自己不做任何数据修改
const emit = defineEmits<{
  move: [id: string, status: TaskStatus]
  edit: [task: Task]
  remove: [task: Task]
}>()

function onDrop(event: DragEvent) {
  const id = event.dataTransfer?.getData('text/plain')
  if (id) emit('move', id, props.status)
}
</script>

<template>
  <section
    class="flex min-h-64 flex-col rounded-xl bg-slate-200/60 p-3 dark:bg-slate-800/60"
    @dragover.prevent
    @drop="onDrop"
  >
    <header class="mb-3 flex items-center justify-between">
      <h2 class="text-sm font-semibold">{{ title }}</h2>
      <el-tag size="small" effect="plain" round>{{ tasks.length }}</el-tag>
    </header>

    <TransitionGroup name="card" tag="div" class="flex flex-1 flex-col gap-3">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @move="(target) => emit('move', task.id, target)"
        @edit="emit('edit', task)"
        @remove="emit('remove', task)"
      />
    </TransitionGroup>

    <p v-if="!tasks.length" class="py-8 text-center text-xs text-slate-400">拖拽任务到这里</p>
  </section>
</template>

<style scoped>
.card-enter-active,
.card-leave-active,
.card-move {
  transition: all 0.25s ease;
}
.card-enter-from,
.card-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
/* leave 的元素脱标，让剩余卡片的 move 位移动画平滑 */
.card-leave-active {
  position: absolute;
}
</style>
```

说明：TaskCard 暂时没有 `edit` 事件，这里先转发占位，Task 10 给卡片加编辑按钮后自动接通。

- [ ] **Step 4: 重写 src/views/BoardView.vue**

```vue
<script setup lang="ts">
import { CircleCheck, Document, Loading } from '@element-plus/icons-vue'
import TaskColumn from '@/components/task/TaskColumn.vue'
import TaskFilter from '@/components/task/TaskFilter.vue'
import { useTaskStore } from '@/stores/task'
import { STATUS_LABEL, type Task, type TaskStatus } from '@/types/task'

const store = useTaskStore()

// markRaw：列配置里的 icon 是组件对象。组件对象一旦被深度代理，
// 渲染开销会显著增大并触发 Vue 运行时警告，所以标记为“永不代理”
//（阶段五要求点，这里是最典型的真实使用场景）
const columns = [
  { key: 'todo' as TaskStatus, title: STATUS_LABEL.todo, icon: markRaw(Document), accent: 'bg-sky-500' },
  { key: 'doing' as TaskStatus, title: STATUS_LABEL.doing, icon: markRaw(Loading), accent: 'bg-amber-500' },
  { key: 'done' as TaskStatus, title: STATUS_LABEL.done, icon: markRaw(CircleCheck), accent: 'bg-emerald-500' },
]

// computed 派生三列数据：store.filteredTasks 变化时自动重算（阶段二要求点）
const tasksByStatus = computed<Record<TaskStatus, Task[]>>(() => ({
  todo: store.filteredTasks.filter((task) => task.status === 'todo'),
  doing: store.filteredTasks.filter((task) => task.status === 'doing'),
  done: store.filteredTasks.filter((task) => task.status === 'done'),
}))

function handleMove(id: string, status: TaskStatus) {
  store.moveTask(id, status)
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
</script>

<template>
  <section class="space-y-4">
    <!-- 统计条：2 列起步，sm 起四列（响应式设计要求点） -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div class="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
        <p class="text-xs text-slate-500">全部任务</p>
        <p class="mt-1 text-2xl font-bold">{{ store.tasksCount }}</p>
      </div>
      <div
        v-for="col in columns"
        :key="col.key"
        class="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800"
      >
        <div class="flex items-center gap-2">
          <span class="size-2 rounded-full" :class="col.accent" />
          <p class="text-xs text-slate-500">{{ col.title }}</p>
        </div>
        <p class="mt-1 text-2xl font-bold">{{ store.countsByStatus[col.key] }}</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <TaskFilter v-model:keyword="store.keyword" v-model:category="store.activeCategory" />
      <el-button v-if="!store.tasksCount" plain @click="store.loadDemoData()">
        载入示例数据
      </el-button>
    </div>

    <!-- 看板：手机单列纵向堆叠，md 起三列并排 -->
    <div class="grid gap-4 md:grid-cols-3">
      <TaskColumn
        v-for="col in columns"
        :key="col.key"
        :status="col.key"
        :title="col.title"
        :tasks="tasksByStatus[col.key]"
        @move="handleMove"
        @remove="handleRemove"
      />
    </div>
  </section>
</template>
```

- [ ] **Step 5: 验证**

```bash
npm run type-check   # 期望 PASS
npm run dev
```

浏览器验证（先登录）：
1. 空看板点「载入示例数据」→ 出现 3 条任务，「进行中」列 1 条（「跑步 5 公里」被 loadDemoData 推进到 doing）；
2. 卡片点「开始 / 完成 / 重新打开」→ 卡片在列间移动，统计数字实时变化，完成后标题划线；
3. 拖拽一张卡片到另一列 → 落列成功，有过渡动画；
4. 搜索框输入「vue」→ 只剩匹配卡片；分类切到「生活」→ 只剩跑步；
5. 删除 → ElMessageBox 确认后消失；
6. 刷新页面 → 数据仍在（taskflow:task 持久化）；
7. 缩窄窗口 < 768px → 三列变单列堆叠。

- [ ] **Step 6: 提交**

```bash
git add -A && git commit -m "feat: 任务看板(三列拖拽/状态推进/筛选/统计)与卡片列组件"
```

### Task 10: 弹窗组件族（具名插槽 AppModal + defineExpose TaskForm + defineAsyncComponent TaskDialog）+ 看板接入新建/编辑

**Files:**
- Create: `src/components/common/AppModal.vue`、`src/components/task/TaskForm.vue`、`src/components/task/TaskDialog.vue`
- Modify: `src/components/task/TaskCard.vue`（加编辑按钮）
- Rewrite: `src/views/BoardView.vue`（接入弹窗）

- [ ] **Step 1: 实现 src/components/common/AppModal.vue（Teleport + Transition + 具名插槽 + defineModel）**

```vue
<script setup lang="ts">
import { Close } from '@element-plus/icons-vue'

// defineModel（Vue 3.4+）：父组件直接 v-model 控制显隐，
// 替代 modelValue prop + update:modelValue emit 的旧样板
const visible = defineModel<boolean>({ default: false })

defineProps<{
  title?: string
  width?: string
}>()

const emit = defineEmits<{
  'after-enter': []
}>()

function close() {
  visible.value = false
}
</script>

<template>
  <!-- Teleport：渲染到 body 下，摆脱父级 overflow/z-index 影响 -->
  <Teleport to="body">
    <Transition name="modal" @after-enter="emit('after-enter')">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
        @click.self="close"
      >
        <div
          class="max-h-[85vh] w-full overflow-auto rounded-xl bg-white shadow-xl dark:bg-slate-800 sm:w-[28rem]"
          :style="width ? { width } : undefined"
        >
          <header class="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-700">
            <!-- 具名插槽 + 后备内容：调用方不传 header 时回退显示 title 属性 -->
            <slot name="header">
              <h3 class="font-semibold">{{ title }}</h3>
            </slot>
            <el-button text circle :icon="Close" @click="close" />
          </header>

          <div class="px-5 py-4">
            <slot />
          </div>

          <footer
            v-if="$slots.footer"
            class="flex justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-slate-700"
          >
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from > div,
.modal-leave-to > div {
  transform: translateY(16px) scale(0.98);
}
</style>
```

- [ ] **Step 2: 实现 src/components/task/TaskForm.vue（reactive 表单 + defineExpose）**

```vue
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

// 阶段三要求点：把“聚焦标题 / 触发提交”暴露给父组件 TaskDialog 调用
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
      <el-input v-model="form.description" type="textarea" :rows="3" placeholder="补充描述（可选）" />
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
```

- [ ] **Step 3: 实现 src/components/task/TaskDialog.vue（defineAsyncComponent + defineExpose open/close）**

```vue
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
```

- [ ] **Step 4: TaskCard 增加编辑事件**

`src/components/task/TaskCard.vue` 的 emits 声明改为：

```ts
const emit = defineEmits<{
  move: [status: TaskStatus]
  edit: []
  remove: []
}>()
```

模板操作区在「删除」按钮之前插入：

```html
      <el-button size="small" text @click="emit('edit')">编辑</el-button>
```

- [ ] **Step 5: 重写 src/views/BoardView.vue 接入弹窗**

```vue
<script setup lang="ts">
import { CircleCheck, Document, Loading } from '@element-plus/icons-vue'
import TaskColumn from '@/components/task/TaskColumn.vue'
import TaskFilter from '@/components/task/TaskFilter.vue'
import TaskDialog from '@/components/task/TaskDialog.vue'
import { useTaskStore } from '@/stores/task'
import { STATUS_LABEL, type Task, type TaskSaveEvent, type TaskStatus } from '@/types/task'

const store = useTaskStore()

// markRaw：icon 是组件对象，标记为永不被深度代理（阶段五要求点）
const columns = [
  { key: 'todo' as TaskStatus, title: STATUS_LABEL.todo, icon: markRaw(Document), accent: 'bg-sky-500' },
  { key: 'doing' as TaskStatus, title: STATUS_LABEL.doing, icon: markRaw(Loading), accent: 'bg-amber-500' },
  { key: 'done' as TaskStatus, title: STATUS_LABEL.done, icon: markRaw(CircleCheck), accent: 'bg-emerald-500' },
]

const tasksByStatus = computed<Record<TaskStatus, Task[]>>(() => ({
  todo: store.filteredTasks.filter((task) => task.status === 'todo'),
  doing: store.filteredTasks.filter((task) => task.status === 'doing'),
  done: store.filteredTasks.filter((task) => task.status === 'done'),
}))

// 模板 ref 拿到 TaskDialog defineExpose 出来的 open/close
const dialog = ref<InstanceType<typeof TaskDialog> | null>(null)

function openCreate() {
  dialog.value?.open('create')
}

function openEdit(task: Task) {
  dialog.value?.open('edit', task)
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

function handleMove(id: string, status: TaskStatus) {
  store.moveTask(id, status)
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
</script>

<template>
  <section class="space-y-4">
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div class="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
        <p class="text-xs text-slate-500">全部任务</p>
        <p class="mt-1 text-2xl font-bold">{{ store.tasksCount }}</p>
      </div>
      <div
        v-for="col in columns"
        :key="col.key"
        class="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800"
      >
        <div class="flex items-center gap-2">
          <span class="size-2 rounded-full" :class="col.accent" />
          <p class="text-xs text-slate-500">{{ col.title }}</p>
        </div>
        <p class="mt-1 text-2xl font-bold">{{ store.countsByStatus[col.key] }}</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <TaskFilter v-model:keyword="store.keyword" v-model:category="store.activeCategory" />
      <div class="flex gap-2">
        <el-button v-if="!store.tasksCount" plain @click="store.loadDemoData()">
          载入示例数据
        </el-button>
        <el-button type="primary" @click="openCreate">新建任务</el-button>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <TaskColumn
        v-for="col in columns"
        :key="col.key"
        :status="col.key"
        :title="col.title"
        :tasks="tasksByStatus[col.key]"
        @move="handleMove"
        @edit="openEdit"
        @remove="handleRemove"
      />
    </div>

    <TaskDialog ref="dialog" @save="handleSave" />
  </section>
</template>
```

- [ ] **Step 6: 验证**

```bash
npm run type-check   # 期望 PASS
npm run dev
```

浏览器验证：
1. 「新建任务」→ 弹窗弹出有动画，标题输入框自动聚焦；空标题点保存 → 校验拦截；
2. 填写后保存 → 卡片出现在「待办」列，统计 +1；
3. 卡片「编辑」→ 弹窗标题为「编辑任务」，表单已预填，改标题保存 → 卡片更新；
4. 弹窗打开时 DevTools Network 面板能看到 `TaskForm-xxxx.js` 按需加载的 chunk（defineAsyncComponent 生效）；
5. 点遮罩或 ✕ → 弹窗关闭；再次「新建任务」→ 表单是空的（watch initial 复位生效）。

- [ ] **Step 7: 提交**

```bash
git add -A && git commit -m "feat: 插槽化弹窗组件族(具名插槽/defineExpose/defineAsyncComponent)并接入看板"
```

### Task 11: 任务列表页（作用域插槽 TaskList + storeToRefs 陷阱实战）

**Files:**
- Create: `src/components/common/TaskList.vue`
- Test: `src/components/common/__tests__/TaskList.spec.ts`
- Rewrite: `src/views/ListView.vue`

- [ ] **Step 1: 先写作用域插槽的组件测试 src/components/common/__tests__/TaskList.spec.ts**

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskList from '../TaskList.vue'
import type { Task } from '@/types/task'

function makeTask(title: string): Task {
  return {
    id: title,
    title,
    description: '',
    category: 'work',
    status: 'todo',
    priority: 'medium',
    createdAt: 0,
    completedAt: null,
  }
}

describe('TaskList 作用域插槽', () => {
  it('不传插槽时使用默认渲染', () => {
    const wrapper = mount(TaskList, { props: { tasks: [makeTask('默认渲染任务')] } })
    expect(wrapper.text()).toContain('默认渲染任务')
  })

  it('作用域插槽能拿到 task 数据并自定义渲染', () => {
    const wrapper = mount(TaskList, {
      props: { tasks: [makeTask('插槽任务')] },
      slots: {
        item: `<template #item="{ task }"><b data-test="custom">自定义-{{ task.title }}</b></template>`,
      },
    })
    expect(wrapper.find('[data-test="custom"]').text()).toBe('自定义-插槽任务')
    expect(wrapper.text()).not.toContain('默认渲染')
  })

  it('空列表显示占位提示', () => {
    const wrapper = mount(TaskList, { props: { tasks: [] } })
    expect(wrapper.text()).toContain('没有匹配的任务')
  })
})
```

- [ ] **Step 2: 运行确认失败**

```bash
npx vitest run src/components/common/__tests__/TaskList.spec.ts
```

期望：FAIL，找不到 `../TaskList.vue`。

- [ ] **Step 3: 实现 src/components/common/TaskList.vue**

```vue
<script setup lang="ts">
import type { Task } from '@/types/task'

defineProps<{
  tasks: Task[]
}>()
</script>

<template>
  <ul class="divide-y divide-slate-200 dark:divide-slate-700">
    <li v-for="task in tasks" :key="task.id" class="py-3">
      <!-- 阶段三要求点：作用域插槽——列表只负责循环，每行怎么渲染由调用方决定；
           插槽体是后备内容，调用方不传时兜底 -->
      <slot name="item" :task="task">
        <span class="text-sm">{{ task.title }}</span>
      </slot>
    </li>
    <li v-if="!tasks.length" class="py-10 text-center text-sm text-slate-400">
      没有匹配的任务
    </li>
  </ul>
</template>
```

- [ ] **Step 4: 运行测试确认通过**

```bash
npx vitest run src/components/common/__tests__/TaskList.spec.ts
```

期望：3 个用例 PASS。

- [ ] **Step 5: 重写 src/views/ListView.vue**

```vue
<script setup lang="ts">
// storeToRefs 显式导入（不依赖 auto-import preset 是否包含它，确定性优先）
import { storeToRefs } from 'pinia'
import TaskList from '@/components/common/TaskList.vue'
import TaskDialog from '@/components/task/TaskDialog.vue'
import TaskFilter from '@/components/task/TaskFilter.vue'
import { useTaskStore } from '@/stores/task'
import {
  CATEGORY_LABEL,
  PRIORITY_LABEL,
  type Task,
  type TaskSaveEvent,
} from '@/types/task'
import { formatDate } from '@/utils/date'

const store = useTaskStore()

// 阶段四要求点（StoreToRefs 解构陷阱）：
// 直接 const { keyword } = store 解构出来的是一次性普通值，丢失响应性；
// storeToRefs 才能把 state / getter 转成仍然连接到 store 的 ref。
// 注意：computed 函数值（filteredTasks）也会被转成只读 ref。
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
```

- [ ] **Step 6: 验证**

```bash
npx vitest run src/components/common/__tests__/TaskList.spec.ts   # 期望 PASS
npm run type-check   # 期望 PASS
npm run dev
```

浏览器验证（登录后进「列表」页）：搜索/分类筛选与看板联动（共享同一个 store）；「开始/完成」一键推进后状态正确；编辑、删除、新建均正常；导航在两页间切换时筛选条件保持。

- [ ] **Step 7: 提交**

```bash
git add -A && git commit -m "feat: 任务列表页(作用域插槽 TaskList、storeToRefs 解构)"
```

### Task 12: 任务详情页（动态路由参数 + 状态推进 + 空态兜底）

**Files:**
- Rewrite: `src/views/DetailView.vue`

- [ ] **Step 1: 实现 src/views/DetailView.vue**

```vue
<script setup lang="ts">
import { useTaskStore } from '@/stores/task'
import {
  CATEGORY_LABEL,
  PRIORITY_LABEL,
  STATUS_LABEL,
  STATUS_ORDER,
} from '@/types/task'
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
        <el-descriptions-item label="分类">{{ CATEGORY_LABEL[task.category] }}</el-descriptions-item>
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
```

- [ ] **Step 2: 验证**

```bash
npm run type-check   # 期望 PASS
npm run dev
```

浏览器验证：
1. 看板/列表点击任务标题 → 进入 `/task/<id>`，面包屑显示「首页 / 详情」；
2. 详情页点状态按钮 → 步骤条前进，返回看板后卡片位置同步（共享 store）；
3. 手动访问 `http://localhost:5173/task/不存在id` → 显示「任务不存在」空态；
4. 访问一个不存在的路径如 `/xxx` → 落到 404 页（通配路由）。

- [ ] **Step 3: 提交**

```bash
git add -A && git commit -m "feat: 任务详情页(动态路由参数/步骤条状态推进/空态)"
```

### Task 13: useNotification composable（TDD）+ 全局通知调用重构

**Files:**
- Create: `src/composables/useNotification.ts`
- Test: `src/composables/__tests__/useNotification.spec.ts`
- Modify: `src/views/LoginView.vue`、`src/views/BoardView.vue`、`src/views/ListView.vue`

- [ ] **Step 1: 先写失败测试 src/composables/__tests__/useNotification.spec.ts**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ElMessage, ElNotification } from 'element-plus'
import { useNotification } from '../useNotification'

// mock 掉 element-plus：单测不渲染真实弹层，只验证调用契约
vi.mock('element-plus', () => ({
  ElMessage: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
  ElNotification: vi.fn(),
}))

describe('useNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('success 转发到 ElMessage.success', () => {
    useNotification().success('保存成功')
    expect(ElMessage.success).toHaveBeenCalledWith('保存成功')
  })

  it('error 转发到 ElMessage.error', () => {
    useNotification().error('登录失败')
    expect(ElMessage.error).toHaveBeenCalledWith('登录失败')
  })

  it('notifySuccess 调用 ElNotification 并带上 success 类型', () => {
    useNotification().notifySuccess('看板', '任务已完成')
    expect(ElNotification).toHaveBeenCalledWith(
      expect.objectContaining({ title: '看板', message: '任务已完成', type: 'success' }),
    )
  })
})
```

- [ ] **Step 2: 运行确认失败**

```bash
npx vitest run src/composables/__tests__/useNotification.spec.ts
```

期望：FAIL，找不到 `../useNotification` 模块。

- [ ] **Step 3: 实现 src/composables/useNotification.ts**

```ts
import { ElMessage, ElNotification } from 'element-plus'

/**
 * 阶段五要求点：把消息提示的公共逻辑抽成 composable。
 * 好处：以后换 UI 库 / 加埋点 / 统一 duration，只改这一个文件。
 */
export function useNotification() {
  function success(message: string) {
    ElMessage.success(message)
  }

  function error(message: string) {
    ElMessage.error(message)
  }

  function info(message: string) {
    ElMessage.info(message)
  }

  function notifySuccess(title: string, message: string) {
    ElNotification({ title, message, type: 'success', duration: 2500 })
  }

  return { success, error, info, notifySuccess }
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
npx vitest run src/composables/__tests__/useNotification.spec.ts
```

期望：3 个用例 PASS。

- [ ] **Step 5: 三个视图重构为统一出口**

`LoginView.vue`：`<script setup>` 顶部加 `import { useNotification } from '@/composables/useNotification'` 与 `const message = useNotification()`，把两处 `ElMessage.error(...)` / `ElMessage.success(...)` 分别改为 `message.error(...)` / `message.success(...)`。

`BoardView.vue` 与 `ListView.vue`：同样加 import 与实例；`handleSave` 里两处 `ElMessage.success(...)` 改为 `message.success(...)`。并在 BoardView 的 `handleMove` 末尾增加完成通知（新行为）：

```ts
function handleMove(id: string, status: TaskStatus) {
  store.moveTask(id, status)
  if (status === 'done') {
    const task = store.getTaskById(id)
    if (task) message.notifySuccess('看板', `「${task.title}」已完成`)
  }
}
```

- [ ] **Step 6: 验证并提交**

```bash
npm run type-check   # 期望 PASS
npm run dev          # 手动回归：登录提示、保存提示、拖拽到“已完成”出右上角通知
git add -A && git commit -m "refactor: 通知逻辑抽离为 useNotification(TDD)"
```

### Task 14: 性能实验室（shallowRef / markRaw / v-memo / v-once）

**Files:**
- Rewrite: `src/views/PerfView.vue`

- [ ] **Step 1: 实现 src/views/PerfView.vue**

```vue
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
// 万行级数据不再付出 Proxy 化开销（阶段五要求点）
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

// 浅层模式的“修改”必须整体替换数组；直接改 rows.value[0].score 不会触发更新
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
    <!-- v-once：纯静态说明只渲染一次，之后的组件更新直接跳过（阶段五要求点） -->
    <div v-once class="rounded-xl bg-white p-4 text-sm leading-6 shadow-sm dark:bg-slate-800">
      <p class="font-semibold">性能实验室（阶段五）</p>
      <p>
        shallowRef 只对 .value 整体替换做响应追踪，避开大数据量的深度代理；
        v-memo 缓存依赖未变化的行，无关更新不再整表重渲染。
        实验：生成 2 万行 → 连点「无关更新」→ 对比开/关 v-memo 的耗时。
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <el-input-number v-model="rowCount" :min="1000" :max="20000" :step="1000" />
      <el-checkbox :model-value="true" disabled>shallowRef 已启用（rows 即 shallowRef）</el-checkbox>
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
```

v-memo 依赖数组的设计意图：开 memo 时依赖 `[selected, score]` —— 「无关更新」改变 `unrelated` 但依赖没变，所有行整体跳过；关 memo 时依赖换成 `[score, unrelated]`，任何无关更新都会让整表重渲染，形成对照。`rows` 顶部解包对 shallowRef 同样生效，模板里不需要 `.value`。

- [ ] **Step 2: 验证**

```bash
npm run type-check   # 期望 PASS
npm run dev
```

浏览器验证：
1. 生成 5000 行 → 列表渲染，「耗时」显示数值；
2. 开 v-memo 连点「无关更新」→ 耗时接近 0，右上角计数变化但列表滚动位置不抖；
3. 关 v-memo 再点「无关更新」→ 明显卡顿（2 万行时尤其明显）；
4. 「随机勾选一行」→ 仅一行勾选状态变化；
5. 「全部 score+1」→ 分数列整体 +1（验证浅层数组的整体替换写法）；
6. Vue DevTools 控制台无 “received a Component that was made a reactive object” 警告（markRaw 生效）。

- [ ] **Step 3: 提交**

```bash
git add -A && git commit -m "feat: 性能实验室(shallowRef/markRaw/v-memo/v-once 对照实验)"
```

---

## 阶段六：环境变量与工程化落地

### Task 15: 环境变量管理（.env.development / .env.production）

**Files:**
- Create: `.env.development`、`.env.production`
- Modify: `index.html`、`src/App.vue`

- [ ] **Step 1: 创建 .env.development**

```bash
# 开发环境（npm run dev 时 Vite 自动加载）
VITE_APP_TITLE=TaskFlow (dev)
VITE_API_BASE_URL=/api
```

- [ ] **Step 2: 创建 .env.production**

```bash
# 生产环境（npm run build 时加载）
VITE_APP_TITLE=TaskFlow
VITE_API_BASE_URL=https://api.taskflow.example.com
```

说明：只有 `VITE_` 前缀的变量会暴露给客户端代码；类型契约已在 Task 2 写入 `env.d.ts`。这两个文件不含密钥，直接提交入库。

- [ ] **Step 3: index.html 标题改为读取环境变量（Vite 会替换 %ENV% 占位符）**

将 `<title>TaskFlow</title>` 改为：

```html
    <title>%VITE_APP_TITLE%</title>
```

- [ ] **Step 4: App.vue 页脚改为读取环境变量**

`src/App.vue` 中把：

```ts
const appTitle = 'TaskFlow' // Task 15 改为读取 import.meta.env.VITE_APP_TITLE
```

改为：

```ts
const appTitle = import.meta.env.VITE_APP_TITLE
```

- [ ] **Step 5: 验证两种环境**

```bash
npm run type-check   # 期望 PASS
npm run dev          # 页脚显示 “TaskFlow (dev) · Vue3 学习项目”，标签页标题含 (dev)
npm run build-only && npm run preview   # 预览页页脚显示 “TaskFlow · Vue3 学习项目”（生产标题）
```

- [ ] **Step 6: 提交**

```bash
git add -A && git commit -m "build: 区分开发/生产环境变量并接入标题与页脚"
```

### Task 16: 打包优化（manualChunks 分包 + Gzip 产物压缩）

**Files:**
- Rewrite: `vite.config.ts`

- [ ] **Step 1: 重写 vite.config.ts（新增 gzip 内联插件与分包策略）**

gzip 用一个 ~20 行的零依赖内联 Rollup 插件实现，效果等价于 vite-plugin-compression（该插件对 Vite 8 有 peer 兼容风险，自写更稳，也顺带学习 Rollup 插件 API）：

```ts
import { Buffer } from 'node:buffer'
import { fileURLToPath, URL } from 'node:url'
import { gzipSync } from 'node:zlib'

import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

/** 构建时为文本类产物额外输出同名 .gz 文件（nginx gzip_static 可直接服务） */
function gzipOutput(): Plugin {
  return {
    name: 'taskflow:gzip',
    apply: 'build',
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        const isText =
          file.type === 'chunk' || /\.(js|css|html|svg|json)$/.test(file.fileName)
        if (!isText) continue
        const source = file.type === 'chunk' ? file.code : file.source
        this.emitFile({
          type: 'asset',
          fileName: `${file.fileName}.gz`,
          source: gzipSync(Buffer.from(source), { level: 6 }),
        })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()],
      dts: 'auto-imports.d.ts',
      eslintrc: { enabled: true },
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'components.d.ts',
    }),
    gzipOutput(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      output: {
        // 分包策略：element-plus 体积最大且升级不频繁，单独成块利于浏览器长缓存；
        // 其余第三方统一进 vendor；业务代码保持按路由自动分包
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('element-plus') || id.includes('@element-plus')) return 'element-plus'
          return 'vendor'
        },
      },
    },
  },
})
```

- [ ] **Step 2: 构建并检查产物**

```bash
npm run build-only
ls -lh dist/assets/ | head -20
```

期望：`dist/assets/` 下出现 `element-plus-*.js`、`vendor-*.js` 及同名 `.gz` 文件；`index-*.js` 明显小于不分包时的单包体积。

- [ ] **Step 3: 提交**

```bash
git add -A && git commit -m "build: manualChunks 分包策略与构建产物 gzip 压缩"
```

### Task 17: Docker 容器化（两阶段构建 + nginx 托管）

**Files:**
- Create: `Dockerfile`、`nginx.conf`、`.dockerignore`

- [ ] **Step 1: 编写 Dockerfile**

```dockerfile
# 阶段一：构建
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build-only

# 阶段二：运行（最终镜像不含 node_modules 与源码）
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

- [ ] **Step 2: 编写 nginx.conf**

```nginx
server {
  listen 80;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  # 优先使用构建阶段预压缩的 .gz 文件（Task 16 的产物）
  gzip_static on;
  # 兜底：对未预压缩的响应动态压缩
  gzip on;
  gzip_types text/css application/javascript application/json image/svg+xml;
  gzip_min_length 1024;

  # SPA history 路由回退：刷新 /board/xxx 不 404
  location / {
    try_files $uri $uri/ /index.html;
  }

  # 带内容哈希的静态资源：长缓存 + immutable
  location /assets/ {
    expires 30d;
    add_header Cache-Control "public, immutable";
  }
}
```

- [ ] **Step 3: 编写 .dockerignore**

```
node_modules
dist
.git
docs
test-results
playwright-report
*.md
.env.local
```

- [ ] **Step 4: 验证（本机装有 Docker 时执行；没有则跳过，CI 会兜底验证构建）**

```bash
docker build -t taskflow .
docker run -d --name taskflow -p 8080:80 taskflow
```

期望：浏览器打开 `http://localhost:8080` → 登录页正常；刷新 `/board` 不 404（history 回退生效）。验证完 `docker rm -f taskflow`。

- [ ] **Step 5: 提交**

```bash
git add -A && git commit -m "build: Docker 两阶段构建与 nginx 托管配置(gzip/缓存/SPA 回退)"
```

### Task 18: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: 编写工作流**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: 安装依赖
        run: npm ci

      - name: 类型检查
        run: npm run type-check

      - name: 代码检查
        run: |
          npx oxlint .
          npx eslint .

      - name: 单元测试
        run: npx vitest run

      - name: 构建验证
        run: npm run build-only
```

- [ ] **Step 2: 本地等价验证（CI 五步逐条跑一遍）**

```bash
npm run type-check
npx oxlint .
npx eslint .
npx vitest run
npm run build-only
```

期望：五条全部无错误退出。

- [ ] **Step 3: 提交**

```bash
git add -A && git commit -m "ci: GitHub Actions 流水线(类型/检查/单测/构建)"
```

> 推送到 GitHub 后即可在 Actions 页看到流水线运行；推送用 push-to-github skill（账号 Kone1y）。

---

## 收尾

### Task 19: e2e 冒烟 + README + 整体验收

**Files:**
- Rewrite: `e2e/vue.spec.ts`
- Rewrite: `README.md`

- [ ] **Step 1: 重写 e2e/vue.spec.ts（对应 playwright.config 的 dev server 5173）**

```ts
import { test, expect } from '@playwright/test'

test('未登录访问看板被守卫重定向到登录页', async ({ page }) => {
  await page.goto('/board')
  await expect(page).toHaveURL(/\/login/)
})

test('登录后进入看板并可新建任务', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('用户名').fill('e2e')
  await page.getByPlaceholder('密码').fill('123456')
  await page.getByRole('button', { name: '登录' }).click()

  await expect(page).toHaveURL(/\/board/)

  await page.getByRole('button', { name: '新建任务' }).click()
  await page.getByPlaceholder('任务标题').fill('第一条 e2e 任务')
  await page.getByRole('button', { name: '保存' }).click()

  await expect(page.getByText('第一条 e2e 任务')).toBeVisible()
})
```

- [ ] **Step 2: 运行 e2e（首次需要安装浏览器）**

```bash
npx playwright install chromium
npm run test:e2e -- --project=chromium
```

期望：2 个用例 PASS。

- [ ] **Step 3: 重写 README.md**

```markdown
# TaskFlow · Vue3 任务管理系统

基于 create-vue 脚手架构建的纯前端任务管理应用，用于系统巩固 Vue3 全家桶知识点。

## 功能

- 任务看板：待办 / 进行中 / 已完成 三列，支持拖拽换列与状态推进
- 分类筛选：关键词搜索 + 分类（工作/学习/生活）单选，看板与列表共享筛选状态
- 数据持久化：自写 Pinia 插件同步 LocalStorage，刷新不丢数据
- 深色模式：一键切换，跟随系统偏好，刷新保持
- 响应式设计：移动端单列堆叠，桌面端三列看板
- 性能实验室：shallowRef / markRaw / v-memo / v-once 对照实验页

## 技术栈

Vue 3.5 (`<script setup>`) · Vite 8 · TypeScript · Pinia 4 · Vue Router 5 ·
Element Plus（按需自动导入） · Tailwind CSS 4 · Husky + lint-staged · Vitest · Playwright

## 快速开始

​```bash
npm install
npm run dev        # 开发（演示登录：任意用户名 / 密码 123456）
npm run build      # 类型检查 + 生产构建
npm run preview    # 预览构建产物
npm run lint       # oxlint + eslint
npx vitest run     # 单元测试
npm run test:e2e   # e2e 冒烟
​```

## 目录速览

​```
src/
├── composables/   useLocalStorage / useTheme / useNotification
├── stores/        task(任务CRUD+过滤) · user(登录态) · plugins/persistence(持久化插件)
├── router/        登录守卫 · meta 标题 · 动态路由 /task/:id
├── components/    common(AppModal 具名插槽 / TaskList 作用域插槽)
│                  task(TaskColumn/TaskCard/TaskForm/TaskDialog 异步组件)
└── views/         Login / Board / List / Detail / Perf / 404
​```

## 学习阶段对照

| 阶段 | 落点 |
|---|---|
| 1 工程化 | vite.config.ts、.husky/、src/assets/main.css（Tailwind） |
| 2 组合式 API | stores/task.ts（computed 过滤）、useTheme.ts（watchEffect）、AppHeader（生命周期） |
| 3 组件进阶 | TaskCard（props/emits）、useTheme+THEME_KEY（provide/inject）、AppModal/TaskList（插槽）、TaskDialog（defineAsyncComponent） |
| 4 状态与路由 | stores/、plugins/persistence.ts、ListView（storeToRefs）、router/index.ts（守卫/meta） |
| 5 复用与性能 | composables/、BoardView（markRaw）、PerfView（shallowRef/v-memo/v-once） |
| 6 部署工程化 | .env.*、vite.config.ts（分包/gzip）、Dockerfile、.github/workflows/ci.yml |
```

> 注意：README 中 ​```​ 处写实际的三反引号，上面为了嵌套展示加了零宽字符，写入文件时要去掉。

- [ ] **Step 4: 整体验收清单（全部通过才算项目完成）**

```bash
npm run type-check        # PASS
npx oxlint .              # 无 error
npx eslint .              # 无 error
npx vitest run            # useLocalStorage 5 + persistence 4 + task 7 + user 5 + useNotification 3 + TaskList 3 = 27 用例 PASS
npm run build-only        # 构建成功，dist/assets 有 element-plus/vendor 分包与 .gz
npm run preview           # 生产包功能抽查
npm run test:e2e -- --project=chromium   # 2 用例 PASS
git log --oneline         # 19 个任务对应 20+ 次提交，信息清晰
```

手动功能抽查（浏览器）：登录闭环 / 新建-编辑-删除-拖拽任务 / 搜索与分类筛选 / 深色模式刷新保持 / 刷新数据持久 / 手机宽度单列布局 / 404 页 / 详情页空态。

- [ ] **Step 5: 最终提交**

```bash
git add -A && git commit -m "docs: 重写 README 并完成 e2e 冒烟与整体验收"
```

---

## 计划外已知事项

- 若 `npm install` 或构建时出现依赖版本冲突（2026 年的最新版组合），优先锁定报错的包到上一个 major 再排查，不要擅自大版本升级 Vue/Vite。
- `ElMessage` 等组件 API 的自动导入依赖 Task 2 的 Resolver 配置；若样式丢失，检查是否误加了全量 `import 'element-plus/dist/index.css'`（与按需导入二选一，本计划选按需）。
- 多标签页同步、撤销重做等属于扩展功能，本计划不做（YAGNI）。

