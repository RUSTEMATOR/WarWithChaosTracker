import { type Page, type Locator, expect } from '@playwright/test'

/**
 * Page-object wrapper for War With Chaos.
 * All selectors live here — tests never touch raw strings.
 */
export class AppPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  async goto() {
    await this.page.goto('/')
  }

  /** Reset to a blank board without a page reload.
   *
   *  Uses window.__wwc_dispatch (exposed in dev mode by AppContext) to dispatch
   *  LOAD_STATE directly into React state. This avoids the race condition where
   *  React's persistence useEffect overwrites our localStorage write between a
   *  separate evaluate() and reload() call.
   */
  async reset() {
    await this.page.goto('/')
    // Wait for the app to fully mount so __wwc_dispatch is available
    await this.page.waitForFunction(() => typeof (window as any).__wwc_dispatch === 'function', { timeout: 10_000 })
    // Dispatch empty state directly into React — no reload needed
    await this.page.evaluate(() => {
      ;(window as any).__wwc_dispatch({
        type: 'LOAD_STATE',
        payload: {
          tasks: [],
          allTimeDoneCount: 0,
          streak: { currentStreak: 0, lastCompletionDate: null },
        },
      })
    })
    // Also sync localStorage so persistence won't re-hydrate stale data on any subsequent reload
    await this.page.evaluate(() => {
      localStorage.setItem('war-with-chaos-state', JSON.stringify({
        version: 2,
        tasks: [],
        allTimeDoneCount: 0,
        streak: { currentStreak: 0, lastCompletionDate: null },
      }))
    })
    // data-phase="neutral" appears once React re-renders with 0 tasks
    await this.page.waitForSelector('[data-testid="war-bar"][data-phase="neutral"]', { timeout: 10_000 })
  }

  // ── War bar ───────────────────────────────────────────────────────────────

  warBar() {
    return this.page.getByTestId('war-bar')
  }

  warBarOrder() {
    return this.page.getByTestId('war-bar-order')
  }

  warBarChaos() {
    return this.page.getByTestId('war-bar-chaos')
  }

  async orderPercent(): Promise<number> {
    const w = await this.page.getByTestId('war-bar-order').evaluate(
      el => parseFloat((el as HTMLElement).style.width)
    )
    return w
  }

  // ── Task modal ────────────────────────────────────────────────────────────

  async openAddModal(status: 'backlog' | 'inProgress' | 'done' = 'backlog') {
    const col = this.column(status)
    await col.getByRole('button', { name: /issue orders/i }).click()
    await this.page.waitForSelector('[role="dialog"]')
  }

  async fillTaskForm(opts: {
    title: string
    description?: string
    priority?: 'Skirmish' | 'Campaign' | 'Crusade'
    dueDate?: string  // YYYY-MM-DD
    status?: 'Backlog' | 'In Progress' | 'Done'
  }) {
    await this.page.getByPlaceholder('Name this battle...').fill(opts.title)
    if (opts.description) {
      await this.page.getByPlaceholder('Details of the engagement...').fill(opts.description)
    }
    if (opts.priority) {
      await this.page.getByRole('button', { name: opts.priority }).click()
    }
    if (opts.dueDate) {
      await this.page.locator('input[type="date"]').fill(opts.dueDate)
    }
    if (opts.status) {
      await this.page.getByRole('button', { name: opts.status, exact: true }).click()
    }
  }

  async submitForm(label: 'Deploy Forces' | 'Update Orders' = 'Deploy Forces') {
    await this.page.getByRole('button', { name: label }).click()
    await this.page.waitForSelector('[role="dialog"]', { state: 'hidden' })
  }

  /** Convenience: open modal, fill, submit. Returns the card locator. */
  async addTask(opts: {
    title: string
    description?: string
    priority?: 'Skirmish' | 'Campaign' | 'Crusade'
    dueDate?: string
    status?: 'backlog' | 'inProgress' | 'done'
  }) {
    await this.openAddModal(opts.status ?? 'backlog')
    await this.fillTaskForm({
      ...opts,
      status: opts.status === 'inProgress' ? 'In Progress' : opts.status === 'done' ? 'Done' : 'Backlog',
    })
    await this.submitForm()
    return this.taskCard(opts.title)
  }

  // ── Columns ───────────────────────────────────────────────────────────────

  column(status: 'backlog' | 'inProgress' | 'done'): Locator {
    return this.page.getByTestId(`column-${status}`)
  }

  columnCount(status: 'backlog' | 'inProgress' | 'done'): Locator {
    return this.column(status).getByTestId('column-count')
  }

  async columnTaskCount(status: 'backlog' | 'inProgress' | 'done'): Promise<number> {
    const text = await this.columnCount(status).textContent()
    return parseInt(text ?? '0', 10)
  }

  // ── Task cards ────────────────────────────────────────────────────────────

  taskCard(title: string): Locator {
    return this.page.getByTestId('task-card').filter({ hasText: title })
  }

  async advanceTask(title: string) {
    await this.taskCard(title).getByRole('button', { name: /advance/i }).click()
  }

  async retreatTask(title: string) {
    await this.taskCard(title).getByRole('button', { name: /retreat/i }).click()
  }

  async editTask(title: string) {
    await this.taskCard(title).getByRole('button', { name: /edit/i }).click()
    await this.page.waitForSelector('[role="dialog"]')
  }

  async deleteTask(title: string) {
    const card = this.taskCard(title)
    await card.getByTestId('btn-delete').click()  // first click → confirm state (aria-label changes)
    await card.getByTestId('btn-delete').click()  // second click → executes delete
  }

  async deleteTaskFirstClick(title: string) {
    await this.taskCard(title).getByTestId('btn-delete').click()
  }

  // ── Search ────────────────────────────────────────────────────────────────

  searchInput(): Locator {
    return this.page.getByPlaceholder('Scout for a task...')
  }

  async search(query: string) {
    await this.searchInput().fill(query)
  }

  async clearSearch() {
    await this.page.getByRole('button', { name: /clear search/i }).click()
  }

  // ── Stats panel ───────────────────────────────────────────────────────────

  phaseBadge(): Locator {
    return this.page.getByTestId('phase-badge')
  }

  flavorText(): Locator {
    return this.page.getByTestId('flavor-text')
  }

  statCounter(label: string): Locator {
    return this.page.getByTestId(`stat-${label.toLowerCase()}`)
  }

  // ── Keyboard helpers ──────────────────────────────────────────────────────

  async pressN() {
    await this.page.keyboard.press('n')
    await this.page.waitForSelector('[role="dialog"]')
  }

  async pressQuestion() {
    await this.page.keyboard.press('?')
  }

  async pressEscape() {
    await this.page.keyboard.press('Escape')
  }

  async pressUndo() {
    await this.page.keyboard.press('Control+z')
  }

  // ── Toolbar ───────────────────────────────────────────────────────────────

  async clickExport() {
    await this.page.getByRole('button', { name: /export/i }).click()
  }

  async assertModalOpen() {
    await expect(this.page.locator('[role="dialog"]')).toBeVisible()
  }

  async assertModalClosed() {
    await expect(this.page.locator('[role="dialog"]')).not.toBeVisible()
  }
}
