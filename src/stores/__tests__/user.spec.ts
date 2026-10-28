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
