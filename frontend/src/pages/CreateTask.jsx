import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createTask } from '../store/slices/tasksSlice.js';
import { fetchUsers } from '../store/slices/usersSlice.js';
import useAuth from '../hooks/useAuth.js';
import DocumentUpload from '../components/Tasks/DocumentUpload.jsx';
import Button from '../components/UI/Button.jsx';
import { showToast } from '../components/UI/Toast.jsx';

const CreateTask = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAdmin } = useAuth();
  const { loading, error } = useSelector((state) => state.tasks);
  const { users } = useSelector((state) => state.users);

  const [form, setForm] = useState({
    title: '', description: '', status: 'TODO',
    priority: 'MEDIUM', dueDate: '', assignedTo: '',
  });
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (isAdmin) dispatch(fetchUsers({ limit: 100 }));
  }, [dispatch, isAdmin]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.length > 100) e.title = 'Title cannot exceed 100 characters';
    if (form.description.length > 1000) e.description = 'Description cannot exceed 1000 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const fd = new FormData();
    Object.entries(form).forEach(([key, val]) => { if (val) fd.append(key, val); });
    files.forEach((file) => fd.append('documents', file));

    const result = await dispatch(createTask(fd));
    if (result.meta.requestStatus === 'fulfilled') {
      showToast('Task created successfully! 🎉', 'success');
      navigate('/tasks');
    } else {
      showToast(result.payload || 'Failed to create task', 'error');
    }
  };

  const fieldStyle = { marginBottom: '1.25rem' };

  return (
    <div className="page-enter" style={{ maxWidth: '700px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate('/tasks')}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9375rem' }}
        >
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: '1.625rem', fontWeight: 800, color: '#f1f5f9' }}>Create New Task</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div style={fieldStyle}>
            <label className="label" htmlFor="task-title">Title <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              id="task-title"
              type="text"
              className={`input ${errors.title ? 'error' : ''}`}
              placeholder="e.g. Implement login page"
              maxLength={100}
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
            {errors.title && <span className="error-text">⚠ {errors.title}</span>}
          </div>

          {/* Description */}
          <div style={fieldStyle}>
            <label className="label" htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              className={`input ${errors.description ? 'error' : ''}`}
              placeholder="Describe the task in detail..."
              rows={4}
              maxLength={1000}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              style={{ resize: 'vertical', minHeight: '100px' }}
            />
            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              {form.description.length}/1000
            </div>
            {errors.description && <span className="error-text">⚠ {errors.description}</span>}
          </div>

          {/* Status + Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="label" htmlFor="task-status">Status</label>
              <select
                id="task-status"
                className="input"
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                className="input"
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Due Date + Assignee */}
          <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 1fr' : '1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="label" htmlFor="task-due">Due Date</label>
              <input
                id="task-due"
                type="date"
                className="input"
                value={form.dueDate}
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                style={{ colorScheme: 'dark' }}
              />
            </div>
            {isAdmin && (
              <div>
                <label className="label" htmlFor="task-assign">Assign To</label>
                <select
                  id="task-assign"
                  className="input"
                  value={form.assignedTo}
                  onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value }))}
                >
                  <option value="">— Unassigned —</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>{u.email} ({u.role})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Documents */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label">Attachments (PDF only, max 3 files, max 5 MB each)</label>
            <DocumentUpload files={files} setFiles={setFiles} existingCount={0} />
          </div>

          {/* Error from redux */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '0.5rem', padding: '0.75rem', color: '#f87171', marginBottom: '1rem',
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button variant="ghost" type="button" onClick={() => navigate('/tasks')}>Cancel</Button>
            <Button variant="primary" type="submit" loading={loading} id="create-task-submit">
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;
