import { ElMessage, ElNotification } from 'element-plus'

/**
 * 把消息提示的公共逻辑抽成 composable。
 * 好处：以后换 UI 库 / 加埋点 / 统一 duration，只改这一个文件。
 */
export function useNotification() {
  function success(message: string) {
    ElMessage.success(message)
  }

  function error(message: string) {
    ElMessage.error(message)
  }

  function info(message: string) {
    ElMessage.info(message)
  }

  function notifySuccess(title: string, message: string) {
    ElNotification({ title, message, type: 'success', duration: 2500 })
  }

  return { success, error, info, notifySuccess }
}
