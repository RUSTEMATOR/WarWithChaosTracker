import { test, expect } from '@playwright/test'
import { AppPage } from './helpers/AppPage'

test.describe('Search', () => {
  let app: AppPage

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page)
    await app.reset()
    await app.addTask({ title: 'Siege of Middenheim' })
    await app.addTask({ title: 'Battle of Blackfire Pass' })
    await app.addTask({ title: 'Defend Averheim', description: 'Eastern province engagement' })
  })

  test('filters tasks by title', async () => {
    await app.search('Middenheim')
    await expect(app.taskCard('Siege of Middenheim')).toBeVisible()
    await expect(app.page.getByTestId('task-card').filter({ hasText: 'Blackfire' })).not.toBeVisible()
  })

  test('filters tasks by description', async () => {
    await app.search('Eastern province')
    await expect(app.taskCard('Defend Averheim')).toBeVisible()
    await expect(app.page.getByTestId('task-card').filter({ hasText: 'Middenheim' })).not.toBeVisible()
  })

  test('search is case-insensitive', async () => {
    await app.search('middenheim')
    await expect(app.taskCard('Siege of Middenheim')).toBeVisible()
  })

  test('empty search restores all tasks', async () => {
    await app.search('Middenheim')
    await app.clearSearch()
    await expect(app.taskCard('Siege of Middenheim')).toBeVisible()
    await expect(app.taskCard('Battle of Blackfire Pass')).toBeVisible()
    await expect(app.taskCard('Defend Averheim')).toBeVisible()
  })

  test('no-match shows empty state message', async () => {
    await app.search('zzznomatch')
    await expect(app.column('backlog').getByText('No matches found.')).toBeVisible()
  })
})

test.describe('Column Sorting', () => {
  let app: AppPage

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page)
    await app.reset()
    await app.addTask({ title: 'Low Task',    priority: 'Skirmish' })
    await app.addTask({ title: 'High Task',   priority: 'Crusade' })
    await app.addTask({ title: 'Medium Task', priority: 'Campaign' })
  })

  test('default sort is newest-first', async () => {
    const cards = await app.column('backlog').getByTestId('task-card').allTextContents()
    // Medium was added last, so it should appear first
    expect(cards[0]).toContain('Medium Task')
  })

  test('clicking sort cycles to Priority sort', async () => {
    const col = app.column('backlog')
    await col.getByText(/↓ New/).click()
    // After one click → Priority sort (High first)
    const cards = await col.getByTestId('task-card').allTextContents()
    expect(cards[0]).toContain('High Task')
  })

  test('sort cycles through all modes', async () => {
    const col = app.column('backlog')
    const btn = col.getByText(/↓ New|↓ Pri|↓ Due/)
    await expect(btn).toContainText('↓ New')
    await btn.click()
    await expect(btn).toContainText('↓ Pri')
    await btn.click()
    await expect(btn).toContainText('↓ Due')
    await btn.click()
    await expect(btn).toContainText('↓ New')
  })
})

test.describe('Due Dates', () => {
  let app: AppPage

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page)
    await app.reset()
  })

  test('future due date is shown on card', async () => {
    await app.addTask({ title: 'Future Campaign', dueDate: '2099-06-15' })
    await expect(app.taskCard('Future Campaign')).toContainText('Jun 15')
  })

  test('past due date shows overdue warning', async () => {
    await app.addTask({ title: 'Overdue Siege', dueDate: '2000-01-01' })
    await expect(app.taskCard('Overdue Siege')).toContainText('Overdue')
  })

  test('due date not shown on completed tasks', async () => {
    await app.addTask({ title: 'Done Quest', dueDate: '2000-01-01' })
    await app.advanceTask('Done Quest')
    await app.advanceTask('Done Quest')
    await expect(app.taskCard('Done Quest')).not.toContainText('Overdue')
  })
})

test.describe('Keyboard Shortcuts', () => {
  let app: AppPage

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page)
    await app.reset()
  })

  test('N opens new task modal', async () => {
    await app.pressN()
    await app.assertModalOpen()
  })

  test('? opens help modal', async () => {
    await app.pressQuestion()
    await expect(app.page.getByText('War Council')).toBeVisible()
    await app.pressEscape()
  })

  test('Escape closes modal', async () => {
    await app.pressN()
    await app.assertModalOpen()
    await app.pressEscape()
    await app.assertModalClosed()
  })

  test('N shortcut is ignored when typing in an input', async () => {
    await app.openAddModal()
    const input = app.page.getByPlaceholder('Name this battle...')
    await input.fill('n')  // typing 'n' in input should not open another modal
    await expect(input).toHaveValue('n')
    await app.assertModalOpen()  // only one modal open
    await app.pressEscape()
  })
})

test.describe('Undo', () => {
  let app: AppPage

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page)
    await app.reset()
  })

  test('Ctrl+Z undoes a task deletion', async () => {
    await app.addTask({ title: 'Deleted Hero' })
    await app.deleteTask('Deleted Hero')
    await expect(app.taskCard('Deleted Hero')).not.toBeVisible()

    await app.pressUndo()
    await expect(app.taskCard('Deleted Hero')).toBeVisible()
  })

  test('Ctrl+Z undoes a task move', async () => {
    await app.addTask({ title: 'Moved Soldier' })
    await app.advanceTask('Moved Soldier')
    expect(await app.columnTaskCount('inProgress')).toBe(1)

    await app.pressUndo()
    expect(await app.columnTaskCount('backlog')).toBe(1)
    expect(await app.columnTaskCount('inProgress')).toBe(0)
  })

  test('multiple Ctrl+Z undoes multiple actions', async () => {
    await app.addTask({ title: 'Task Alpha' })
    await app.addTask({ title: 'Task Beta' })
    expect(await app.columnTaskCount('backlog')).toBe(2)

    await app.pressUndo()
    expect(await app.columnTaskCount('backlog')).toBe(1)

    await app.pressUndo()
    expect(await app.columnTaskCount('backlog')).toBe(0)
  })
})

test.describe('Persistence', () => {
  let app: AppPage

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page)
    await app.reset()
  })

  test('tasks survive a page reload', async ({ page }) => {
    await app.addTask({ title: 'Enduring Legacy' })
    await page.reload()
    await page.waitForSelector('[data-testid="war-bar"]')
    await expect(app.taskCard('Enduring Legacy')).toBeVisible()
  })

  test('allTimeDoneCount survives reload', async ({ page }) => {
    await app.addTask({ title: 'Quick Victory' })
    await app.advanceTask('Quick Victory')
    await app.advanceTask('Quick Victory')

    await page.reload()
    await page.waitForSelector('[data-testid="war-bar"]')
    // Wait for count animation to settle after reload
    await page.waitForTimeout(600)

    const allTime = app.statCounter('all-time')
    const value = await allTime.getByTestId('stat-value').textContent()
    expect(parseInt(value ?? '0')).toBeGreaterThanOrEqual(1)
  })

  test('streak data survives reload', async ({ page }) => {
    await app.addTask({ title: 'Daily Task' })
    await app.advanceTask('Daily Task')
    await app.advanceTask('Daily Task')

    await page.reload()
    await page.waitForSelector('[data-testid="war-bar"]')
    // Streak counter should appear
    await expect(app.page.getByText(/Campaign Streak/)).toBeVisible()
  })
})

test.describe('Export / Import', () => {
  let app: AppPage

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page)
    await app.reset()
  })

  test('export button triggers a file download', async ({ page }) => {
    await app.addTask({ title: 'Sacred Scroll' })

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      app.clickExport(),
    ])

    expect(download.suggestedFilename()).toMatch(/^war-with-chaos-\d{4}-\d{2}-\d{2}\.json$/)
  })

  test('import restores tasks from JSON', async ({ page }) => {
    // Build a minimal valid state payload
    const payload = JSON.stringify({
      version: 2,
      tasks: [
        {
          id: 'import-test-1',
          title: 'Restored from Backup',
          description: '',
          priority: 'high',
          status: 'backlog',
          createdAt: Date.now(),
        },
      ],
      allTimeDoneCount: 0,
      streak: { currentStreak: 0, lastCompletionDate: null },
    })

    // Write to localStorage directly to simulate an import
    await page.evaluate((json) => {
      localStorage.setItem('war-with-chaos-state', json)
    }, payload)
    await page.reload()
    await page.waitForSelector('[data-testid="war-bar"]')

    await expect(app.taskCard('Restored from Backup')).toBeVisible()
  })
})

test.describe('Accessibility', () => {
  let app: AppPage

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page)
    await app.reset()
    await app.addTask({ title: 'Accessible Task' })
  })

  test('column count badge has descriptive aria-label', async () => {
    await app.addTask({ title: 'Aria Task' })
    const badge = app.column('backlog').getByTestId('column-count')
    const label = await badge.getAttribute('aria-label')
    expect(label).toMatch(/task.*Backlog/i)
  })

  test('modal has role=dialog and aria-modal', async () => {
    await app.openAddModal()
    const dialog = app.page.locator('[role="dialog"]')
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
    await app.pressEscape()
  })

  test('modal has an accessible title via aria-labelledby', async () => {
    await app.openAddModal()
    const dialog = app.page.locator('[role="dialog"]')
    const labelId = await dialog.getAttribute('aria-labelledby')
    expect(labelId).toBeTruthy()
    const heading = app.page.locator(`#${labelId}`)
    await expect(heading).toBeVisible()
    await app.pressEscape()
  })

  test('advance button is labelled', async () => {
    const btn = app.taskCard('Accessible Task').getByTestId('btn-advance')
    const label = await btn.getAttribute('aria-label')
    expect(label).toBeTruthy()
  })

  test('delete button is labelled', async () => {
    const btn = app.taskCard('Accessible Task').getByTestId('btn-delete')
    const label = await btn.getAttribute('aria-label')
    expect(label).toBeTruthy()
  })
})

test.describe('Stats Panel', () => {
  let app: AppPage

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page)
    await app.reset()
  })

  test('backlog counter reflects task count', async () => {
    await app.addTask({ title: 'A' })
    await app.addTask({ title: 'B' })
    // Wait for count animation (400ms easing) to settle
    await app.page.waitForTimeout(600)
    const val = await app.statCounter('backlog').getByTestId('stat-value').textContent()
    expect(parseInt(val ?? '0')).toBe(2)
  })

  test('done counter increments when task is completed', async () => {
    await app.addTask({ title: 'Quick Win' })
    await app.advanceTask('Quick Win')
    await app.advanceTask('Quick Win')

    // Wait for animation to settle
    await app.page.waitForTimeout(500)
    const val = await app.statCounter('done').getByTestId('stat-value').textContent()
    expect(parseInt(val ?? '0')).toBe(1)
  })

  test('all-time counter never decreases on task deletion', async () => {
    await app.addTask({ title: 'Trophy Task' })
    await app.advanceTask('Trophy Task')
    await app.advanceTask('Trophy Task')

    await app.page.waitForTimeout(500)
    const before = parseInt(
      (await app.statCounter('all-time').getByTestId('stat-value').textContent()) ?? '0'
    )

    await app.deleteTask('Trophy Task')
    await app.page.waitForTimeout(500)
    const after = parseInt(
      (await app.statCounter('all-time').getByTestId('stat-value').textContent()) ?? '0'
    )
    expect(after).toBe(before)
  })

  test('flavor text is visible', async () => {
    await expect(app.flavorText()).toBeVisible()
    const text = await app.flavorText().textContent()
    expect(text?.length).toBeGreaterThan(5)
  })
})
