const Badge = ({ type, label }) => {
  const statusMap = {
    TODO: 'badge badge-todo',
    IN_PROGRESS: 'badge badge-inprogress',
    DONE: 'badge badge-done',
    LOW: 'badge badge-low',
    MEDIUM: 'badge badge-medium',
    HIGH: 'badge badge-high',
    ADMIN: 'badge badge-admin',
    USER: 'badge badge-user',
  };
  const className = statusMap[type] || 'badge badge-todo';
  return <span className={className}>{label || type}</span>;
};

export default Badge;
