<script setup lang="ts">
import { Close } from '@element-plus/icons-vue'

// defineModel（Vue 3.4+）：父组件直接 v-model 控制显隐，
// 替代 modelValue prop + update:modelValue emit 的旧样板
const visible = defineModel<boolean>({ default: false })

defineProps<{
  title?: string
  width?: string
}>()

const emit = defineEmits<{
  'after-enter': []
}>()

function close() {
  visible.value = false
}
</script>

<template>
  <!-- Teleport：渲染到 body 下，摆脱父级 overflow/z-index 影响 -->
  <Teleport to="body">
    <Transition name="modal" @after-enter="emit('after-enter')">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
        @click.self="close"
      >
        <div
          class="max-h-[85vh] w-full overflow-auto rounded-xl bg-white shadow-xl dark:bg-slate-800 sm:w-[28rem]"
          :style="width ? { width } : undefined"
        >
          <header
            class="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-700"
          >
            <!-- 具名插槽 + 后备内容：调用方不传 header 时回退显示 title 属性 -->
            <slot name="header">
              <h3 class="font-semibold">{{ title }}</h3>
            </slot>
            <el-button text circle :icon="Close" @click="close" />
          </header>

          <div class="px-5 py-4">
            <slot />
          </div>

          <footer
            v-if="$slots.footer"
            class="flex justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-slate-700"
          >
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from > div,
.modal-leave-to > div {
  transform: translateY(16px) scale(0.98);
}
</style>
