import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTasks } from '../store/slices/tasksSlice.js';
import TaskCard from '../components/Tasks/TaskCard.jsx';
import TaskFilters from '../components/Tasks/TaskFilters.jsx';
import Button from '../components/UI/Button.jsx';

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

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages } = pagination;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
      <div className="pagination">
        <button className="page-btn" disabled={page === 1} onClick={() => onPageChange(page - 1)}>‹</button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={i} style={{ color: '#64748b', padding: '0 0.25rem' }}>…</span>
          ) : (
            <button
              key={p}
              className={`page-btn ${p === page ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
        )}
        <button className="page-btn" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>›</button>
      </div>
    </div>
  );
};

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

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>Tasks</h1>
          {pagination && (
            <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
              {pagination.total} task{pagination.total !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/tasks/new')}
          id="tasks-create-btn"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          + New Task
        </Button>
      </div>

      {/* Filters */}
      <TaskFilters filters={filters} onChange={handleFilterChange} />

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '0.75rem', padding: '1rem', color: '#f87171', marginBottom: '1rem',
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="task-grid">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : tasks.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '5rem 2rem',
          background: '#1e293b', borderRadius: '1rem', border: '1px solid #334155',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>No tasks found</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Try adjusting your filters or create your first task.</p>
          <Button variant="primary" onClick={() => navigate('/tasks/new')}>+ Create Task</Button>
        </div>
      ) : (
        <div className="task-grid">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination pagination={pagination} onPageChange={handlePageChange} />
    </div>
  );
};

export default Tasks;
