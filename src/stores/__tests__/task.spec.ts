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
