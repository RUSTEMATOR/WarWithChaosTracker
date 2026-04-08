# War With Chaos — UI/UX Design Enhancement Proposals

_Analyzed against codebase snapshot, April 2026._

---

## Overview

The foundation is strong: a dark parchment palette, Cinzel for headers, a living war bar with particles and glow effects, and animated stat counters. The theming is coherent. The proposals below address the gaps between "functional and themed" and "polished and immersive."

---

### 1. Header Has No Visual Weight or Frame

- **Priority:** High
- **Category:** Visual / Theme
- **Current state:** `App.tsx` renders a plain `<header>` with `py-6 px-4` and centered text. There is no border, background, or ornamental framing. The title floats against the raw body gradient with no container.
- **Proposed change:** Wrap the header in a panel with a subtle top border using `border-t-2 border-order-gold/60`, add a very faint `bg-parchment-light/30` fill, and place a CSS ornamental rule (reusing `.ornament-divider` or a new `::before`/`::after` pseudo-element) both above and below the subtitle. Optionally add a pair of symmetrical Unicode rune-style characters (`✦` or `⚜`) flanking the `h1` text.
- **Warhammer flavor note:** Warhammer army books always frame chapter headers inside ruled boxes with flourishes at the corners. The header is the "book cover" of the app — it should announce itself.

---

### 2. WarBar Height Is Too Thin for Its Importance

- **Priority:** High
- **Category:** Visual / Theme
- **Current state:** `WarBar.tsx` sets `h-8` (32 px) on the bar container. For the central mechanic of the entire app, this is understated. The sword icon at `-top-7` clips outside the bar's parent `px-4 py-6` container on small screens.
- **Proposed change:** Increase bar height to `h-12` (48 px) or `h-14` (56 px). This gives the particle system and front-line glow more vertical room to breathe and makes the bar feel like a genuine battlefield panorama rather than a progress indicator. Update `FrontLine.tsx` icon offset from `-top-7` to something proportional (e.g. `-top-8`). Add `overflow-visible` or adjust the outer wrapper to avoid clipping the floating sword icon.
- **Warhammer flavor note:** Campaign maps in Warhammer Fantasy always show territorial control as a wide painted band. A taller bar reads as territory, not as a loading spinner.

---

### 3. TaskCard Action Buttons Are Too Small and Ambiguous

- **Priority:** High
- **Category:** UX
- **Current state:** `TaskCard.tsx` uses `text-xs p-1` Unicode characters (`◀`, `▶`, `✎`, `✕`) as interactive buttons. At 10–12 px these are difficult to tap on mobile and the symbols carry no semantic label visible at a glance. The advance button `▶` and the edit button `✎` are visually similar in weight.
- **Proposed change:** Increase touch targets to at least 28×28 px by replacing `p-1` with `p-1.5` and `text-xs` with `text-sm` for the icons. Differentiate the advance button visually from the delete button more strongly — the delete `✕` should remain small and red/muted while the advance `▶` should be the most prominent action, perhaps with a `ring-1 ring-order-gold/20` on hover. Consider adding a `title` tooltip delay or a visible micro-label (e.g. a `sr-only` span complemented by a visible one on wider screens).
- **Warhammer flavor note:** Orders issued on the battlefield must be unambiguous. A general who accidentally retreats a unit has lost the day.

---

### 4. TaskColumn Columns Lack Visual Differentiation Between States

- **Priority:** High
- **Category:** Visual / Theme
- **Current state:** `TaskColumn.tsx` uses `columnAccent` — `border-chaos-red/30` for backlog, `border-order-gold/30` for in-progress, `border-order-gold/50` for done. All three columns share the same `bg-parchment/40` background. The only differentiation is a thin left-side border color and a header text color.
- **Proposed change:** Give each column a distinct but subtle background tint via inline style or a new CSS class: Backlog gets a faint `rgba(139, 0, 0, 0.05)` overlay (threat territory), In Progress gets `rgba(201, 168, 76, 0.04)` (contested ground), Done gets `rgba(139, 105, 20, 0.08)` (liberated land). Additionally apply a 2 px left accent strip (e.g. `border-l-2` replacing the uniform `border`) so the color identity is unambiguous even in peripheral vision.
- **Warhammer flavor note:** Old Warhammer campaign maps used colored regions to denote faction control. Each column is a zone of the war — it should feel that way.

---

### 5. No Entry Animation on Task Cards

- **Priority:** Medium
- **Category:** Animation
- **Current state:** When a task is added or moved, `TaskCard` simply appears or disappears with no transition. The existing `animate-fade-in` keyframe in `tailwind.config.js` (`fade-in: from opacity 0 + translateY 4px`) exists but is only used in `Modal.tsx`.
- **Proposed change:** Apply `animate-fade-in` to the `TaskCard` root `<div>` so every card entrance is accompanied by the existing subtle slide-up. For task deletion, use a CSS `max-height` collapse transition — add a `.task-card-exit` class in `index.css` that animates `max-height: 0; opacity: 0; padding: 0; margin: 0` over ~200 ms (requires React state management for the exit phase, or a library like `react-spring`). This makes adds/moves feel deliberate rather than abrupt.
- **Warhammer flavor note:** Troops march onto the field; they don't teleport. The card entering with motion reinforces that an order has been dispatched.

---

### 6. StatsPanel Phase Label Is Visually Buried

- **Priority:** Medium
- **Category:** Visual / Hierarchy
- **Current state:** `StatsPanel.tsx` renders the phase label (`— Empire Advances —`) as `text-xs tracking-widest uppercase text-order-gold/70` centered above the stat counters. At 70% opacity and `text-xs` it competes poorly with the `text-2xl font-black` StatCounter numbers directly below it.
- **Proposed change:** Elevate the phase label to `text-sm` and full `text-order-gold` opacity (remove `/70`). Add a subtle `px-3 py-0.5 rounded border border-order-gold/20 bg-order-dark/10 inline-block` pill treatment so it reads as a status badge rather than a caption. When phase is `chaos_winning` or `chaos_victory`, swap the color to `text-chaos-red` with `border-chaos-red/20 bg-chaos-dark/10`. This creates a live threat indicator that demands attention.
- **Warhammer flavor note:** The campaign situation report belongs at the top of a general's briefing, not as a whispered footnote.

---

### 7. Divider Component Lacks Ornamental Symbols

- **Priority:** Medium
- **Category:** Theme
- **Current state:** `Divider.tsx` uses the `.ornament-divider` CSS class which draws gradient lines on either side of a text label via `::before`/`::after` pseudo-elements. The divider line color is `var(--order-dark)` — a fairly muted brown. There is no iconography on the line itself.
- **Proposed change:** In `index.css`, change the `.ornament-divider::before` and `::after` gradient to terminate at `var(--order-gold)` at the center point (i.e. `linear-gradient(90deg, transparent, var(--order-gold), transparent)`), making the line brighter. For labeled dividers, insert a `✦` or `⚜` character as a `::before` on the `<span>` text in `Divider.tsx` so the label reads `✦ The Front Line ✦` without modifying calling code. This single change dramatically improves thematic fidelity.
- **Warhammer flavor note:** Section breaks in Warhammer rulebooks always use paired dingbats or wax-seal motifs. The divider is the app's equivalent of a chapter heading rule.

---

### 8. TaskForm Priority Selector Has No Thematic Labels

- **Priority:** Medium
- **Category:** Theme / UX
- **Current state:** `TaskForm.tsx` renders the three priority buttons with plain capitalized text: `Low`, `Medium`, `High`. While functional, these labels are generic. The buttons are `flex-1` and uniform in size with no iconographic hint.
- **Proposed change:** Replace the display text with thematic equivalents: `Low` → `Skirmish`, `Medium` → `Campaign`, `High` → `Crusade`. Prefix each with a small inline icon: a single sword (`⚔`), two swords, or a shield/skull respectively. Keep the original `Priority` enum values untouched — this is a pure display change. The currently-selected button already highlights correctly; the new labels make the severity feel like a strategic decision rather than a project management field.
- **Warhammer flavor note:** In Warhammer, the scale of war ranges from border skirmishes to Chaos invasions. Priority deserves the same gradient of escalation.

---

### 9. Modal Backdrop Has No Entry Transition

- **Priority:** Medium
- **Category:** Animation / UX
- **Current state:** `Modal.tsx` renders via a conditional `if (!isOpen) return null`, meaning the backdrop and panel appear instantly. The panel itself gets `animate-fade-in`, but the dark overlay (`rgba(10, 8, 5, 0.85)`) snaps in with no fade, creating a jarring flash of darkness on open and an abrupt disappearance on close.
- **Proposed change:** Add `animate-fade-in` to the outer backdrop `<div>` as well. For close, introduce a brief exit animation — either via a CSS class toggled before `return null`, or by delaying the `isOpen` → false state by 200 ms while an `animate-fade-out` class plays. Define `fade-out` in `tailwind.config.js` keyframes as the reverse of `fade-in`. This makes the modal feel like a parchment scroll unfurling rather than a window slamming open.
- **Warhammer flavor note:** A general's orders scroll is presented with ceremony, not thrown at the table.

---

### 10. No Visual Confirmation When a Task Is Completed (Done State)

- **Priority:** Medium
- **Category:** Animation / UX
- **Current state:** When the advance button `▶` is pressed on an In Progress task and it moves to Done, the card crosses out text and dims opacity (`opacity-80`, `line-through text-ink-dim`, `border-order-gold/20 bg-order-dark/10`). There is no momentary feedback — no flash, sound cue equivalent, or brief highlight — to acknowledge the victory.
- **Proposed change:** When `isDone` becomes true (detectable via a `useEffect` watching `task.status`), briefly apply a CSS class like `.task-card-victory` that fires a one-shot animation: a 600 ms `box-shadow` pulse from `0` to `0 0 20px 4px rgba(201, 168, 76, 0.5)` and back. Add this keyframe as `victory-pulse` in `tailwind.config.js` / `index.css` alongside the existing `victory-glow`. This single interaction moment makes completing a task feel rewarding.
- **Warhammer flavor note:** Routing the enemy deserves a fanfare — even a brief golden flash is worth a hundred lines of flavor text.

---

### 11. WarBar Percentage Labels Are Redundant With the Bar Itself

- **Priority:** Low
- **Category:** Visual / Hierarchy
- **Current state:** `WarBar.tsx` renders `{Math.round(war.orderPercent)}% order` and `{Math.round(war.chaosPercent)}% chaos` below the bar at `text-xs opacity-70`. These are purely numeric duplicates of what the visual bar already communicates, and they appear below a bar that already has labels above it. The layout feels over-explained.
- **Proposed change:** Remove the percentage labels below the bar entirely, or fold them into the existing label row above the bar (e.g. `⚔ Empire — 62 victories (74%)` on the left). Alternatively, render the percentage as a tooltip on the bar itself on hover. Eliminating the redundant row tightens the WarBar section and gives breathing room to the StatsPanel below.
- **Warhammer flavor note:** A battle map shows lines, not spreadsheets. Trust the visual.

---

### 12. TaskColumn "Add" Button Lacks Visual Hierarchy

- **Priority:** Low
- **Category:** UX / Visual
- **Current state:** `TaskColumn.tsx` renders a `Button variant="ghost" size="sm"` with the label `+ Issue Orders` pinned to the column footer. The ghost variant uses `text-ink-dim` with `border-ink-dim/20`, making it the lowest-contrast element in the column. It is easy to miss, especially when the column is tall with many cards.
- **Proposed change:** Elevate the "Issue Orders" button in the Backlog and In Progress columns to `variant="order"` (`bg-order-dark hover:bg-order-gold text-ink border-order-gold/50`). The Done column should keep a ghost or even remove the button entirely (since completing tasks is the goal, not adding more to Done directly). This creates a clear visual call-to-action at the bottom of actionable columns without being garish.
- **Warhammer flavor note:** Orders issued to the front must be visible. A commander who cannot find the dispatch box has already lost the initiative.

---

### 13. No Global Background Texture — The Parchment Feels Flat

- **Priority:** Low
- **Category:** Visual / Theme
- **Current state:** `index.css` defines `background-image` on `body` as three radial gradients (chaos red, chaos purple, and a faint gold center glow). These provide atmospheric color bleed but no surface texture. The `#2A2118` base reads as a flat dark brown.
- **Proposed change:** Add a subtle SVG noise filter or a CSS `background-image: url("data:image/svg+xml,...")` micro-pattern (a very low-opacity crosshatch at ~3–5% opacity) layered on top of the existing gradients. Alternatively, use a `repeating-linear-gradient` with 1 px transparent gaps to simulate aged parchment grain without any external asset. This costs zero bytes of network payload and transforms the feel from "dark app" to "aged manuscript."
- **Warhammer flavor note:** Warhammer rulebooks are printed on textured paper. The app's background should feel like you are reading dispatches from the front, not a dashboard.

---

### 14. No Responsive Stacking Strategy for WarBar Labels on Narrow Screens

- **Priority:** Low
- **Category:** Responsive
- **Current state:** `WarBar.tsx` uses `flex justify-between` for the Empire/Chaos label row. On screens narrower than ~320 px the `"⚔ Empire — 12 victories"` and `"3 threats — Chaos ✦"` labels can wrap awkwardly or crowd each other. The percentage indicators below the bar have the same problem.
- **Proposed change:** Wrap each label group in a `min-w-0` container and add `truncate` to the victory/threat count spans so they degrade gracefully. On very small screens (`xs` / below `sm`), consider stacking the label row to two lines using `flex-col items-start` for Empire and `flex-col items-end` for Chaos via a `flex-wrap` approach or a `@media` rule in `index.css`. This prevents layout breakage on the smallest mobile viewports.
- **Warhammer flavor note:** Battle dispatches must be legible even in poor light and on torn parchment.

---

_End of design proposals. Total: 14 enhancements across Visual, UX, Animation, Theme, and Responsive categories._
