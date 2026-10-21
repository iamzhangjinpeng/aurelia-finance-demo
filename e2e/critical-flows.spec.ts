import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function signIn(page: Page) {
  await page.goto('#/login')
  await page.getByRole('button', { name: 'Fill demo credentials' }).click()
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('heading', { name: /A clearer picture/ })).toBeVisible()
}

async function openWorkspacePage(page: Page, name: string | RegExp) {
  const menu = page.getByRole('button', { name: 'Open navigation' })
  if (await menu.isVisible()) {
    await menu.click()
    const sidebar = page.locator('.sidebar')
    await expect(sidebar).toHaveClass(/mobile-open/)
    await expect(sidebar).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
  }
  const target = page.getByRole('navigation').getByRole('link', { name })
  await target.scrollIntoViewIfNeeded()
  await expect(target).toBeVisible()
  await target.click()
}

async function expectAccessible(page: Page, route: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  const summary = results.violations
    .map(
      (violation) =>
        `${violation.id} (${violation.impact}): ${violation.help}; ${violation.nodes
          .map((node) => node.target.join(', '))
          .join('; ')}`,
    )
    .join('\n')
  expect(results.violations, `${route} accessibility violations:\n${summary}`).toEqual([])
}

test('home, demo login, workspace navigation, and deep-link refresh work', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('A clearer perspective.')
  await page.getByRole('link', { name: 'Explore the demo' }).click()
  await page.getByRole('button', { name: 'Fill demo credentials' }).click()
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/#\/app$/)
  await expect(page.getByRole('heading', { name: /A clearer picture/ })).toBeVisible()

  const pages = [
    { name: 'Transactions', heading: /Every movement, in view/ },
    { name: 'Accounts & cards', heading: /Your money, well connected/ },
    { name: 'Budgets', heading: /A plan for what matters/ },
    { name: /Settings & security/, heading: /Make yourself at home/ },
  ]
  for (const item of pages) {
    await openWorkspacePage(page, item.name)
    await expect(page.getByRole('heading', { name: item.heading })).toBeVisible()
  }

  await page.reload()
  await expect(page.getByRole('heading', { name: /Make yourself at home/ })).toBeVisible()
})

test('transactions can be filtered, opened, and exported', async ({ page }) => {
  await signIn(page)
  await openWorkspacePage(page, /Transactions/)
  await page.getByLabel('Filter by status').selectOption('Completed')
  const firstRow = page.locator('tbody tr').first()
  await expect(firstRow).toBeVisible()
  await expect(firstRow.getByText('Completed')).toBeVisible()
  await firstRow.getByRole('button', { name: /^View / }).click()
  await expect(page.getByRole('dialog', { name: 'Transaction details' })).toBeVisible()
  await page.getByRole('button', { name: 'Close dialog' }).click()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export CSV' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('aurelia-transactions.csv')
})

test('budgets can be created, saved, and deleted with confirmation', async ({ page }) => {
  await signIn(page)
  await openWorkspacePage(page, 'Budgets')
  await page.getByRole('button', { name: 'Create budget' }).click()
  const form = page.getByRole('dialog')
  await form.getByLabel('Budget name').fill('QA Travel')
  await form.getByLabel('Monthly limit (USD)').fill('450')
  await form.getByRole('button', { name: 'Create budget' }).click()
  await expect(page.getByRole('heading', { name: 'QA Travel' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'QA Travel' })).toBeVisible()
  await page.getByRole('button', { name: 'Delete QA Travel' }).click()
  const confirmation = page.getByRole('alertdialog')
  await expect(confirmation).toContainText('Delete QA Travel?')
  await confirmation.getByRole('button', { name: 'Delete budget' }).click()
  await expect(page.getByRole('heading', { name: 'QA Travel' })).toHaveCount(0)
})

test('theme and profile persist, and reset restores the sample profile', async ({ page }) => {
  await signIn(page)
  await page.getByRole('button', { name: 'Switch to dark theme' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await openWorkspacePage(page, /Settings & security/)
  await page.getByLabel('Full name').fill('Taylor Morgan')
  await page.getByLabel('Company').fill('Taylor Studio')
  await page.getByRole('button', { name: 'Save profile' }).click()
  await expect(page.getByRole('status')).toContainText('Your profile has been updated.')

  await page.reload()
  await expect(page.getByLabel('Full name')).toHaveValue('Taylor Morgan')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.getByRole('button', { name: 'Reset demo data' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Reset demo' }).click()
  await expect(page.getByLabel('Full name')).toHaveValue('Alex Morgan')
})

test('Open Graph and Twitter previews resolve to the published card', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Aurelia Finance | Your money, in perspective')
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    'Aurelia Finance | Your money, in perspective',
  )
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  )
  const image = await page.request.get('http://127.0.0.1:4179/aurelia-finance-demo/og-image.png')
  expect(image.ok()).toBe(true)
  expect(image.headers()['content-type']).toContain('image/png')
})

test('incorrect demo credentials show an accessible error', async ({ page }) => {
  await page.goto('#/login')
  await page.getByLabel('Email address').fill('wrong@example.com')
  await page.getByRole('textbox', { name: 'Password' }).fill('incorrect')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('alert')).toContainText('don’t match')
  await expect(page).toHaveURL(/#\/login$/)
})

test('key routes have no automated WCAG A/AA violations', async ({ page }) => {
  await page.goto('/')
  await expectAccessible(page, 'Landing')
  await page.goto('#/login')
  await expectAccessible(page, 'Login')
  await signIn(page)
  await expectAccessible(page, 'Overview (light theme)')

  const pages = [
    { name: 'Transactions', label: /Transactions/ },
    { name: 'Accounts & cards', label: /Accounts & cards/ },
    { name: 'Budgets', label: 'Budgets' },
    { name: 'Settings & security', label: /Settings & security/ },
  ]
  for (const item of pages) {
    await openWorkspacePage(page, item.label)
    await expectAccessible(page, `${item.name} (light theme)`)
  }

  await page.getByRole('button', { name: 'Switch to dark theme' }).click()
  await expectAccessible(page, 'Overview (dark theme)')
  for (const item of pages) {
    await openWorkspacePage(page, item.label)
    await expectAccessible(page, `${item.name} (dark theme)`)
  }
})

test('mobile layouts fit the viewport and the navigation drawer works', async ({ page }) => {
  test.skip(test.info().project.name !== 'mobile-chromium', 'Mobile viewport check')
  await page.goto('/')
  const landingWidths = await page.evaluate(
    () => [document.body.scrollWidth, document.documentElement.clientWidth] as const,
  )
  expect(landingWidths[0]).toBeLessThanOrEqual(landingWidths[1] + 1)

  await signIn(page)
  await openWorkspacePage(page, /Transactions/)
  await expect(page.getByRole('heading', { name: /Every movement, in view/ })).toBeVisible()
  const workspaceWidths = await page.evaluate(
    () => [document.body.scrollWidth, document.documentElement.clientWidth] as const,
  )
  expect(workspaceWidths[0]).toBeLessThanOrEqual(workspaceWidths[1] + 1)
})
