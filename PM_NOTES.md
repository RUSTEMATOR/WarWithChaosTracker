# War With Chaos — PM Audit & Feature Backlog

**Audit Date:** 2026-04-06  
**Auditor:** Project Manager Agent  
**Codebase snapshot:** React + Vite, localStorage persistence, 3-column kanban, War Bar mechanic

---

## 1. Usability Gaps

These are friction points a daily user would hit within the first week.

### Task Management
- **No due dates.** The single biggest omission for a real task tracker. There is no `dueDate` field on the `Task` type, no urgency signal, and no way to know what is overdue. The War Bar penalizes the backlog but not lateness.
- **No sorting or filtering.** Tasks in each column are sorted only by `createdAt` (newest first). There is no way to surface high-priority tasks, filter by priority, or re-order manually. A column with 20 tasks becomes an unsorted wall.
- **No drag-and-drop.** Moving a task between columns requires clicking the advance/retreat buttons one step at a time (Backlog → In Progress → Done). Skipping directly from Backlog to Done requires two separate clicks and a round-trip through In Progress. There is no drag handle.
- **Status is not editable in the form.** `TaskForm.tsx` reads `const [status] = useState(...)` — the status dropdown is intentionally read-only. A user cannot change a task's column while editing it; they must use the advance/retreat buttons exclusively.
- **No bulk actions.** Archiving all Done tasks, deleting completed items, or mass-prioritising a batch of backlog items all require individual interactions.
- **No keyboard shortcuts.** Power users expect `n` to open a new task, `Escape` to close a modal, `Enter` to submit. None are present.
- **Empty state is underdirected.** When all columns are empty the app shows generic italic placeholder text. New users get no clear call-to-action explaining what the War Bar is or how to start.
- **No undo / confirmation on delete.** Tasks are deleted permanently with no toast, snackbar, or undo window. Misclicks are unrecoverable.

### Stats Panel
- **"All-Time" counter but no history.** `allTimeDoneCount` increments but there is no way to inspect when those tasks were completed or what they were. The number is a dead end.
- **Flavor text is seed-stable but not time-varied.** The seed is `tasks.length`, so flavor text only changes when the task count changes. Opening the app on consecutive days with the same task list shows identical copy every time.

---

## 2. Missing Core Features

Things every task tracker needs that are absent here.

| Feature | Why It Matters |
|---|---|
| **Due dates + overdue indicators** | Without deadlines, tasks sit in Backlog forever. The War Bar should react to overdue tasks. |
| **Task tags / labels** | Grouping tasks by project, area of life, or work context is essential for real-world use. |
| **Search** | Any board with more than ~15 tasks needs a search bar. |
| **Task notes / subtasks** | The description field is a plain `<textarea>`. Long tasks need checklists or at minimum a richer notes area. |
| **Recurrence** | Daily/weekly recurring tasks (stand-ups, reviews) have no representation. |
| **Data export / import** | State is only in `localStorage`. Clearing the browser wipes everything. No backup. |
| **Multiple boards / campaigns** | One flat task list conflates work, personal, and side-project tasks. |
| **Mobile layout** | Three side-by-side columns collapse poorly on small screens. No responsive column stacking is visible in the current code. |

---

## 3. Engagement Features

What would make a user open this app every morning instead of a plain Trello board.

### Streaks & Daily Ritual
- **Daily kill streak.** Track how many tasks were completed on the current calendar day. Display it as "Daemonslayer Streak: 3 kills today." Reset at midnight.
- **Consecutive-day streak.** If the user completes at least one task each day, their "Campaign Streak" grows. Breaking it resets it. This is the single most powerful retention mechanic (see Duolingo, GitHub contribution graph).
- **Morning briefing.** When the user opens the app for the first time each day, show a modal with yesterday's completed tasks, the current War Phase, and today's high-priority tasks — framed as a military morning briefing.

### Achievements / Titles
- Milestone achievements tied to `allTimeDoneCount`: "Recruit" (1), "Soldier of the Empire" (10), "Knight of the Realm" (25), "Champion of Sigmar" (50), "Ghal Maraz Bearer" (100).
- Special titles for streaks: "Veteran of Seven Campaigns" (7-day streak).
- Achievements surface as toast notifications with Warhammer-flavored copy.

### History & Replay
- **Completed task log.** A scrollable journal of every completed task with its `completedAt` timestamp, priority, and how long it spent in each column. Framed as a "Campaign Chronicle."
- **War Bar history graph.** A sparkline showing how the order/chaos ratio has moved over the past 30 days — your campaign map over time.
- **"This week in the war" summary.** Weekly digest shown on Monday showing tasks completed last week.

### Micro-rewards
- Particle/confetti burst when a task moves to Done (especially high-priority ones).
- Animated hammer strike on the War Bar when order crosses 50%.
- Sound toggle: optional Warhammer-inspired sound effects (anvil strike for Done, distant horn for a new task).

---

## 4. Warhammer Lore Depth

Features that would make this feel like a genuine campaign log rather than a re-skinned Trello.

### Thematic Enrichment
- **Faction assignment per task.** Tag tasks with a lore faction: Empire, Dwarfs, High Elves, Skaven, Chaos Warriors, Beastmen. Each faction gets its own icon and color accent. The mix of factions in your board tells a story.
- **Named generals / commanders.** The user can set a character name (e.g. "Ludwig Schwarzhelm") that appears in flavor text and achievement notifications as a personalised narrative: "Ludwig has driven back the tide — 50 daemons banished."
- **Chaos corruption meter per column.** The Backlog column could visually "corrupt" — the border turns more intensely red, grunge textures increase, and the subLabel text shifts from "Chaos stirs here" to escalating Chaos-god quotes as the backlog grows.
- **Campaign map integration.** A simple SVG of the Old World where provinces light up as tasks are completed — completing 5 tasks "liberates" Averheim, completing 10 "reinforces" Altdorf, etc.
- **Chaos god alignment.** Tasks that stay in Backlog too long get "claimed" by a Chaos god. Tzeentch (scheming, unstarted plans), Nurgle (rotting neglect), Khorne (overdue blockers), Slaanesh (low-priority distractions). Each adds a unique icon and flavor text.
- **Scenario / event cards.** Random daily events drawn from a deck: "The Skaven undermine your walls — one random task is moved back to Backlog" or "A comet of Sigmar — all In Progress tasks gain +1 urgency." These are opt-in and purely cosmetic/flavor but make the board feel alive.
- **Victory condition campaigns.** Define a "Campaign" with a name, a target (e.g. "Complete 20 tasks before month-end"), and an end date. Completing it triggers a full-screen victory sequence with the Empire banner and Sigmar quote.

### Copy & Voice
- Expand `FLAVOR_TEXTS` from the current ~3-4 strings per phase to 10-15 strings per phase to reduce repetition.
- Phase-specific flavor text for the Stats Panel counters themselves: instead of just numbers, add sub-labels like "Souls lost to the tide" (backlog) and "Warriors returned home" (done).
- Warhammer-flavored error states: a 404-style empty state reading "The scouts returned empty-handed" rather than generic "No tasks."

---

## 5. Feature Backlog — Prioritised

### P0 — Must Have (daily use is broken without these)

1. **Due dates on tasks** — add `dueDate` to Task type, date picker in TaskForm, overdue highlighting on TaskCard, War Bar penalty for overdue tasks.
2. **Drag-and-drop column reordering** — replace advance/retreat-only movement with draggable cards across columns.
3. **Status field editable in TaskForm** — unlock the read-only `status` state so users can move tasks while editing.
4. **Delete confirmation / undo toast** — prevent accidental permanent deletion.
5. **Filter and sort within columns** — filter by priority, sort by due date / priority / created date.

### P1 — High Value (meaningfully improves retention)

6. **Daily task streak tracker** — consecutive-day completion streak with Warhammer title milestones.
7. **Completed task history log (Campaign Chronicle)** — scrollable journal of done tasks with timestamps.
8. **Keyboard shortcuts** — `n` for new task, `Escape` to close, arrow keys to navigate cards.
9. **Data export to JSON** — one-click backup to prevent localStorage data loss.
10. **Search bar** — filter all tasks by keyword across all columns.
11. **Bulk actions** — archive all Done tasks, delete completed, reprioritise selected.

### P2 — Engagement & Lore (makes the theme sing)

12. **Achievement system** — milestone titles for `allTimeDoneCount` with toast notifications.
13. **Chaos corruption visual escalation** — Backlog column border/texture intensifies as backlog grows.
14. **Named commander / character name setting** — personalises flavor text and notifications.
15. **Chaos god affiliation for neglected tasks** — tasks idle in Backlog too long gain a Chaos mark icon.
16. **Morning briefing modal** — daily first-open summary framed as a military briefing.
17. **Expanded flavor text pool** — 10-15 strings per phase instead of 3-4.
18. **Task tags / labels** — freeform or preset tags for grouping tasks.

### P3 — Nice to Have

19. **Campaign system** — named campaigns with a target task count and end date.
20. **War Bar history sparkline** — 30-day order/chaos ratio graph.
21. **Multiple boards** — separate campaigns/areas of life.
22. **Recurrence support** — daily/weekly recurring tasks.
23. **Sound toggle** — optional Warhammer-inspired audio feedback.
24. **Mobile responsive layout** — vertical column stacking on small screens.

---

## SEED_TASKS

```json
[
  {
    "id": "seed-001",
    "title": "Deploy Task Due Dates to the Front Line",
    "description": "Add a dueDate field to the Task type, a date picker in TaskForm, and overdue highlighting on TaskCard so deadlines are visible at a glance.",
    "priority": "high",
    "status": "backlog",
    "createdAt": 1743897600000
  },
  {
    "id": "seed-002",
    "title": "Forge the Drag-and-Drop Battle Order",
    "description": "Implement drag-and-drop across all three columns so tasks can be moved without relying solely on the advance/retreat buttons.",
    "priority": "high",
    "status": "backlog",
    "createdAt": 1743897700000
  },
  {
    "id": "seed-003",
    "title": "Unlock the Status Rune in Task Form",
    "description": "Remove the read-only lock on the status field in TaskForm so users can change a task's column while editing it.",
    "priority": "high",
    "status": "backlog",
    "createdAt": 1743897800000
  },
  {
    "id": "seed-004",
    "title": "Raise the Shield of Undo — Deletion Protection",
    "description": "Add a confirmation dialog and a brief undo toast when a task is deleted to prevent accidental permanent loss.",
    "priority": "high",
    "status": "backlog",
    "createdAt": 1743897900000
  },
  {
    "id": "seed-005",
    "title": "Rally the Troops by Priority — Column Sorting",
    "description": "Add sort and filter controls to each column so tasks can be ordered by priority, due date, or creation time.",
    "priority": "high",
    "status": "backlog",
    "createdAt": 1743898000000
  },
  {
    "id": "seed-006",
    "title": "Chronicle the Fallen — Completed Task History",
    "description": "Build a Campaign Chronicle panel showing a scrollable log of all completed tasks with their completedAt timestamps and priority.",
    "priority": "high",
    "status": "backlog",
    "createdAt": 1743898100000
  },
  {
    "id": "seed-007",
    "title": "Count the Consecutive Campaigns — Streak Tracker",
    "description": "Implement a consecutive-day task completion streak with Warhammer title milestones displayed in the StatsPanel.",
    "priority": "high",
    "status": "backlog",
    "createdAt": 1743898200000
  },
  {
    "id": "seed-008",
    "title": "Issue Scrolls of Export — JSON Data Backup",
    "description": "Add a one-click export button that downloads the current app state as a JSON file to protect against localStorage loss.",
    "priority": "high",
    "status": "backlog",
    "createdAt": 1743898300000
  },
  {
    "id": "seed-009",
    "title": "Send the Outriders — Keyword Search",
    "description": "Add a search bar above the task board that filters all tasks across all columns by keyword in real time.",
    "priority": "medium",
    "status": "backlog",
    "createdAt": 1743898400000
  },
  {
    "id": "seed-010",
    "title": "Bind the Rune of Swift Command — Keyboard Shortcuts",
    "description": "Implement keyboard shortcuts: N for new task, Escape to close modals, and arrow keys to navigate between task cards.",
    "priority": "medium",
    "status": "backlog",
    "createdAt": 1743898500000
  },
  {
    "id": "seed-011",
    "title": "Award the Medals of Sigmar — Achievement System",
    "description": "Create milestone achievements tied to allTimeDoneCount that display as toast notifications with Warhammer-flavored titles.",
    "priority": "medium",
    "status": "backlog",
    "createdAt": 1743898600000
  },
  {
    "id": "seed-012",
    "title": "Let Chaos Corrupt the Backlog Column",
    "description": "Visually intensify the Backlog column border color, texture, and subLabel text as the backlog task count grows to reflect mounting Chaos pressure.",
    "priority": "medium",
    "status": "backlog",
    "createdAt": 1743898700000
  },
  {
    "id": "seed-013",
    "title": "Name Thy General — Commander Identity Setting",
    "description": "Add a settings panel where the user enters a character name that is woven into flavor text, achievement notifications, and the Stats Panel.",
    "priority": "medium",
    "status": "backlog",
    "createdAt": 1743898800000
  },
  {
    "id": "seed-014",
    "title": "Mark the Neglected with the Eye of Chaos",
    "description": "Tasks that remain in Backlog beyond a configurable number of days receive an icon indicating which Chaos god has claimed them.",
    "priority": "medium",
    "status": "backlog",
    "createdAt": 1743898900000
  },
  {
    "id": "seed-015",
    "title": "Sound the Morning Horn — Daily Briefing Modal",
    "description": "Show a first-open-of-the-day modal styled as a military briefing with yesterday's completed tasks and today's high-priority items.",
    "priority": "medium",
    "status": "backlog",
    "createdAt": 1743899000000
  },
  {
    "id": "seed-016",
    "title": "Fill the Grimoire — Expand Flavor Text Pool",
    "description": "Expand each war phase in FLAVOR_TEXTS from 3-4 strings to 10-15 unique strings to eliminate repetition for daily users.",
    "priority": "medium",
    "status": "backlog",
    "createdAt": 1743899100000
  },
  {
    "id": "seed-017",
    "title": "Brand the Legions — Task Tags and Labels",
    "description": "Add freeform or preset tag support to tasks so they can be grouped by project, area of life, or campaign.",
    "priority": "medium",
    "status": "backlog",
    "createdAt": 1743899200000
  },
  {
    "id": "seed-018",
    "title": "Declare a Named Campaign — Victory Condition System",
    "description": "Let users define a named campaign with a task-completion target and an end date; completing it triggers a full-screen victory sequence.",
    "priority": "low",
    "status": "backlog",
    "createdAt": 1743899300000
  },
  {
    "id": "seed-019",
    "title": "Draw the War Map — Bar History Sparkline",
    "description": "Add a 30-day sparkline beneath the War Bar showing how the order/chaos ratio has shifted over time.",
    "priority": "low",
    "status": "backlog",
    "createdAt": 1743899400000
  },
  {
    "id": "seed-020",
    "title": "March to Mobile — Responsive Column Layout",
    "description": "Implement a responsive layout that stacks the three task columns vertically on small screens for usable mobile access.",
    "priority": "low",
    "status": "backlog",
    "createdAt": 1743899500000
  }
]
```
