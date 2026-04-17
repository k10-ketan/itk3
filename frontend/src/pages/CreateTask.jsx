import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createTask } from '../store/slices/tasksSlice.js';
import { fetchUsers } from '../store/slices/usersSlice.js';
import useAuth from '../hooks/useAuth.js';
import DocumentUpload from '../components/Tasks/DocumentUpload.jsx';
import { showToast } from '../components/UI/Toast.jsx';

const SectionCard = ({ title, children, style = {} }) => (
  <div className="card" style={{ ...style }}>
    {title && (
      <h3 style={{ fontFamily: 'var(--font-headline)', margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)' }}>
        {title}
      </h3>
    )}
    {children}
  </div>
);

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
            <button
              onClick={() => navigate('/tasks')}
              style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}
            >
              Tasks
            </button>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>chevron_right</span>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Create Task</span>
          </nav>
          <h1 style={{ fontFamily: 'var(--font-headline)', margin: '0 0 0.25rem', fontSize: '1.875rem', fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.01em' }}>
            Task Details
          </h1>
          <p style={{ margin: 0, color: 'var(--on-surface-variant)' }}>
            Define the objectives and parameters for this work item.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate('/tasks')}
          >
            Discard
          </button>
          <button
            type="submit"
            form="create-task-form"
            className="btn btn-primary"
            disabled={loading}
            id="create-task-submit"
          >
            {loading ? (
              <><span className="spinner spinner-sm" /> Saving...</>
            ) : (
              'Save Task'
            )}
          </button>
        </div>
      </div>

      {/* ── Bento grid ───────────────────────────── */}
      <form id="create-task-form" onSubmit={handleSubmit} noValidate>
        <div className="grid-task-layout">

          {/* Main column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Basic info */}
            <SectionCard>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Title */}
                <div>
                  <label className="label" htmlFor="task-title">Task Title</label>
                  <input
                    id="task-title"
                    type="text"
                    className={`input ${errors.title ? 'error' : ''}`}
                    placeholder="Enter a descriptive title..."
                    maxLength={100}
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  />
                  {errors.title && <span className="error-text">⚠ {errors.title}</span>}
                </div>

                {/* Description */}
                <div>
                  <label className="label" htmlFor="task-desc">Description</label>
                  <textarea
                    id="task-desc"
                    className={`input ${errors.description ? 'error' : ''}`}
                    placeholder="Provide detailed context and requirements..."
                    rows={6}
                    maxLength={1000}
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    style={{ resize: 'vertical', minHeight: '140px' }}
                  />
                  <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--outline)', marginTop: '0.25rem' }}>
                    {form.description.length}/1000
                  </div>
                  {errors.description && <span className="error-text">⚠ {errors.description}</span>}
                </div>
              </div>
            </SectionCard>

            {/* Attachments */}
            <SectionCard>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-headline)', margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                  Document Attachments
                </h3>
                <span style={{
                  background: 'var(--secondary-container)',
                  color: 'var(--on-secondary-container)',
                  fontSize: '0.6875rem', fontWeight: 700,
                  padding: '0.2rem 0.6rem', borderRadius: '9999px',
                }}>
                  Max 3 PDFs
                </span>
              </div>
              <DocumentUpload files={files} setFiles={setFiles} existingCount={0} />
            </SectionCard>
          </div>

          {/* Sidebar metadata column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Status, Priority, Due Date */}
            <SectionCard>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                <div>
                  <label className="label" htmlFor="task-status">Current Status</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      id="task-status"
                      className="input"
                      value={form.status}
                      onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                      style={selectStyle}
                    >
                      <option value="TODO">Todo</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '1.125rem', pointerEvents: 'none' }}>
                      expand_more
                    </span>
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="task-priority">Priority Level</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      id="task-priority"
                      className="input"
                      value={form.priority}
                      onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                      style={selectStyle}
                    >
                      <option value="LOW">Low Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="HIGH">High Priority</option>
                    </select>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '1.125rem', pointerEvents: 'none' }}>
                      priority_high
                    </span>
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="task-due">Due Date</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="task-due"
                      type="date"
                      className="input"
                      value={form.dueDate}
                      onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                    />
                    <span className="material-symbols-outlined" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '1.125rem', pointerEvents: 'none' }}>
                      calendar_today
                    </span>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Assignee */}
            {isAdmin && (
              <SectionCard>
                <label className="label">Assign To</label>
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '1.125rem', pointerEvents: 'none' }}>search</span>
                  <input
                    type="text"
                    className="input"
                    placeholder="Search team members..."
                    style={{ paddingLeft: '2.5rem' }}
                    readOnly
                  />
                </div>

                <div style={{ position: 'relative' }}>
                  <select
                    id="task-assign"
                    className="input"
                    value={form.assignedTo}
                    onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value }))}
                    style={selectStyle}
                  >
                    <option value="">— Unassigned —</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>{u.email} ({u.role})</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '1.125rem', pointerEvents: 'none' }}>expand_more</span>
                </div>
              </SectionCard>
            )}

            {/* Task progress preview card */}
            <div style={{
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, #1b1b1f 0%, #303034 100%)',
              padding: '1.5rem',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)' }}>
                  Task Progress
                </p>
                <h4 style={{ fontFamily: 'var(--font-headline)', margin: '0 0 1rem', fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                  {form.title ? 'Ready to save!' : 'Draft'}
                </h4>
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{
                    background: 'var(--primary-fixed-dim)',
                    height: '100%',
                    borderRadius: '999px',
                    width: form.title ? (form.description ? '80%' : '40%') : '10%',
                    transition: 'width 0.4s ease',
                  }} />
                </div>
                <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                  {form.title
                    ? 'Add a description and deadline to complete your task setup.'
                    : 'Start by entering a task title above.'}
                </p>
              </div>
              <div style={{ position: 'absolute', right: '-1rem', bottom: '-1rem', opacity: 0.08 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '8rem', color: '#fff' }}>trending_up</span>
              </div>
            </div>

            {/* Redux error */}
            {error && (
              <div style={{
                background: 'var(--error-container)',
                borderRadius: '0.75rem', padding: '0.875rem 1rem',
                color: 'var(--error)', fontSize: '0.875rem', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>error_outline</span>
                {error}
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Auto-save indicator */}
      {/* <div style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        background: 'var(--surface-container-lowest)',
        padding: '0.875rem 1rem', borderRadius: '0.875rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        border: '1px solid var(--outline-variant)',
        maxWidth: '260px',
      }}>
        <div style={{
          width: '2.25rem', height: '2.25rem', borderRadius: '50%', flexShrink: 0,
          background: 'color-mix(in srgb, var(--tertiary-container) 20%, transparent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--tertiary)', fontSize: '1.125rem' }}>auto_awesome</span>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface)' }}>Draft Saved Automatically</p>
          <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--outline)' }}>Your changes are captured.</p>
        </div>
      </div> */}
    </div>
  );
};

export default CreateTask;
