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
