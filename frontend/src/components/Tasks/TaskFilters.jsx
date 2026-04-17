const TaskFilters = ({ filters, onChange }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '0.75rem',
      alignItems: 'center',
      padding: '1rem 1.25rem',
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '0.75rem',
      marginBottom: '1.25rem',
    }}>
      {/* Status filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '140px' }}>
        <label className="label" htmlFor="filter-status">Status</label>
        <select
          id="filter-status"
          className="input"
          style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
          value={filters.status || ''}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
      </div>

      {/* Priority filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '140px' }}>
        <label className="label" htmlFor="filter-priority">Priority</label>
        <select
          id="filter-priority"
          className="input"
          style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
          value={filters.priority || ''}
          onChange={(e) => handleChange('priority', e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      {/* Due Before */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '150px' }}>
        <label className="label" htmlFor="filter-due-before">Due Before</label>
        <input
          id="filter-due-before"
          type="date"
          className="input"
          style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', colorScheme: 'dark' }}
          value={filters.dueBefore || ''}
          onChange={(e) => handleChange('dueBefore', e.target.value)}
        />
      </div>

      {/* Due After */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '150px' }}>
        <label className="label" htmlFor="filter-due-after">Due After</label>
        <input
          id="filter-due-after"
          type="date"
          className="input"
          style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', colorScheme: 'dark' }}
          value={filters.dueAfter || ''}
          onChange={(e) => handleChange('dueAfter', e.target.value)}
        />
      </div>

      {/* Sort */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '150px' }}>
        <label className="label" htmlFor="filter-sort">Sort By</label>
        <select
          id="filter-sort"
          className="input"
          style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
          value={`${filters.sortBy || 'createdAt'}_${filters.order || 'desc'}`}
          onChange={(e) => {
            const [sortBy, order] = e.target.value.split('_');
            onChange({ ...filters, sortBy, order, page: 1 });
          }}
        >
          <option value="createdAt_desc">Newest First</option>
          <option value="createdAt_asc">Oldest First</option>
          <option value="dueDate_asc">Due Date ↑</option>
          <option value="dueDate_desc">Due Date ↓</option>
          <option value="priority_desc">Priority ↓</option>
          <option value="priority_asc">Priority ↑</option>
        </select>
      </div>

      {/* Reset */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingTop: '1.25rem' }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onChange({ page: 1, limit: 9 })}
        >
          ✕ Reset
        </button>
      </div>
    </div>
  );
};

export default TaskFilters;
