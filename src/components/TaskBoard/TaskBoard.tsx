import { COLUMN_CONFIG } from '../../utils/constants'
import TaskColumn from './TaskColumn'
import SearchBar from './SearchBar'

export default function TaskBoard() {
  return (
    <div>
      <SearchBar />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-5 pb-8">
        {COLUMN_CONFIG.map(col => (
          <TaskColumn
            key={col.status}
            status={col.status}
            label={col.label}
            subLabel={col.subLabel}
          />
        ))}
      </div>
    </div>
  )
}
