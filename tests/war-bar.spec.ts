import { test, expect } from '@playwright/test'
import { AppPage } from './helpers/AppPage'

test.describe('War Bar', () => {
  let app: AppPage

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page)
    await app.reset()
  })

  test('shows neutral state with no tasks', async () => {
    await expect(app.warBar()).toContainText('Add tasks to begin the war')
  })

  test('order fill starts at 50% in neutral state', async () => {
    const pct = await app.orderPercent()
    expect(pct).toBe(50)
  })

  test('completing a task increases order percent', async () => {
    await app.addTask({ title: 'Hold the Line' })
    const before = await app.orderPercent()

    await app.advanceTask('Hold the Line')  // backlog → in progress
    await app.advanceTask('Hold the Line')  // in progress → done

    const after = await app.orderPercent()
    expect(after).toBeGreaterThan(before)
  })

  test('order fill reaches 100% when all tasks are done', async () => {
    await app.addTask({ title: 'Siege Altdorf' })
    await app.advanceTask('Siege Altdorf')
    await app.advanceTask('Siege Altdorf')

    await expect(app.warBar()).toContainText('Empire Victorious')
  })

  test('chaos fill reaches 100% when tasks exist but none are done', async () => {
    await app.addTask({ title: 'Neglected Duty' })
    // Task stays in Backlog — chaos should be 100%
    const pct = await app.orderPercent()
    expect(pct).toBe(0)
    await expect(app.warBar()).toContainText('Chaos Reigns Eternal')
  })

  test('retreating a done task decreases order percent', async () => {
    await app.addTask({ title: 'Push Forward' })
    await app.advanceTask('Push Forward')
    await app.advanceTask('Push Forward')
    const done = await app.orderPercent()

    await app.retreatTask('Push Forward')
    const retreated = await app.orderPercent()
    expect(retreated).toBeLessThan(done)
  })

  test('phase badge updates as tasks are completed', async ({ page }) => {
    await app.addTask({ title: 'Task One' })
    // 1 task in backlog, 0 done → chaos_victory ("Realm in Ruins")
    await expect(app.phaseBadge()).toContainText('Realm in Ruins')

    await app.advanceTask('Task One')
    await app.advanceTask('Task One')
    // All done → order_victory ("Total Victory")
    await expect(app.phaseBadge()).toContainText('Total Victory')
  })
})
