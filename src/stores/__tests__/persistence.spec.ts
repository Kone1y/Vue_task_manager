import { describe, it, expect, beforeEach } from 'vitest'
import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useTaskStore } from '../task'
import { createPersistence } from '../plugins/persistence'

const draft = {
  title: '写周报',
  description: '整理本周进展',
  category: 'work',
  priority: 'medium',
} as const

// Pinia 4 行为变化：app.use(pinia) 之前 use() 注册的插件进 toBeInstalled 延迟队列，
// 不挂 app 插件永远不会执行 —— 测试里必须像真实应用一样先 install。
function setupPinia() {
  const pinia = createPinia().use(createPersistence())
  createApp({ render: () => null }).use(pinia)
  setActivePinia(pinia)
}

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
    setupPinia()
    useTaskStore().addTask(draft)
    const raw = localStorage.getItem('taskflow:task')
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw!).tasks[0]!.title).toBe('写周报')
  })

  it('新 pinia 实例（模拟刷新页面）能从 localStorage 恢复', () => {
    setupPinia()
    useTaskStore().addTask(draft)

    setupPinia()
    const restored = useTaskStore()
    expect(restored.tasks).toHaveLength(1)
    expect(restored.tasks[0]!.title).toBe('写周报')
  })

  it('损坏的存档会被清除并回退初始状态', () => {
    localStorage.setItem('taskflow:task', '{oops')
    setupPinia()
    expect(useTaskStore().tasks).toHaveLength(0)
    expect(localStorage.getItem('taskflow:task')).toBeNull()
  })
})
