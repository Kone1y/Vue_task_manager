import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ElMessage, ElNotification } from 'element-plus'
import { useNotification } from '../useNotification'

// mock 掉 element-plus：单测不渲染真实弹层，只验证调用契约
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn<(message: string) => void>(),
    error: vi.fn<(message: string) => void>(),
    info: vi.fn<(message: string) => void>(),
  },
  ElNotification: vi.fn<(options: Record<string, unknown>) => void>(),
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
