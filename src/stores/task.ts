import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Category, Task, TaskFormPayload, TaskStatus } from '@/types/task'

export const useTaskStore = defineStore('task', () => {
  // 实战选型：任务列表用 ref。
  // reactive 适合"固定结构的表单对象"；数组整体替换 + 逐项操作的场景用 ref 更直观。
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
    addTask({
      title: '熟悉 Vue3 组合式 API',
      description: '过一遍 ref/computed/watchEffect 差异',
      category: 'study',
      priority: 'high',
    })
    addTask({
      title: '写周报',
      description: '整理本周进展与下周计划',
      category: 'work',
      priority: 'medium',
    })
    addTask({
      title: '跑步 5 公里',
      description: '周三和周五各一次',
      category: 'life',
      priority: 'low',
    })
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
