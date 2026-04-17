import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTaskById, deleteTask, deleteDocument } from '../store/slices/tasksSlice.js';
import useAuth from '../hooks/useAuth.js';
import Badge from '../components/UI/Badge.jsx';
import Button from '../components/UI/Button.jsx';
import Modal from '../components/UI/Modal.jsx';
import Spinner from '../components/UI/Spinner.jsx';
import { showToast } from '../components/UI/Toast.jsx';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDate = (date) => {
  if (!date) return 'No due date';
  return new Date(date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
};

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAdmin } = useAuth();
  const { currentTask: task, loading, error } = useSelector((state) => state.tasks);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [docDeleting, setDocDeleting] = useState(null);

  useEffect(() => {
    dispatch(fetchTaskById(id));
  }, [dispatch, id]);

  const isOwner = task?.createdBy?._id === user?._id || task?.createdBy?._id === user?.id;
  const canManage = isAdmin || isOwner;

  const handleDelete = async () => {
    setDeleting(true);
    const result = await dispatch(deleteTask(id));
    setDeleting(false);
    if (result.meta.requestStatus === 'fulfilled') {
      showToast('Task deleted successfully', 'success');
      navigate('/tasks');
    } else {
      showToast(result.payload || 'Failed to delete task', 'error');
    }
  };

  const handleDocDelete = async (docId) => {
    setDocDeleting(docId);
    const result = await dispatch(deleteDocument({ docId, taskId: id }));
    setDocDeleting(null);
    if (result.meta.requestStatus === 'fulfilled') {
      showToast('Document deleted', 'success');
    } else {
      showToast(result.payload || 'Failed to delete document', 'error');
    }
  };

  const handleDownload = (docId, originalName) => {
    const url = `${API_URL}/documents/${docId}/download`;
    const a = document.createElement('a');
    a.href = url;
    a.download = originalName;
    a.click();
  };

  if (loading && !task) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Spinner size="lg" variant="primary" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface-container-lowest)', borderRadius: '1rem', border: '1px solid var(--outline-variant)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--error)', marginBottom: '1rem', display: 'block' }}>error</span>
        <h2 style={{ fontFamily: 'var(--font-headline)', color: 'var(--on-surface)', margin: '0 0 0.5rem' }}>Task not found</h2>
        <p style={{ color: 'var(--on-surface-variant)', margin: '0 0 1.5rem' }}>The task may have been deleted or you don't have access.</p>
        <Button variant="primary" onClick={() => navigate('/tasks')} style={{ gap: '0.5rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>arrow_back</span>
          Back to Tasks
        </Button>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem' }}>

      {/* ── Header ───────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>
            <button onClick={() => navigate('/tasks')} style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', padding: 0 }}>Tasks</button>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>chevron_right</span>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Task Details</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Badge type={task.priority} />
            <Badge type={task.status} label={task.status === 'IN_PROGRESS' ? 'In Progress' : task.status} />
          </div>

          <h1 style={{ margin: '0', fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-headline)', color: 'var(--on-surface)', lineHeight: 1.2 }}>
            {task.title}
          </h1>
        </div>

        {canManage && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => navigate(`/tasks/${id}/edit`)}
              className="btn btn-ghost"
              style={{ gap: '0.375rem', padding: '0.5rem 1rem' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>edit_square</span>
              Edit
            </button>
            <button
              onClick={() => setDeleteModal(true)}
              className="btn btn-danger"
              style={{ gap: '0.375rem', padding: '0.5rem 1rem' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>delete</span>
              Delete
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(280px, 340px)', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Main Content Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-headline)', margin: '0 0 1rem', fontSize: '1.125rem', fontWeight: 700, color: 'var(--on-surface)' }}>Description</h3>
            {task.description ? (
              <p style={{ margin: 0, color: 'var(--on-surface-variant)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontSize: '0.9375rem' }}>
                {task.description}
              </p>
            ) : (
              <p style={{ margin: 0, color: 'var(--outline)', fontStyle: 'italic', fontSize: '0.9375rem' }}>No description provided.</p>
            )}
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>attach_file</span>
                Attachments
              </h3>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--surface-container-high)', color: 'var(--on-surface-variant)', padding: '0.125rem 0.5rem', borderRadius: '999px' }}>
                {task.documents?.length || 0} Files
              </span>
            </div>

            {!task.documents?.length ? (
              <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--surface-container)', borderRadius: '0.75rem', border: '1px dashed var(--outline-variant)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--outline-variant)', marginBottom: '0.5rem', display: 'block' }}>file_present</span>
                <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>No documents attached.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {task.documents.map((doc) => (
                  <div
                    key={doc._id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '1rem',
                      background: 'var(--surface-container-low)', borderRadius: '0.75rem',
                      border: '1px solid var(--outline-variant)',
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--surface-container)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--outline-variant)'; e.currentTarget.style.background = 'var(--surface-container-low)'; }}
                  >
                    <div style={{
                      width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem',
                      background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>picture_as_pdf</span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'var(--on-surface)', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.originalName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--outline)', marginTop: '0.125rem' }}>
                        {formatSize(doc.size)} · Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                      <button
                        title="Download"
                        onClick={() => handleDownload(doc._id, doc.originalName)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          width: '2rem', height: '2rem', borderRadius: '0.375rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--primary)',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--primary) 15%, transparent)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>download</span>
                      </button>

                      {canManage && (
                        <button
                          title="Delete"
                          onClick={() => handleDocDelete(doc._id)}
                          disabled={docDeleting === doc._id}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            width: '2rem', height: '2rem', borderRadius: '0.375rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--error)',
                            opacity: docDeleting === doc._id ? 0.5 : 1,
                          }}
                          onMouseEnter={(e) => !docDeleting && (e.currentTarget.style.background = 'var(--error-container)')}
                          onMouseLeave={(e) => !docDeleting && (e.currentTarget.style.background = 'none')}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>
                            {docDeleting === doc._id ? 'hourglass_empty' : 'delete'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Metadata Column */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-headline)', margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)' }}>Properties</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--outline)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Due Date</div>
              <div style={{ color: 'var(--on-surface)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 500 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.125rem', color: 'var(--outline)' }}>calendar_today</span>
                {formatDate(task.dueDate)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--outline)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Assigned To</div>
              <div style={{ color: 'var(--on-surface)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 500 }}>
                {task.assignedTo ? (
                  <>
                    <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: 700 }}>
                      {task.assignedTo.email?.[0].toUpperCase()}
                    </div>
                    {task.assignedTo.email}
                  </>
                ) : (
                  <>
                    <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: 'var(--surface-container-high)', border: '1px dashed var(--outline)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '0.875rem', color: 'var(--outline)' }}>person_off</span>
                    </div>
                    <span style={{ color: 'var(--on-surface-variant)' }}>Unassigned</span>
                  </>
                )}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--outline)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Created By</div>
              <div style={{ color: 'var(--on-surface)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 500 }}>
                {task.createdBy ? (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.125rem', color: 'var(--outline)' }}>account_circle</span>
                    {task.createdBy.email}
                  </>
                ) : (
                  '—'
                )}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--outline)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Created At</div>
              <div style={{ color: 'var(--on-surface)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 500 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.125rem', color: 'var(--outline)' }}>schedule</span>
                {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Delete modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Task"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete} id="confirm-delete-task">
              Delete Task
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'var(--error-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
             <span className="material-symbols-outlined" style={{ color: 'var(--error)', fontSize: '1.125rem' }}>warning</span>
          </div>
          <p style={{ margin: 0, color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
            Are you sure you want to delete <strong style={{ color: 'var(--on-surface)' }}>{task.title}</strong>? 
            This will permanently remove the task and all attached documents.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default TaskDetail;
