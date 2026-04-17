import { useNavigate } from 'react-router-dom';
import Badge from '../UI/Badge.jsx';

const AVATAR_COLORS = ['#00488d', '#005fb8', '#7b3200', '#53606f', '#a04401'];

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
  if (days < 0)  return <span style={{ color: 'var(--error)',    fontWeight: 600 }}>{formatted} · Overdue</span>;
  if (days === 0) return <span style={{ color: 'var(--tertiary)', fontWeight: 600 }}>Today</span>;
  if (days === 1) return <span style={{ color: 'var(--tertiary)', fontWeight: 600 }}>Tomorrow</span>;
  return <span style={{ color: 'var(--on-surface-variant)' }}>{formatted}</span>;
};

const PRIORITY_ACCENT = {
  HIGH:   'var(--error)',
  MEDIUM: 'var(--tertiary)',
  LOW:    '#22c55e',
};

const STATUS_ICON = {
  TODO:        'radio_button_unchecked',
  IN_PROGRESS: 'pending',
  DONE:        'check_circle',
};

const TaskCard = ({ task }) => {
  const navigate = useNavigate();
  const assignee  = task.assignedTo;
  const docsCount = task.documents?.length || 0;
  const accent    = PRIORITY_ACCENT[task.priority] || 'var(--outline)';
  const statusIcon = STATUS_ICON[task.status] || 'radio_button_unchecked';

  return (
    <div
      className="card"
      style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}
      onClick={() => navigate(`/tasks/${task._id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform   = 'translateY(-3px)';
        e.currentTarget.style.boxShadow   = '0 12px 32px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
      }}
      role="article"
    >
      {/* Top: priority badge + status badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Badge type={task.priority} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '1rem',
              color: task.status === 'DONE'
                ? '#22c55e'
                : task.status === 'IN_PROGRESS'
                  ? 'var(--primary)'
                  : 'var(--outline)',
              fontVariationSettings: task.status === 'DONE' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            {statusIcon}
          </span>
          <Badge type={task.status} label={task.status === 'IN_PROGRESS' ? 'In Progress' : undefined} />
        </div>
      </div>

      {/* Priority accent bar */}
      <div style={{
        height: '3px', borderRadius: '2px',
        background: `linear-gradient(90deg, ${accent}, transparent)`,
        margin: '-0.25rem 0',
      }} />

      {/* Title */}
      <h3 style={{
        margin: 0,
        fontFamily: 'var(--font-headline)',
        fontSize: '0.9375rem',
        fontWeight: 700,
        color: 'var(--on-surface)',
        lineHeight: 1.4,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p style={{
          margin: 0,
          fontSize: '0.8125rem',
          color: 'var(--on-surface-variant)',
          lineHeight: 1.55,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {task.description}
        </p>
      )}

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--surface-container)', margin: '0 0' }} />

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        {/* Due date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '0.9375rem', color: 'var(--outline)' }}>calendar_today</span>
          {formatDate(task.dueDate)}
        </div>

        {/* Docs + Assignee */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {docsCount > 0 && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              fontSize: '0.75rem', color: 'var(--outline)',
              background: 'var(--surface-container)', padding: '0.2rem 0.5rem', borderRadius: '0.375rem',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>attach_file</span>
              {docsCount}
            </span>
          )}
          {assignee && (
            <div
              className="avatar"
              style={{
                background: getAvatarColor(assignee.email),
                width: '1.75rem', height: '1.75rem', fontSize: '0.6875rem',
                border: '2px solid var(--surface-container-lowest)',
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
