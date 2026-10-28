import type { PiniaPluginContext } from 'pinia'

const KEY_PREFIX = 'taskflow:'

/** 需要持久化的 store id 白名单 */
const PERSISTED_STORES = ['task', 'user']

export function createPersistence() {
  return ({ store }: PiniaPluginContext) => {
    if (!PERSISTED_STORES.includes(store.$id)) return

    const storageKey = `${KEY_PREFIX}${store.$id}`

    // 恢复：pinia 实例创建时读档，$patch 一次性合并进 state
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        store.$patch(JSON.parse(saved))
      } catch {
        localStorage.removeItem(storageKey)
      }
    }

    // 写档：订阅本 store 的所有 mutation；sync 保证变更同步落盘（默认 pre flush 会让测试断言跑在写档前）
    store.$subscribe(
      (_mutation, state) => {
        localStorage.setItem(storageKey, JSON.stringify(state))
      },
      { flush: 'sync' },
    )
  }
}
