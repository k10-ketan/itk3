import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTasks } from '../store/slices/tasksSlice.js';
import TaskCard from '../components/Tasks/TaskCard.jsx';
import TaskFilters from '../components/Tasks/TaskFilters.jsx';

const SkeletonCard = () => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div className="skeleton" style={{ width: '4rem', height: '1.25rem', borderRadius: '9999px' }} />
      <div className="skeleton" style={{ width: '5rem', height: '1.25rem', borderRadius: '9999px' }} />
    </div>
    <div className="skeleton" style={{ width: '80%', height: '1.25rem' }} />
    <div className="skeleton" style={{ width: '100%', height: '3rem' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
      <div className="skeleton" style={{ width: '5rem', height: '1rem' }} />
      <div className="skeleton" style={{ width: '2rem', height: '2rem', borderRadius: '50%' }} />
    </div>
  </div>
);

const Tasks = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tasks, pagination, loading, error } = useSelector((state) => state.tasks);
  const [filters, setFilters] = useState({ page: 1, limit: 9 });

  useEffect(() => {
    dispatch(fetchTasks(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (newFilters) => setFilters(newFilters);
  const handlePageChange = (page) => setFilters((f) => ({ ...f, page }));

  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;
  const { page } = filters;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pages.push(i);
    else if (pages[pages.length - 1] !== '...') pages.push('...');
  }

  return (
    <div className="page-enter" style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto' }}>

      {/* ── Header ─────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-headline)', margin: '0 0 0.375rem', fontSize: '1.875rem', fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.01em' }}>
            Tasks
          </h1>
          {pagination && (
            <p style={{ margin: 0, color: 'var(--on-surface-variant)', fontSize: '0.9375rem' }}>
              {total} task{total !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/tasks/new')}
          id="tasks-create-btn"
          style={{ gap: '0.5rem' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>add</span>
          New Task
        </button>
      </div>

      {/* ── Filters ────────────────────────────── */}
      <TaskFilters filters={filters} onChange={handleFilterChange} />

      {/* ── Error ──────────────────────────────── */}
      {error && (
        <div style={{
          background: 'var(--error-container)',
          border: '1px solid color-mix(in srgb, var(--error) 30%, transparent)',
          borderRadius: '0.75rem',
          padding: '0.875rem 1rem',
          color: 'var(--error)',
          marginBottom: '1.25rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontSize: '0.875rem', fontWeight: 500,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>error_outline</span>
          {error}
        </div>
      )}

      {/* ── Grid ───────────────────────────────── */}
      {loading ? (
        <div className="task-grid">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : tasks.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '5rem 2rem',
          background: 'var(--surface-container-lowest)',
          borderRadius: '1.5rem',
          border: '1px solid color-mix(in srgb, var(--outline-variant) 40%, transparent)',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--outline-variant)', display: 'block', marginBottom: '1rem' }}>
            assignment
          </span>
          <h3 style={{ fontFamily: 'var(--font-headline)', color: 'var(--on-surface)', marginBottom: '0.5rem' }}>No tasks found</h3>
          <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>
            Try adjusting your filters or create your first task.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/tasks/new')}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>add</span>
            Create Task
          </button>
        </div>
      ) : (
        <div className="task-grid">
          {tasks.map((task) => <TaskCard key={task._id} task={task} />)}
        </div>
      )}

      {/* ── Pagination ─────────────────────────── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <div className="pagination">
            <button className="page-btn" disabled={page === 1} onClick={() => handlePageChange(page - 1)}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>chevron_left</span>
            </button>
            {pages.map((p, i) =>
              p === '...' ? (
                <span key={i} style={{ color: 'var(--outline)', padding: '0 0.25rem', fontSize: '0.875rem' }}>…</span>
              ) : (
                <button
                  key={p}
                  className={`page-btn ${p === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </button>
              )
            )}
            <button className="page-btn" disabled={page === totalPages} onClick={() => handlePageChange(page + 1)}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
