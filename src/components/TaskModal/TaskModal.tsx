import { useAppContext } from '../../context/AppContext'
import { TaskStatus } from '../../types'
import Modal from '../shared/Modal'
import TaskForm from './TaskForm'

export default function TaskModal() {
  const { state, dispatch } = useAppContext()
  const { modalState } = state

  function close() {
    dispatch({ type: 'CLOSE_MODAL' })
  }

  const editingTask = modalState.editingTaskId
    ? state.tasks.find(t => t.id === modalState.editingTaskId)
    : undefined

  const title = modalState.mode === 'edit' ? 'Edit Order' : 'Issue New Orders'

  return (
    <Modal isOpen={modalState.isOpen} onClose={close} title={title}>
      <TaskForm
        initialValues={
          editingTask
            ? {
                title: editingTask.title,
                description: editingTask.description,
                priority: editingTask.priority,
                status: editingTask.status,
                dueAt: editingTask.dueAt,
              }
            : { status: modalState.defaultStatus ?? TaskStatus.Backlog }
        }
        onSubmit={values => {
          if (modalState.mode === 'edit' && editingTask) {
            dispatch({ type: 'EDIT_TASK', payload: { id: editingTask.id, ...values } })
          } else {
            dispatch({ type: 'ADD_TASK', payload: values })
          }
          close()
        }}
        onCancel={close}
        submitLabel={modalState.mode === 'edit' ? 'Update Orders' : 'Deploy Forces'}
      />
    </Modal>
  )
}
