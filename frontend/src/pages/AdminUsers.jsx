import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, updateUserRole, deleteUser } from '../store/slices/usersSlice.js';
import Modal from '../components/UI/Modal.jsx';
import Button from '../components/UI/Button.jsx';
import { showToast } from '../components/UI/Toast.jsx';

const RoleBadge = ({ role }) => {
  const styles = {
    ADMIN: { background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed-variant)' },
    USER:  { background: 'var(--secondary-container)', color: 'var(--on-secondary-container)' },
    EDITOR:{ background: 'var(--secondary-container)', color: 'var(--on-secondary-container)' },
    VIEWER:{ background: 'var(--secondary-container)', color: 'var(--on-secondary-container)' },
  };
  const s = styles[role] || styles.USER;
  return (
    <span style={{
      ...s,
      padding: '0.2rem 0.65rem',
      borderRadius: '9999px',
      fontSize: '0.6875rem',
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    }}>
      {role}
    </span>
  );
};

const StatusDot = ({ active }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <div style={{
      width: '0.5rem', height: '0.5rem', borderRadius: '50%',
      background: active ? '#22c55e' : 'var(--outline)',
    }} />
    <span style={{
      fontSize: '0.875rem', fontWeight: 500,
      color: active ? 'var(--on-surface)' : 'var(--on-surface-variant)',
    }}>
      {active ? 'Active' : 'Inactive'}
    </span>
  </div>
);

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { users, pagination, loading, error } = useSelector((state) => state.users);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('All');
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('USER');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers({ page, limit: 10, search }));
  }, [dispatch, page, search]);

  const handleSearchChange = (e) => { setSearch(e.target.value); setPage(1); };

  const openEditModal = (user) => {
    setSelectedUser(user); setNewRole(user.role); setEditModal(true);
  };
  const openDeleteModal = (user) => { setSelectedUser(user); setDeleteModal(true); };

  const handleEditSave = async () => {
    setActionLoading(true);
    const result = await dispatch(updateUserRole({ id: selectedUser._id, role: newRole }));
    setActionLoading(false);
    if (result.meta.requestStatus === 'fulfilled') {
      showToast('User role updated', 'success'); setEditModal(false);
    } else {
      showToast(result.payload || 'Failed to update user', 'error');
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    const result = await dispatch(deleteUser(selectedUser._id));
    setActionLoading(false);
    if (result.meta.requestStatus === 'fulfilled') {
      showToast('User deleted successfully', 'success'); setDeleteModal(false);
    } else {
      showToast(result.payload || 'Failed to delete user', 'error');
    }
  };

  const totalPages = pagination?.totalPages || 1;
  const totalUsers = pagination?.total || 0;
  const activeUsers = users.filter((u) => u.isActive !== false).length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;

  const filteredUsers = roleFilter === 'All'
    ? users
    : users.filter((u) => u.role === roleFilter.toUpperCase());

  const initials = (email) => email?.[0]?.toUpperCase() || 'U';
  const avatarColors = ['#00488d', '#005fb8', '#7b3200', '#53606f', '#a04401'];

  return (
    <div className="page-enter" style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto' }}>

      {/* ── Page Header ─────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-headline)', margin: '0 0 0.375rem', fontSize: '1.875rem', fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.01em' }}>
            Team Management
          </h1>
          <p style={{ margin: 0, color: 'var(--on-surface-variant)' }}>
            Orchestrate workspace members, manage permissions, and track activity.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-ghost" style={{ gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>file_download</span>
            Export CSV
          </button>
          <button
            className="btn btn-primary"
            style={{ gap: '0.5rem' }}
            onClick={() => showToast('Invite feature coming soon!', 'success')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>person_add</span>
            Add User
          </button>
        </div>
      </div>

      {/* ── Stat Bento ──────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'Total Users',  value: totalUsers, badge: '+12%' },
          { label: 'Active Now',   value: activeUsers, dot: true },
          { label: 'Admins',       value: adminCount },
          { label: 'Invitations',  value: 8 },
        ].map(({ label, value, badge, dot }) => (
          <div key={label} className="stat-card">
            <p style={{ margin: '0 0 0.375rem', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--outline)' }}>
              {label}
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.625rem' }}>
              <span style={{ fontFamily: 'var(--font-headline)', fontSize: '2rem', fontWeight: 800, color: 'var(--on-surface)', lineHeight: 1 }}>
                {value}
              </span>
              {badge && (
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed-variant)', borderRadius: '9999px', padding: '0.15rem 0.5rem', marginBottom: '0.125rem' }}>
                  {badge}
                </span>
              )}
              {dot && (
                <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#22c55e', marginBottom: '0.5rem', animation: 'pulse 2s infinite' }} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Table Container ──────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '1.5rem' }}>

        {/* Table toolbar */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid var(--surface-container)' }}>
          {/* Filter pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>Filter by:</span>
            {['All', 'Admin', 'User'].map((f) => (
              <button
                key={f}
                className={`filter-pill ${roleFilter === f ? 'active' : ''}`}
                onClick={() => setRoleFilter(f)}
              >
                {f === 'All' ? 'All Users' : f}
              </button>
            ))}
          </div>

          {/* Search + sort */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '1.125rem', pointerEvents: 'none' }}>
                search
              </span>
              <input
                id="user-search"
                type="text"
                placeholder="Search by email..."
                value={search}
                onChange={handleSearchChange}
                style={{
                  background: 'var(--surface-container-low)',
                  border: 'none', borderRadius: '0.625rem',
                  padding: '0.5rem 1rem 0.5rem 2.5rem',
                  fontSize: '0.875rem', color: 'var(--on-surface)',
                  outline: 'none', width: '220px',
                  fontFamily: 'var(--font-body)',
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '1rem', pointerEvents: 'none' }}>tune</span>
              <select
                style={{
                  background: 'var(--surface-container-low)',
                  border: 'none', borderRadius: '0.625rem',
                  padding: '0.5rem 2rem 0.5rem 2.25rem',
                  fontSize: '0.875rem', color: 'var(--on-surface)',
                  outline: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', appearance: 'none',
                }}
              >
                <option>Newest First</option>
                <option>Role (A-Z)</option>
                <option>Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ background: 'var(--error-container)', padding: '0.875rem 1.5rem', color: 'var(--error)', fontSize: '0.875rem', fontWeight: 500 }}>
            ⚠ {error}
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((__, j) => (
                      <td key={j}>
                        <div className="skeleton" style={{ height: '1.25rem', borderRadius: '0.375rem', width: j === 0 ? '10rem' : j === 1 ? '14rem' : '5rem' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--on-surface-variant)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--outline-variant)', display: 'block', marginBottom: '0.5rem' }}>group</span>
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => (
                  <tr key={u._id} className="user-row" style={{ cursor: 'default' }}>
                    {/* Name */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="avatar" style={{
                          width: '2.5rem', height: '2.5rem', fontSize: '0.875rem',
                          background: avatarColors[idx % avatarColors.length],
                        }}>
                          {initials(u.email)}
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--on-surface)', fontSize: '0.9375rem' }}>
                          {u.name || u.email?.split('@')[0]}
                        </span>
                      </div>
                    </td>
                    {/* Email */}
                    <td style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>{u.email}</td>
                    {/* Role */}
                    <td><RoleBadge role={u.role} /></td>
                    {/* Status */}
                    <td><StatusDot active={u.isActive !== false} /></td>
                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                        <button
                          onClick={() => openEditModal(u)}
                          title="Edit role"
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '0.375rem', borderRadius: '0.5rem',
                            color: 'var(--outline)',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-fixed)'; e.currentTarget.style.color = 'var(--primary)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--outline)'; }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>edit</span>
                        </button>
                        <button
                          onClick={() => openDeleteModal(u)}
                          title="Delete user"
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '0.375rem', borderRadius: '0.5rem',
                            color: 'var(--outline)',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--error-container)'; e.currentTarget.style.color = 'var(--error)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--outline)'; }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{
          padding: '1rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderTop: '1px solid var(--surface-container)',
          background: 'color-mix(in srgb, var(--surface-container-low) 40%, transparent)',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--outline)', fontWeight: 500 }}>
            Showing {filteredUsers.length} of {totalUsers} users
          </span>

          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>chevron_left</span>
              </button>
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                const p = i + 1;
                return (
                  <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>
                    {p}
                  </button>
                );
              })}
              {totalPages > 5 && <span style={{ color: 'var(--outline)', padding: '0 0.25rem' }}>...</span>}
              {totalPages > 5 && (
                <button className={`page-btn ${totalPages === page ? 'active' : ''}`} onClick={() => setPage(totalPages)}>
                  {totalPages}
                </button>
              )}
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Role Modal ──────────────────────── */}
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        title={`Edit Role — ${selectedUser?.email}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditModal(false)}>Cancel</Button>
            <Button variant="primary" loading={actionLoading} onClick={handleEditSave} id="confirm-edit-user">
              Save Changes
            </Button>
          </>
        }
      >
        <div className="form-group">
          <label className="label" htmlFor="edit-role">Role</label>
          <select
            id="edit-role"
            className="input"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      </Modal>

      {/* ── Delete Modal ─────────────────────────── */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete User"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" loading={actionLoading} onClick={handleDelete} id="confirm-delete-user">
              Delete User
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
          <div style={{
            width: '2.5rem', height: '2.5rem', borderRadius: '50%', flexShrink: 0,
            background: 'var(--error-container)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--error)', fontSize: '1.25rem' }}>warning</span>
          </div>
          <p style={{ margin: 0, color: 'var(--on-surface-variant)', lineHeight: 1.65 }}>
            Are you sure you want to delete{' '}
            <strong style={{ color: 'var(--on-surface)' }}>{selectedUser?.email}</strong>?{' '}
            This action cannot be undone.
          </p>
        </div>
      </Modal>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default AdminUsers;