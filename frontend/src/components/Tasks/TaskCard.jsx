import { useNavigate } from 'react-router-dom';
import Badge from '../UI/Badge.jsx';

const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];

const getAvatarColor = (email = '') => {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const formatDate = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  const now = new Date();
  const diff = d - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (days < 0) return <span style={{ color: '#f87171' }}>{formatted} (overdue)</span>;
  if (days === 0) return <span style={{ color: '#fcd34d' }}>Today</span>;
  if (days === 1) return <span style={{ color: '#fcd34d' }}>Tomorrow</span>;
  return formatted;
};

const TaskCard = ({ task }) => {
  const navigate = useNavigate();
  const assignee = task.assignedTo;
  const docsCount = task.documents?.length || 0;

  return (
    <div
      className="card"
      style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onClick={() => navigate(`/tasks/${task._id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
      }}
      role="article"
    >
      {/* Top row: priority + status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <Badge type={task.priority} />
        <Badge type={task.status} label={task.status === 'IN_PROGRESS' ? 'In Progress' : task.status} />
      </div>

      {/* Title */}
      <h3 style={{
        margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600,
        color: '#f1f5f9', lineHeight: 1.4,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p style={{
          margin: '0 0 1rem', fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div style={{ fontSize: '0.8125rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          📅 {formatDate(task.dueDate)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {docsCount > 0 && (
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              📎 {docsCount}
            </span>
          )}
          {assignee && (
            <div
              className="avatar"
              style={{
                background: getAvatarColor(assignee.email),
                width: '1.75rem', height: '1.75rem', fontSize: '0.6875rem',
              }}
              title={assignee.email}
            >
              {assignee.email?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
