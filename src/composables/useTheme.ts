import type { InjectionKey, Ref } from 'vue'
import { useLocalStorage } from './useLocalStorage'

export interface ThemeContext {
  isDark: Ref<boolean>
  toggle: () => void
}

/** provide/inject 的强类型键：inject(THEME_KEY) 自动推导为 ThemeContext | undefined */
export const THEME_KEY: InjectionKey<ThemeContext> = Symbol('theme')

function prefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export function useTheme(): ThemeContext {
  // 持久化到 localStorage，刷新后保持上次选择
  const isDark = useLocalStorage<boolean>('taskflow:dark', prefersDark())

  // watchEffect：自动追踪 isDark，变化时重新执行副作用
  watchEffect(() => {
    document.documentElement.classList.toggle('dark', isDark.value)
  })

  function toggle() {
    isDark.value = !isDark.value
  }

  return { isDark, toggle }
}
