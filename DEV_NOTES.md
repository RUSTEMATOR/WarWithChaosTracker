# War With Chaos — Developer Notes

Technical findings, missing features, and improvement ideas based on a full codebase review.

---

### 1. Undo Last Action (Ctrl+Z)

- **Effort:** Medium (2-4hr)
- **Type:** Feature
- **Description:** There is no way to recover from accidental deletions or moves. A single-level undo would be enough for the current scope.
- **Files affected:** `src/context/appReducer.ts`, `src/context/AppContext.tsx`, `src/types/index.ts`, `src/App.tsx`
- **Implementation hint:** Store a `past: AppState[]` stack (cap at ~20 entries) alongside `present` in the reducer. Add an `UNDO` action that pops `past` and restores it. Register a global `keydown` listener in `AppContext` (or a dedicated `useUndoShortcut` hook) for `Ctrl+Z` / `Cmd+Z`. No new UI needed beyond a subtle toast or the existing flavor text changing.

---

### 2. Due Date Field on Tasks

- **Effort:** Medium (2-4hr)
- **Type:** Feature
- **Description:** `Task` has no due date. Tasks cannot be prioritised by deadline, and the war metaphor has no concept of "time running out."
- **Files affected:** `src/types/index.ts`, `src/context/appReducer.ts`, `src/components/TaskModal/TaskForm.tsx`, `src/components/TaskBoard/TaskCard.tsx`, `src/utils/warMath.ts`
- **Implementation hint:** Add optional `dueAt?: number` (Unix ms) to `Task`. Render a native `<input type="date">` in `TaskForm`. In `TaskCard`, show the due date in a small row below the description; highlight it `text-chaos-red` when overdue (`dueAt < Date.now()` and status !== Done). Optionally factor overdue task count into `computeWarState` to push the phase toward `chaos_winning` faster.

---

### 3. Task Sort Order is Hardcoded (newest-first only)

- **Effort:** Small (< 1hr)
- **Type:** Enhancement
- **Description:** `TaskColumn` always sorts by `createdAt` descending. There is no way to sort by priority, due date (once added), or manually reorder. High-priority tasks can be buried under newer low-priority ones.
- **Files affected:** `src/components/TaskBoard/TaskColumn.tsx`, `src/utils/constants.ts`
- **Implementation hint:** Add a `sortMode` state (`'newest' | 'priority' | 'dueDate'`) to `TaskColumn`. Priority sort order: High → Medium → Low, with a secondary sort by `createdAt`. Expose a small toggle control in the column header next to the task count badge.

---

### 4. No Search or Filter Across Columns

- **Effort:** Medium (2-4hr)
- **Type:** Feature
- **Description:** As the task list grows there is no way to find a specific task or filter by priority without scanning all three columns manually.
- **Files affected:** `src/App.tsx`, `src/components/TaskBoard/TaskBoard.tsx`, `src/components/TaskBoard/TaskColumn.tsx`, `src/context/AppContext.tsx`
- **Implementation hint:** Add a controlled search string to `App`-level state (or a new React context slice). Pass it down to `TaskBoard` → `TaskColumn`, where it filters `tasks` before rendering. A single `<input>` in the header area is sufficient. Optionally add a priority chip row (`All / Low / Medium / High`) next to the search box.

---

### 5. Data Export and Import (JSON)

- **Effort:** Small (< 1hr)
- **Type:** Feature
- **Description:** All data lives in `localStorage` under a single key. There is no backup mechanism. If the browser storage is cleared the user loses everything. Export/import via JSON file takes one afternoon and covers this completely.
- **Files affected:** `src/context/AppContext.tsx`, `src/App.tsx`, `src/types/index.ts`
- **Implementation hint:** Export: serialize `{ tasks, allTimeDoneCount }` (already the shape saved by `STORAGE_KEY`) to a Blob and trigger a download via `URL.createObjectURL`. Import: accept a `.json` file input, parse, validate the shape, then `dispatch({ type: 'LOAD_STATE', payload })`. Add both actions as buttons in a collapsible "War Council" footer or side panel.

---

### 6. `EDIT_TASK` Does Not Update `allTimeDoneCount`

- **Effort:** Small (< 1hr)
- **Type:** Bug
- **Description:** `MOVE_TASK` correctly increments `allTimeDoneCount` when a task moves to Done. `EDIT_TASK` does not. If someone edits a task and also changes its status to Done via the form (the `status` field exists in `FormValues` and is passed through `onSubmit`), the all-time counter is silently not updated.
- **Files affected:** `src/context/appReducer.ts`
- **Implementation hint:** In the `EDIT_TASK` case, find the existing task, check if `changes.status === TaskStatus.Done` and the previous status was not Done, and increment `allTimeDoneCount` the same way `MOVE_TASK` does. Mirror the `wasNotDone && isNowDone` guard already present in `MOVE_TASK`.

---

### 7. `MOVE_TASK` Does Not Clear `completedAt` When Moving Back Out of Done

- **Effort:** Small (< 1hr)
- **Type:** Bug
- **Description:** When a task is moved back from Done to InProgress via the retreat button, `completedAt` is left set to the previous completion timestamp. This will give incorrect data to any future feature that uses `completedAt` (e.g., statistics, time-in-status charts).
- **Files affected:** `src/context/appReducer.ts`
- **Implementation hint:** In the `MOVE_TASK` reducer case, set `completedAt: isNowDone ? Date.now() : undefined` instead of `completedAt: isNowDone ? Date.now() : t.completedAt`.

---

### 8. `useFlavorText` Seed Collides Across Phases

- **Effort:** Small (< 1hr)
- **Type:** Bug / Enhancement
- **Description:** `flavorSeed` in `StatsPanel` is `state.tasks.length`. When the phase changes (e.g., you go from `balanced` to `order_winning` while still having the same number of tasks), the same index is used in the new phase's array, which can produce the same text index every time a phase first appears. Additionally, deleting a task and adding one back gives identical seed values, so the same quote appears repeatedly.
- **Files affected:** `src/components/StatsPanel/StatsPanel.tsx`, `src/hooks/useFlavorText.ts`
- **Implementation hint:** Change the seed to `state.allTimeDoneCount + state.tasks.length` so it monotonically increases with activity. Alternatively use a `useRef` counter that increments on each phase change to guarantee a fresh quote.

---

### 9. Modal Lacks Focus Trap (Accessibility)

- **Effort:** Small (< 1hr)
- **Type:** Bug / Accessibility
- **Description:** When the task modal is open, keyboard Tab focus can leave the modal and reach the buttons on task cards behind the overlay. This breaks WCAG 2.1 SC 2.1.2 (No Keyboard Trap in the correct direction) and makes the modal unusable for keyboard-only users.
- **Files affected:** `src/components/shared/Modal.tsx`
- **Implementation hint:** On modal open, collect all focusable elements inside the panel using `querySelectorAll('button, input, textarea, select, [tabindex]')`, then intercept `Tab` / `Shift+Tab` in the existing keydown handler to cycle focus within that NodeList. Return focus to the trigger element on close by storing `document.activeElement` before opening.

---

### 10. No `aria-label` on Column Task Count Badge

- **Effort:** Small (< 1hr)
- **Type:** Accessibility
- **Description:** The `<span>` in `TaskColumn` that shows the count (`{tasks.length}`) has no accessible label. A screen reader will read the number without context, e.g., "3" instead of "3 tasks in Backlog."
- **Files affected:** `src/components/TaskBoard/TaskColumn.tsx`
- **Implementation hint:** Add `aria-label={`${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} in ${label}`}` to the count `<span>`. Also add a `role="status"` so screen readers announce changes.

---

### 11. Keyboard Shortcuts for Common Actions

- **Effort:** Medium (2-4hr)
- **Type:** Feature
- **Description:** Beyond Escape-to-close (already implemented), there are no keyboard shortcuts. Power users cannot add a task, cycle through tasks, or open the edit modal without a mouse.
- **Files affected:** `src/App.tsx` or a new `src/hooks/useKeyboardShortcuts.ts`, `src/context/AppContext.tsx`
- **Implementation hint:** Register a global `keydown` listener (behind a guard that ignores events when an `input`/`textarea` is focused). Suggested bindings: `N` → open Add modal (Backlog default), `?` → show shortcuts cheatsheet overlay. Expose the cheatsheet as a simple `<dl>` in a new `HelpModal` component. Document shortcuts in a small tooltip on the `+ Issue Orders` button.

---

### 12. Chaos Corruption Visual That Grows Over Time

- **Effort:** Large (1+ day)
- **Type:** Feature (Warhammer theme deepening)
- **Description:** The current war bar is static between interactions. A corruption system would make the UI feel alive: the longer a high-priority task sits in Backlog without being touched, the more a visual "corruption" effect bleeds into the card's border and background, reinforcing the theme that neglect feeds Chaos.
- **Files affected:** `src/types/index.ts`, `src/components/TaskBoard/TaskCard.tsx`, `src/context/AppContext.tsx` (or a new `src/hooks/useCorruption.ts`)
- **Implementation hint:** Add a derived value `corruptionLevel: 0 | 1 | 2 | 3` computed from `(Date.now() - task.createdAt)` thresholds (e.g., 1 day, 3 days, 7 days) weighted by priority (High ages faster). In `TaskCard`, apply progressively more intense CSS classes: `border-chaos-red/30` → `border-chaos-red/60` → `border-chaos-red animate-pulse` → a faint red glow via `box-shadow`. Use a `setInterval` in `AppContext` (or a `useEffect` with a 1-minute tick) to force a re-render so the corruption updates without a user action.

---

### 13. Achievement / Milestone System ("Sigmar's Favour")

- **Effort:** Large (1+ day)
- **Type:** Feature (Warhammer theme deepening)
- **Description:** `allTimeDoneCount` is tracked but never surfaced as anything meaningful beyond a raw number in StatsPanel. An achievement system tied to cumulative completions would reward sustained use and deepen the theme.
- **Files affected:** `src/types/index.ts`, `src/context/appReducer.ts`, `src/utils/constants.ts`, `src/components/StatsPanel/StatsPanel.tsx`, new `src/components/Achievements/AchievementToast.tsx`
- **Implementation hint:** Define a `ACHIEVEMENTS` array in `constants.ts`: `{ id, threshold, title, description }` (e.g., at 1 done: "First Blood", at 10: "Veteran of Middenheim", at 50: "Champion of Sigmar"). In the `MOVE_TASK` / `ADD_TASK` reducers, compare the new `allTimeDoneCount` against thresholds and set a new `pendingAchievement?: string` field on `AppState`. `AppContext` watches `state.pendingAchievement` in a `useEffect` and briefly renders a themed toast component before clearing the field with a new `CLEAR_ACHIEVEMENT` action.

---

### 14. `localStorage` Persistence Has No Schema Version

- **Effort:** Small (< 1hr)
- **Type:** Enhancement / Refactor
- **Description:** The saved JSON has no version field. If the `Task` shape changes in the future (e.g., adding `dueAt` or `tags`), the `LOAD_STATE` action will load stale objects without the new fields and could cause runtime crashes or silent data loss.
- **Files affected:** `src/context/AppContext.tsx`, `src/utils/constants.ts`
- **Implementation hint:** Add a `SCHEMA_VERSION = 1` constant. When saving, write `{ version: SCHEMA_VERSION, tasks, allTimeDoneCount }`. When loading, check the version; if it is missing or older, run a migration function before dispatching `LOAD_STATE`. Migrations can be a simple array of `(saved) => migratedSaved` functions keyed by version number.

---

### 15. `TaskColumn` Re-filters and Re-sorts on Every Render

- **Effort:** Small (< 1hr)
- **Type:** Performance
- **Description:** `TaskColumn` calls `state.tasks.filter(...).sort(...)` on every render. Because all three columns share the same `state` reference, any task change anywhere causes all three columns to recompute their lists even if only one column's data changed.
- **Files affected:** `src/components/TaskBoard/TaskColumn.tsx`
- **Implementation hint:** Wrap the filter+sort in `useMemo([state.tasks, status])`. The sort comparator is pure and referentially stable so no extra memoisation is needed. This is low-risk and keeps the component lean as the task list grows.
