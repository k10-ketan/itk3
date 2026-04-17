const labelMap = {
  TODO:        'Todo',
  IN_PROGRESS: 'In Progress',
  DONE:        'Done',
  LOW:         'Low',
  MEDIUM:      'Medium',
  HIGH:        'High',
  ADMIN:       'Admin',
  USER:        'User',
};

const classMap = {
  TODO:        'badge badge-todo',
  IN_PROGRESS: 'badge badge-inprogress',
  DONE:        'badge badge-done',
  LOW:         'badge badge-low',
  MEDIUM:      'badge badge-medium',
  HIGH:        'badge badge-high',
  ADMIN:       'badge badge-admin',
  USER:        'badge badge-user',
};

const dotMap = {
  TODO:        null,
  IN_PROGRESS: '●',
  DONE:        '✓',
  LOW:         null,
  MEDIUM:      null,
  HIGH:        '●',
  ADMIN:       null,
  USER:        null,
};

const Badge = ({ type, label }) => {
  const text  = label || labelMap[type] || type;
  const cls   = classMap[type] || 'badge';
  const dot   = dotMap[type];

  return (
    <span className={cls}>
      {dot && <span style={{ fontSize: '0.5rem' }}>{dot}</span>}
      {text}
    </span>
  );
};

export default Badge;
