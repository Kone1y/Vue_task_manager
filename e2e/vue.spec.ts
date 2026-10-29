import { test, expect } from '@playwright/test'

test('未登录访问看板被守卫重定向到登录页', async ({ page }) => {
  await page.goto('/board')
  await expect(page).toHaveURL(/\/login/)
})

test('登录后进入看板并可新建任务', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('用户名').fill('e2e')
  await page.getByPlaceholder('密码').fill('123456')
  await page.getByRole('button', { name: '登录' }).click()

  await expect(page).toHaveURL(/\/board/)

  await page.getByRole('button', { name: '新建任务' }).click()
  await page.getByPlaceholder('任务标题').fill('第一条 e2e 任务')
  await page.getByRole('button', { name: '保存' }).click()

  await expect(page.getByText('第一条 e2e 任务')).toBeVisible()
})
