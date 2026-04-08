import { TaskStatus } from '../types'

export function generateId(): string {
  return crypto.randomUUID()
}

export function nextStatus(status: TaskStatus): TaskStatus {
  if (status === TaskStatus.Backlog) return TaskStatus.InProgress
  if (status === TaskStatus.InProgress) return TaskStatus.Done
  return TaskStatus.Done
}

export function prevStatus(status: TaskStatus): TaskStatus {
  if (status === TaskStatus.Done) return TaskStatus.InProgress
  if (status === TaskStatus.InProgress) return TaskStatus.Backlog
  return TaskStatus.Backlog
}

export function canAdvance(status: TaskStatus): boolean {
  return status !== TaskStatus.Done
}

export function canRetreat(status: TaskStatus): boolean {
  return status !== TaskStatus.Backlog
}
