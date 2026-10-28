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
