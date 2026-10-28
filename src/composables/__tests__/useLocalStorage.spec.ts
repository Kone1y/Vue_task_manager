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
