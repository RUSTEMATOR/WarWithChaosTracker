import { test, expect } from '@playwright/test'
import { AppPage } from './helpers/AppPage'

test.describe('Task CRUD', () => {
  let app: AppPage

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page)
    await app.reset()
  })

  // ── Create ────────────────────────────────────────────────────────────────

  test('can add a task to backlog', async () => {
    await app.addTask({ title: 'Recruit New Soldiers' })
    await expect(app.taskCard('Recruit New Soldiers')).toBeVisible()
    expect(await app.columnTaskCount('backlog')).toBe(1)
  })

  test('can add a task with description', async () => {
    await app.addTask({ title: 'Build Cannon', description: 'For the siege of Middenheim' })
    await expect(app.taskCard('Build Cannon')).toContainText('For the siege of Middenheim')
  })

  test('can add a task directly to In Progress column', async () => {
    await app.addTask({ title: 'Active Patrol', status: 'inProgress' })
    await expect(app.column('inProgress').getByTestId('task-card')).toContainText('Active Patrol')
    expect(await app.columnTaskCount('inProgress')).toBe(1)
  })

  test('can add a task directly to Done column', async () => {
    await app.addTask({ title: 'Cleared the Road', status: 'done' })
    await expect(app.column('done').getByTestId('task-card')).toContainText('Cleared the Road')
    expect(await app.columnTaskCount('done')).toBe(1)
  })

  test('task form requires title — empty submit does nothing', async () => {
    await app.openAddModal('backlog')
    await app.page.getByRole('button', { name: 'Deploy Forces' }).click()
    // Modal should still be open
    await app.assertModalOpen()
    await app.pressEscape()
  })

  test('can add a task with Crusade priority', async () => {
    await app.addTask({ title: 'Storm the Keep', priority: 'Crusade' })
    await expect(app.taskCard('Storm the Keep')).toContainText('Crusade')
  })

  test('can add a task with a due date', async () => {
    await app.addTask({ title: 'Muster the Army', dueDate: '2099-12-31' })
    await expect(app.taskCard('Muster the Army')).toContainText('Dec 31')
  })

  // ── Read ──────────────────────────────────────────────────────────────────

  test('task card shows title', async () => {
    await app.addTask({ title: 'Hold the Rhine' })
    await expect(app.taskCard('Hold the Rhine')).toContainText('Hold the Rhine')
  })

  test('column count badge increments on add', async () => {
    expect(await app.columnTaskCount('backlog')).toBe(0)
    await app.addTask({ title: 'Task A' })
    expect(await app.columnTaskCount('backlog')).toBe(1)
    await app.addTask({ title: 'Task B' })
    expect(await app.columnTaskCount('backlog')).toBe(2)
  })

  // ── Update ────────────────────────────────────────────────────────────────

  test('can edit a task title', async () => {
    await app.addTask({ title: 'Old Title' })
    await app.editTask('Old Title')

    const titleInput = app.page.getByPlaceholder('Name this battle...')
    await titleInput.clear()
    await titleInput.fill('New Title')
    await app.submitForm('Update Orders')

    await expect(app.taskCard('New Title')).toBeVisible()
    await expect(app.page.getByTestId('task-card').filter({ hasText: 'Old Title' })).not.toBeVisible()
  })

  test('can edit a task description', async () => {
    await app.addTask({ title: 'Patrol the Border' })
    await app.editTask('Patrol the Border')
    await app.page.getByPlaceholder('Details of the engagement...').fill('Watch for Chaos incursions')
    await app.submitForm('Update Orders')
    await expect(app.taskCard('Patrol the Border')).toContainText('Watch for Chaos incursions')
  })

  test('can change task status through the edit form', async () => {
    await app.addTask({ title: 'Urgent Mission' })
    expect(await app.columnTaskCount('backlog')).toBe(1)

    await app.editTask('Urgent Mission')
    await app.page.getByRole('button', { name: 'In Progress', exact: true }).click()
    await app.submitForm('Update Orders')

    expect(await app.columnTaskCount('backlog')).toBe(0)
    expect(await app.columnTaskCount('inProgress')).toBe(1)
  })

  // ── Move ──────────────────────────────────────────────────────────────────

  test('advance button moves task from Backlog to In Progress', async () => {
    await app.addTask({ title: 'March to Battle' })
    await app.advanceTask('March to Battle')
    expect(await app.columnTaskCount('backlog')).toBe(0)
    expect(await app.columnTaskCount('inProgress')).toBe(1)
  })

  test('advance button moves task from In Progress to Done', async () => {
    await app.addTask({ title: 'Engage the Enemy' })
    await app.advanceTask('Engage the Enemy')
    await app.advanceTask('Engage the Enemy')
    expect(await app.columnTaskCount('done')).toBe(1)
  })

  test('retreat button moves task from In Progress back to Backlog', async () => {
    await app.addTask({ title: 'Flank Manoeuvre' })
    await app.advanceTask('Flank Manoeuvre')
    await app.retreatTask('Flank Manoeuvre')
    expect(await app.columnTaskCount('backlog')).toBe(1)
    expect(await app.columnTaskCount('inProgress')).toBe(0)
  })

  test('advance button is disabled for Done tasks', async () => {
    await app.addTask({ title: 'Completed Campaign' })
    await app.advanceTask('Completed Campaign')
    await app.advanceTask('Completed Campaign')
    const btn = app.taskCard('Completed Campaign').getByTestId('btn-advance')
    await expect(btn).toBeDisabled()
  })

  test('retreat button is disabled for Backlog tasks', async () => {
    await app.addTask({ title: 'New Recruit' })
    const btn = app.taskCard('New Recruit').getByTestId('btn-retreat')
    await expect(btn).toBeDisabled()
  })

  test('done task title has line-through style', async () => {
    await app.addTask({ title: 'Vanquish the Daemon' })
    await app.advanceTask('Vanquish the Daemon')
    await app.advanceTask('Vanquish the Daemon')
    const title = app.taskCard('Vanquish the Daemon').locator('p').first()
    await expect(title).toHaveClass(/line-through/)
  })

  // ── Delete ────────────────────────────────────────────────────────────────

  test('first delete click shows confirmation state', async () => {
    await app.addTask({ title: 'Expendable Scout' })
    await app.deleteTaskFirstClick('Expendable Scout')
    const btn = app.taskCard('Expendable Scout').getByTestId('btn-delete')
    await expect(btn).toContainText('!')
  })

  test('second delete click removes the task', async () => {
    await app.addTask({ title: 'Fallen Soldier' })
    await app.deleteTask('Fallen Soldier')
    await expect(app.taskCard('Fallen Soldier')).not.toBeVisible()
    expect(await app.columnTaskCount('backlog')).toBe(0)
  })

  test('delete confirmation auto-cancels after timeout', async ({ page }) => {
    await app.addTask({ title: 'Spared Prisoner' })
    await app.deleteTaskFirstClick('Spared Prisoner')
    // Wait for 3.5s timeout
    await page.waitForTimeout(3500)
    const btn = app.taskCard('Spared Prisoner').getByTestId('btn-delete')
    await expect(btn).not.toContainText('!')
  })
})
