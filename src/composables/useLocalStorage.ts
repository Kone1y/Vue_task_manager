import { ref, watch, type Ref } from 'vue'

/**
 * 把一个 ref 双向同步到 localStorage。
 * - 读：初始化时读回；JSON 损坏时回退初始值
 * - 写：deep + sync，任何变化立刻序列化写回（适合主题等小体量状态；
 *   大数据量请勿用本 composable，避免每次变更全量 stringify）
 */
export function useLocalStorage<T>(key: string, initialValue: T): Ref<T> {
  function read(): T {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? initialValue : (JSON.parse(raw) as T)
    } catch {
      return initialValue
    }
  }

  const data = ref(read()) as Ref<T>

  watch(
    data,
    (value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {
        // 隐私模式等写入失败场景：静默降级为纯内存状态
      }
    },
    { deep: true, flush: 'sync' },
  )

  return data
}
