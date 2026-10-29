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

Vue 3.5 (`<script setup>`) · Vite · TypeScript · Pinia 4 · Vue Router ·
Element Plus（按需自动导入） · Tailwind CSS 4 · Husky + lint-staged · Vitest · Playwright

## 快速开始

```bash
npm install
npm run dev        # 开发（演示登录：任意用户名 / 密码 123456）
npm run build      # 类型检查 + 生产构建
npm run preview    # 预览构建产物
npm run lint       # oxlint + eslint
npx vitest run     # 单元测试
npm run test:e2e   # e2e 冒烟
```

## 目录速览

```text
src/
├── composables/   useLocalStorage / useTheme / useNotification
├── stores/        task(任务CRUD+过滤) · user(登录态) · plugins/persistence(持久化插件)
├── router/        登录守卫 · meta 标题 · 动态路由 /task/:id
├── components/    common(AppModal 具名插槽 / TaskList 作用域插槽)
│                  task(TaskColumn/TaskCard/TaskForm/TaskDialog 异步组件)
└── views/         Login / Board / List / Detail / Perf / 404
```

## 学习阶段对照

| 阶段         | 落点                                                                                                                         |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| 1 工程化     | vite.config.ts、.husky/、src/assets/main.css（Tailwind）                                                                     |
| 2 组合式 API | stores/task.ts（computed 过滤）、useTheme.ts（watchEffect）、AppHeader（生命周期）                                           |
| 3 组件进阶   | TaskCard（props/emits）、useTheme+THEME_KEY（provide/inject）、AppModal/TaskList（插槽）、TaskDialog（defineAsyncComponent） |
| 4 状态与路由 | stores/、plugins/persistence.ts、ListView（storeToRefs）、router/index.ts（守卫/meta）                                       |
| 5 复用与性能 | composables/、BoardView（markRaw）、PerfView（shallowRef/v-memo/v-once）                                                     |
| 6 部署工程化 | .env.*、vite.config.ts（分包/gzip）、Dockerfile、.github/workflows/ci.yml                                                    |

## 已知环境注意事项

- Pinia 4 的 `pinia.use()` 在 `app.use(pinia)` 之前只入延迟队列：测试中必须先 `createApp().use(pinia)` 插件才会执行（见 `src/stores/__tests__/persistence.spec.ts` 的 `setupPinia`）。
- `ElMessage` / `ElMessageBox` 的自动导入声明在 dev/build transform 用到后才会写入 `auto-imports.d.ts`；新增用法后先跑一次 dev 或 build 再 type-check。
- Windows 下 npm 的可选依赖 bug 可能在 `npm install` 后清掉 `@rolldown` / `@oxlint` 的 win32 原生绑定，补装：`npm i --no-save @rolldown/binding-win32-x64-msvc @oxlint/binding-win32-x64-msvc`。
- e2e 基于 dev server：冷启动首次跑可能因 Vite 依赖预构建触发 full-reload 导致偶发失败，重跑即可；CI 中走 preview（构建产物）无此问题。
