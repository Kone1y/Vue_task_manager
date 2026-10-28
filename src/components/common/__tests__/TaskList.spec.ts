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
