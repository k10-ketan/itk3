import Badge from '../UI/Badge.jsx';
import Button from '../UI/Button.jsx';

const UserTable = ({ users, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '3.5rem', borderRadius: '0.5rem' }} />
        ))}
      </div>
    );
  }

  if (!users?.length) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
        <div style={{ fontWeight: 600 }}>No users found</div>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    className="avatar"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', flexShrink: 0 }}
                  >
                    {user.email?.[0]?.toUpperCase()}
                  </div>
                  <span style={{ color: '#f1f5f9' }}>{user.email}</span>
                </div>
              </td>
              <td><Badge type={user.role} /></td>
              <td style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </td>
              <td>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(user)}
                    id={`edit-user-${user._id}`}
                  >
                    ✏️ Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(user)}
                    id={`delete-user-${user._id}`}
                  >
                    🗑️ Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
