export enum TaskStatus {
  Backlog = 'backlog',
  InProgress = 'inProgress',
  Done = 'done',
}

export enum Priority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export interface Task {
  id: string
  title: string
  description?: string
  priority: Priority
  status: TaskStatus
  createdAt: number
  completedAt?: number
  dueAt?: number
}

export interface StreakState {
  currentStreak: number
  lastCompletionDate: string | null // YYYY-MM-DD
}

export interface ModalState {
  isOpen: boolean
  mode: 'add' | 'edit'
  editingTaskId?: string
  defaultStatus?: TaskStatus
}

export interface AppState {
  tasks: Task[]
  allTimeDoneCount: number
  modalState: ModalState
  past: Array<Pick<AppState, 'tasks' | 'allTimeDoneCount'>>
  searchQuery: string
  streak: StreakState
  pendingAchievement: string | null
  helpOpen: boolean
  locked: boolean
}

export type WarPhase =
  | 'neutral'
  | 'order_winning'
  | 'chaos_winning'
  | 'balanced'
  | 'order_victory'
  | 'chaos_victory'

export interface WarState {
  orderPercent: number
  chaosPercent: number
  totalTasks: number
  doneTasks: number
  activeTasks: number
  phase: WarPhase
}

export type AppAction =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt'> }
  | { type: 'EDIT_TASK'; payload: { id: string } & Partial<Omit<Task, 'id'>> }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'MOVE_TASK'; payload: { id: string; status: TaskStatus } }
  | { type: 'OPEN_MODAL'; payload: Omit<ModalState, 'isOpen'> }
  | { type: 'CLOSE_MODAL' }
  | { type: 'LOAD_STATE'; payload: Partial<Pick<AppState, 'tasks' | 'allTimeDoneCount' | 'streak'>> }
  | { type: 'UNDO' }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'CLEAR_ACHIEVEMENT' }
  | { type: 'TOGGLE_HELP' }
  | { type: 'TOGGLE_LOCK' }
