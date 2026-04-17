import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, updateUserRole, deleteUser } from '../store/slices/usersSlice.js';
import UserTable from '../components/Users/UserTable.jsx';
import Modal from '../components/UI/Modal.jsx';
import Button from '../components/UI/Button.jsx';
import { showToast } from '../components/UI/Toast.jsx';

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { users, pagination, loading, error } = useSelector((state) => state.users);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('USER');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers({ page, limit: 10, search }));
  }, [dispatch, page, search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setEditModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setDeleteModal(true);
  };

  const handleEditSave = async () => {
    setActionLoading(true);
    const result = await dispatch(updateUserRole({ id: selectedUser._id, role: newRole }));
    setActionLoading(false);
    if (result.meta.requestStatus === 'fulfilled') {
      showToast('User role updated', 'success');
      setEditModal(false);
    } else {
      showToast(result.payload || 'Failed to update user', 'error');
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    const result = await dispatch(deleteUser(selectedUser._id));
    setActionLoading(false);
    if (result.meta.requestStatus === 'fulfilled') {
      showToast('User deleted successfully', 'success');
      setDeleteModal(false);
    } else {
      showToast(result.payload || 'Failed to delete user', 'error');
    }
  };

  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>User Management</h1>
        <p style={{ margin: '0.375rem 0 0', color: '#64748b' }}>
          {pagination?.total || 0} total users
        </p>
      </div>

      {/* Search + controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '0.875rem' }}>🔍</span>
          <input
            id="user-search"
            type="text"
            className="input"
            placeholder="Search by email..."
            value={search}
            onChange={handleSearchChange}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '0.75rem', padding: '1rem', color: '#f87171', marginBottom: '1rem',
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <UserTable users={users} onEdit={openEditModal} onDelete={openDeleteModal} loading={loading} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
          <div className="pagination">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                className={`page-btn ${i + 1 === page ? 'active' : ''}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className="page-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        title={`Edit User — ${selectedUser?.email}`}
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

      {/* Delete Modal */}
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
        <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>
          Are you sure you want to delete <strong style={{ color: '#f1f5f9' }}>{selectedUser?.email}</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default AdminUsers;


//all done hai 