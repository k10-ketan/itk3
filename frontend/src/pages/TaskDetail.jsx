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
  return new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
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
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ color: '#f1f5f9' }}>Task not found</h2>
        <Button variant="ghost" onClick={() => navigate('/tasks')} style={{ marginTop: '1rem' }}>
          ← Back to Tasks
        </Button>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Back + actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          onClick={() => navigate('/tasks')}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem' }}
        >
          ← Back to Tasks
        </button>
        {canManage && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="ghost" size="sm" onClick={() => navigate(`/tasks/${id}/edit`)} id="task-edit-btn">
              ✏️ Edit Task
            </Button>
            <Button variant="danger" size="sm" onClick={() => setDeleteModal(true)} id="task-delete-btn">
              🗑️ Delete
            </Button>
          </div>
        )}
      </div>

      {/* Main card */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        {/* Badges */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <Badge type={task.priority} />
          <Badge type={task.status} label={task.status === 'IN_PROGRESS' ? 'In Progress' : task.status} />
        </div>

        <h1 style={{ margin: '0 0 0.75rem', fontSize: '1.625rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.3 }}>
          {task.title}
        </h1>

        {task.description && (
          <p style={{ margin: '0 0 1.5rem', color: '#94a3b8', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {task.description}
          </p>
        )}

        {/* Meta grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #334155' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>Due Date</div>
            <div style={{ color: '#f1f5f9', fontSize: '0.9375rem' }}>📅 {formatDate(task.dueDate)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>Assigned To</div>
            <div style={{ color: '#f1f5f9', fontSize: '0.9375rem' }}>
              {task.assignedTo ? `👤 ${task.assignedTo.email}` : '—'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>Created By</div>
            <div style={{ color: '#f1f5f9', fontSize: '0.9375rem' }}>
              {task.createdBy?.email || '—'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>Created At</div>
            <div style={{ color: '#f1f5f9', fontSize: '0.9375rem' }}>
              {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="card">
        <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.0625rem', fontWeight: 700, color: '#f1f5f9' }}>
          📎 Attachments ({task.documents?.length || 0})
        </h2>

        {!task.documents?.length ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
            <div>No documents attached to this task.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {task.documents.map((doc) => (
              <div
                key={doc._id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  padding: '0.875rem 1rem',
                  background: '#334155', borderRadius: '0.625rem',
                  border: '1px solid #475569',
                }}
              >
                <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>📄</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.9375rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {doc.originalName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem' }}>
                    {formatSize(doc.size)} · Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(doc._id, doc.originalName)}
                    id={`download-doc-${doc._id}`}
                  >
                    ⬇ Download
                  </Button>
                  {canManage && (
                    <Button
                      variant="danger"
                      size="sm"
                      loading={docDeleting === doc._id}
                      onClick={() => handleDocDelete(doc._id)}
                      id={`delete-doc-${doc._id}`}
                    >
                      🗑
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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
        <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>
          Are you sure you want to delete <strong style={{ color: '#f1f5f9' }}>{task.title}</strong>?
          This will permanently remove the task and all its attachments. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default TaskDetail;
