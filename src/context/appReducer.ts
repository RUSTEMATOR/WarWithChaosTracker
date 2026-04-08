import { type AppState, type AppAction, TaskStatus } from '../types'
import { generateId } from '../utils/taskHelpers'
import { ACHIEVEMENTS } from '../utils/constants'

const MAX_UNDO = 20

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

function updateStreak(state: AppState): AppState['streak'] {
  const today = todayString()
  const last = state.streak.lastCompletionDate

  if (last === today) {
    // Already completed something today — streak unchanged
    return state.streak
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  if (last === yesterdayStr) {
    return { currentStreak: state.streak.currentStreak + 1, lastCompletionDate: today }
  }

  // Streak broken (or first ever completion)
  return { currentStreak: 1, lastCompletionDate: today }
}

function checkAchievement(count: number): string | null {
  // Find the highest threshold that was just crossed
  for (let i = ACHIEVEMENTS.length - 1; i >= 0; i--) {
    if (count === ACHIEVEMENTS[i].threshold) return ACHIEVEMENTS[i].id
  }
  return null
}

function snapshot(state: AppState): Pick<AppState, 'tasks' | 'allTimeDoneCount'> {
  return { tasks: state.tasks, allTimeDoneCount: state.allTimeDoneCount }
}

export const initialState: AppState = {
  tasks: [],
  allTimeDoneCount: 0,
  modalState: { isOpen: false, mode: 'add' },
  past: [],
  searchQuery: '',
  streak: { currentStreak: 0, lastCompletionDate: null },
  pendingAchievement: null,
  helpOpen: false,
  locked: false,
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_TASK': {
      const now = Date.now()
      const isStartingDone = action.payload.status === TaskStatus.Done
      const newTask = {
        ...action.payload,
        id: generateId(),
        createdAt: now,
        completedAt: isStartingDone ? now : undefined,
      }
      const newCount = isStartingDone ? state.allTimeDoneCount + 1 : state.allTimeDoneCount
      return {
        ...state,
        past: [...state.past.slice(-MAX_UNDO), snapshot(state)],
        tasks: [...state.tasks, newTask],
        allTimeDoneCount: newCount,
        streak: isStartingDone ? updateStreak(state) : state.streak,
        pendingAchievement: isStartingDone ? checkAchievement(newCount) : state.pendingAchievement,
      }
    }

    case 'EDIT_TASK': {
      const { id, ...changes } = action.payload
      const existing = state.tasks.find(t => t.id === id)
      const wasNotDone = existing?.status !== TaskStatus.Done
      const isNowDone = changes.status === TaskStatus.Done
      const newCount = wasNotDone && isNowDone ? state.allTimeDoneCount + 1 : state.allTimeDoneCount
      return {
        ...state,
        past: [...state.past.slice(-MAX_UNDO), snapshot(state)],
        tasks: state.tasks.map(t =>
          t.id === id
            ? { ...t, ...changes, completedAt: isNowDone ? Date.now() : (changes.status ? undefined : t.completedAt) }
            : t
        ),
        allTimeDoneCount: newCount,
        streak: wasNotDone && isNowDone ? updateStreak(state) : state.streak,
        pendingAchievement: wasNotDone && isNowDone ? checkAchievement(newCount) : state.pendingAchievement,
      }
    }

    case 'DELETE_TASK': {
      return {
        ...state,
        past: [...state.past.slice(-MAX_UNDO), snapshot(state)],
        tasks: state.tasks.filter(t => t.id !== action.payload.id),
      }
    }

    case 'MOVE_TASK': {
      const { id, status } = action.payload
      const task = state.tasks.find(t => t.id === id)
      if (!task) return state

      const wasNotDone = task.status !== TaskStatus.Done
      const isNowDone = status === TaskStatus.Done
      const newCount = wasNotDone && isNowDone ? state.allTimeDoneCount + 1 : state.allTimeDoneCount

      return {
        ...state,
        past: [...state.past.slice(-MAX_UNDO), snapshot(state)],
        tasks: state.tasks.map(t =>
          t.id === id
            ? { ...t, status, completedAt: isNowDone ? Date.now() : undefined }
            : t
        ),
        allTimeDoneCount: newCount,
        streak: wasNotDone && isNowDone ? updateStreak(state) : state.streak,
        pendingAchievement: wasNotDone && isNowDone ? checkAchievement(newCount) : state.pendingAchievement,
      }
    }

    case 'OPEN_MODAL': {
      return { ...state, modalState: { isOpen: true, ...action.payload } }
    }

    case 'CLOSE_MODAL': {
      return { ...state, modalState: { isOpen: false, mode: 'add' } }
    }

    case 'LOAD_STATE': {
      return {
        ...state,
        tasks: action.payload.tasks ?? state.tasks,
        allTimeDoneCount: action.payload.allTimeDoneCount ?? state.allTimeDoneCount,
        streak: action.payload.streak ?? state.streak,
      }
    }

    case 'UNDO': {
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      return {
        ...state,
        tasks: previous.tasks,
        allTimeDoneCount: previous.allTimeDoneCount,
        past: state.past.slice(0, -1),
      }
    }

    case 'SET_SEARCH': {
      return { ...state, searchQuery: action.payload }
    }

    case 'CLEAR_ACHIEVEMENT': {
      return { ...state, pendingAchievement: null }
    }

    case 'TOGGLE_HELP': {
      return { ...state, helpOpen: !state.helpOpen }
    }

    case 'TOGGLE_LOCK': {
      return { ...state, locked: !state.locked }
    }

    default:
      return state
  }
}
