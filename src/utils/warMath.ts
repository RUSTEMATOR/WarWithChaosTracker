import { type Task, TaskStatus, type WarState, type WarPhase, Priority } from '../types'
import { CHAOS_GOD_MARKS } from './constants'

export function computeWarState(tasks: Task[]): WarState {
  const total = tasks.length

  if (total === 0) {
    return {
      orderPercent: 50,
      chaosPercent: 50,
      totalTasks: 0,
      doneTasks: 0,
      activeTasks: 0,
      phase: 'neutral',
    }
  }

  const done = tasks.filter(t => t.status === TaskStatus.Done).length
  const active = total - done

  const orderPercent = (done / total) * 100
  const chaosPercent = (active / total) * 100

  let phase: WarPhase
  if (done === total) phase = 'order_victory'
  else if (done === 0) phase = 'chaos_victory'
  else if (orderPercent > 60) phase = 'order_winning'
  else if (chaosPercent > 60) phase = 'chaos_winning'
  else phase = 'balanced'

  return { orderPercent, chaosPercent, totalTasks: total, doneTasks: done, activeTasks: active, phase }
}

export type CorruptionLevel = 0 | 1 | 2 | 3

export function computeCorruption(task: Task, now: number): CorruptionLevel {
  if (task.status !== TaskStatus.Backlog) return 0

  const ageDays = (now - task.createdAt) / (1000 * 60 * 60 * 24)

  // High priority ages faster (multiplier 1.5)
  const effectiveAge = task.priority === Priority.High ? ageDays * 1.5
    : task.priority === Priority.Medium ? ageDays * 1.0
    : ageDays * 0.7

  if (effectiveAge >= 7)  return 3
  if (effectiveAge >= 3)  return 2
  if (effectiveAge >= 1)  return 1
  return 0
}

export function getChaosGodMark(task: Task, now: number) {
  if (task.status !== TaskStatus.Backlog) return null
  const ageDays = (now - task.createdAt) / (1000 * 60 * 60 * 24)
  // Walk from most severe to least
  for (let i = CHAOS_GOD_MARKS.length - 1; i >= 0; i--) {
    if (ageDays >= CHAOS_GOD_MARKS[i].days) return CHAOS_GOD_MARKS[i]
  }
  return null
}
