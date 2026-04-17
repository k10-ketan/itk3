import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTaskById, updateTask } from '../store/slices/tasksSlice.js';
import { fetchUsers } from '../store/slices/usersSlice.js';
import useAuth from '../hooks/useAuth.js';
import DocumentUpload from '../components/Tasks/DocumentUpload.jsx';
import Button from '../components/UI/Button.jsx';
import Spinner from '../components/UI/Spinner.jsx';
import { showToast } from '../components/UI/Toast.jsx';

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAdmin } = useAuth();
  const { currentTask: task, loading, error } = useSelector((state) => state.tasks);
  const { users } = useSelector((state) => state.users);

  const [form, setForm] = useState({
    title: '', description: '', status: 'TODO',
    priority: 'MEDIUM', dueDate: '', assignedTo: '',
  });
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    dispatch(fetchTaskById(id));
    if (isAdmin) dispatch(fetchUsers({ limit: 100 }));
  }, [dispatch, id, isAdmin]);

  useEffect(() => {
    if (task && !initialized) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'TODO',
        priority: task.priority || 'MEDIUM',
        dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
        assignedTo: task.assignedTo?._id || task.assignedTo || '',
      });
      setInitialized(true);
    }
  }, [task, initialized]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.length > 100) e.title = 'Title cannot exceed 100 characters';
    if (form.description.length > 1000) e.description = 'Description cannot exceed 1000 characters';
    return e;
  };

  const existingDocCount = task?.documents?.length || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const fd = new FormData();
    Object.entries(form).forEach(([key, val]) => { if (val !== undefined && val !== null) fd.append(key, val); });
    files.forEach((file) => fd.append('documents', file));

    const result = await dispatch(updateTask({ id, formData: fd }));
    if (result.meta.requestStatus === 'fulfilled') {
      showToast('Task updated successfully! ✅', 'success');
      navigate(`/tasks/${id}`);
    } else {
      showToast(result.payload || 'Failed to update task', 'error');
    }
  };

  if (loading && !task) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Spinner size="lg" variant="primary" />
      </div>
    );
  }

  const selectStyle = {
    appearance: 'none',
    WebkitAppearance: 'none',
  };

  return (
    <div className="page-enter" style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>

      {/* ── Header ───────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>
            <button onClick={() => navigate('/tasks')} style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', padding: 0 }}>Tasks</button>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>chevron_right</span>
            <button onClick={() => navigate(`/tasks/${id}`)} style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', padding: 0 }}>{task?.title ? (task.title.length > 20 ? task.title.slice(0, 20) + '...' : task.title) : 'Task'}</button>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>chevron_right</span>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Edit</span>
          </nav>
          <h1 style={{ fontFamily: 'var(--font-headline)', margin: '0 0 0.25rem', fontSize: '1.875rem', fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.01em' }}>
            Edit Task
          </h1>
          <p style={{ margin: 0, color: 'var(--on-surface-variant)' }}>
            Update the details and properties for this work item.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(`/tasks/${id}`)}>
            Cancel
          </button>
          <button type="submit" form="edit-task-form" className="btn btn-primary" disabled={loading} id="edit-task-submit">
            {loading ? <><span className="spinner spinner-sm" /> Saving...</> : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* ── Content Grid ─────────────────────────── */}
      <form id="edit-task-form" onSubmit={handleSubmit} noValidate>
        <div className="grid-task-layout">

          {/* Main column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div className="card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label className="label" htmlFor="edit-title">Task Title</label>
                  <input
                    id="edit-title" type="text"
                    className={`input ${errors.title ? 'error' : ''}`}
                    maxLength={100}
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  />
                  {errors.title && <span className="error-text">⚠ {errors.title}</span>}
                </div>

                <div>
                  <label className="label" htmlFor="edit-desc">Description</label>
                  <textarea
                    id="edit-desc"
                    className={`input ${errors.description ? 'error' : ''}`}
                    rows={6} maxLength={1000}
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    style={{ resize: 'vertical', minHeight: '140px' }}
                  />
                  <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--outline)', marginTop: '0.25rem' }}>{form.description.length}/1000</div>
                  {errors.description && <span className="error-text">⚠ {errors.description}</span>}
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-headline)', margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                Add More Attachments
              </h3>
              <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>
                {existingDocCount} existing document(s). You can upload up to {3 - existingDocCount} more.
              </div>
              <DocumentUpload files={files} setFiles={setFiles} existingCount={existingDocCount} />
            </div>
          </div>

          {/* Sidebar fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div className="card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="label" htmlFor="edit-status">Status</label>
                  <div style={{ position: 'relative' }}>
                    <select id="edit-status" className="input" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} style={selectStyle}>
                      <option value="TODO">Todo</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '1.125rem', pointerEvents: 'none' }}>expand_more</span>
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="edit-priority">Priority</label>
                  <div style={{ position: 'relative' }}>
                    <select id="edit-priority" className="input" value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))} style={selectStyle}>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '1.125rem', pointerEvents: 'none' }}>expand_more</span>
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="edit-due">Due Date</label>
                  <div style={{ position: 'relative' }}>
                    <input id="edit-due" type="date" className="input" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="card">
                <label className="label" htmlFor="edit-assign">Assign To</label>
                <div style={{ position: 'relative' }}>
                  <select id="edit-assign" className="input" value={form.assignedTo} onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value }))} style={selectStyle}>
                    <option value="">— Unassigned —</option>
                    {users.map((u) => <option key={u._id} value={u._id}>{u.email} ({u.role})</option>)}
                  </select>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '1.125rem', pointerEvents: 'none' }}>expand_more</span>
                </div>
              </div>
            )}

            {error && (
              <div style={{ background: 'var(--error-container)', borderRadius: '0.75rem', padding: '0.875rem 1rem', color: 'var(--error)', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>error_outline</span>
                {error}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditTask;
