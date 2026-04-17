const TaskFilters = ({ filters, onChange }) => {
  const handleChange = (key, value) => onChange({ ...filters, [key]: value, page: 1 });

  const hasActiveFilters = filters.status || filters.priority || filters.dueBefore || filters.dueAfter;

  const selectStyle = {
    padding: '0.5rem 2rem 0.5rem 0.875rem',
    background: 'var(--surface-container-lowest)',
    border: '1px solid var(--outline-variant)',
    borderRadius: '0.625rem',
    fontSize: '0.875rem',
    color: 'var(--on-surface)',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    appearance: 'none',
    WebkitAppearance: 'none',
    minWidth: '140px',
  };

  const inputStyle = {
    ...selectStyle,
    padding: '0.5rem 0.875rem',
    paddingRight: '0.875rem',
  };

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.75rem',
      alignItems: 'flex-end',
      padding: '1rem 1.25rem',
      background: 'var(--surface-container-lowest)',
      border: '1px solid color-mix(in srgb, var(--outline-variant) 50%, transparent)',
      borderRadius: '1rem',
      marginBottom: '1.5rem',
    }}>
      {/* Status */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label className="label" htmlFor="filter-status">Status</label>
        <div style={{ position: 'relative' }}>
          <select
            id="filter-status"
            style={selectStyle}
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
          <span className="material-symbols-outlined" style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '1rem', pointerEvents: 'none' }}>expand_more</span>
        </div>
      </div>

      {/* Priority */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label className="label" htmlFor="filter-priority">Priority</label>
        <div style={{ position: 'relative' }}>
          <select
            id="filter-priority"
            style={selectStyle}
            value={filters.priority || ''}
            onChange={(e) => handleChange('priority', e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <span className="material-symbols-outlined" style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '1rem', pointerEvents: 'none' }}>expand_more</span>
        </div>
      </div>

      {/* Due Before */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label className="label" htmlFor="filter-due-before">Due Before</label>
        <input
          id="filter-due-before"
          type="date"
          style={inputStyle}
          value={filters.dueBefore || ''}
          onChange={(e) => handleChange('dueBefore', e.target.value)}
        />
      </div>

      {/* Due After */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label className="label" htmlFor="filter-due-after">Due After</label>
        <input
          id="filter-due-after"
          type="date"
          style={inputStyle}
          value={filters.dueAfter || ''}
          onChange={(e) => handleChange('dueAfter', e.target.value)}
        />
      </div>

      {/* Sort */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label className="label" htmlFor="filter-sort">Sort By</label>
        <div style={{ position: 'relative' }}>
          <select
            id="filter-sort"
            style={selectStyle}
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
          <span className="material-symbols-outlined" style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '1rem', pointerEvents: 'none' }}>expand_more</span>
        </div>
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onChange({ page: 1, limit: 9 })}
            style={{ gap: '0.375rem', borderRadius: '0.625rem' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '0.9375rem' }}>close</span>
            Reset
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskFilters;
