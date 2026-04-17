import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import usersReducer, {
  fetchUsers,
  updateUserRole,
  deleteUser,
  clearUsersError,
} from '../store/slices/usersSlice.js';

vi.mock('../api/axios.js', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import axiosInstance from '../api/axios.js';

const makeStore = () =>
  configureStore({ reducer: { users: usersReducer } });

const sampleUser = { _id: 'u1', email: 'alice@test.com', role: 'USER', createdAt: new Date().toISOString() };
const sampleUser2 = { _id: 'u2', email: 'bob@test.com', role: 'ADMIN', createdAt: new Date().toISOString() };

describe('usersSlice — initial state', () => {
  it('should have correct initial state', () => {
    const store = makeStore();
    const state = store.getState().users;
    expect(state.users).toEqual([]);
    expect(state.pagination).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });
});

describe('usersSlice — clearUsersError reducer', () => {
  it('clears the error field', () => {
    const store = makeStore();
    store.dispatch({ type: fetchUsers.rejected.type, payload: 'Some error' });
    expect(store.getState().users.error).toBe('Some error');
    store.dispatch(clearUsersError());
    expect(store.getState().users.error).toBeNull();
  });
});

describe('usersSlice — fetchUsers thunk', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fulfilled — sets users and pagination', async () => {
    const pagination = { page: 1, limit: 10, total: 2, totalPages: 1 };
    axiosInstance.get.mockResolvedValue({
      data: { success: true, data: [sampleUser, sampleUser2], pagination },
    });

    const store = makeStore();
    await store.dispatch(fetchUsers());
    const state = store.getState().users;

    expect(state.users).toHaveLength(2);
    expect(state.users[0]._id).toBe('u1');
    expect(state.pagination).toEqual(pagination);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('pending — sets loading true', () => {
    const store = makeStore();
    store.dispatch({ type: fetchUsers.pending.type });
    expect(store.getState().users.loading).toBe(true);
  });

  it('rejected — sets error', async () => {
    axiosInstance.get.mockRejectedValue({
      response: { data: { message: 'Forbidden' } },
    });

    const store = makeStore();
    await store.dispatch(fetchUsers());
    const state = store.getState().users;
    expect(state.error).toBe('Forbidden');
    expect(state.loading).toBe(false);
  });
});

describe('usersSlice — updateUserRole thunk', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fulfilled — updates user in list', async () => {
    const updated = { ...sampleUser, role: 'ADMIN' };
    axiosInstance.put.mockResolvedValue({ data: { success: true, data: updated } });

    const store = makeStore();
    // Pre-load users
    store.dispatch({
      type: fetchUsers.fulfilled.type,
      payload: { users: [sampleUser, sampleUser2], pagination: null },
    });

    await store.dispatch(updateUserRole({ id: 'u1', role: 'ADMIN' }));
    const found = store.getState().users.users.find((u) => u._id === 'u1');
    expect(found.role).toBe('ADMIN');
  });

  it('rejected — sets error', async () => {
    axiosInstance.put.mockRejectedValue({
      response: { data: { message: 'Not found' } },
    });

    const store = makeStore();
    await store.dispatch(updateUserRole({ id: 'u99', role: 'ADMIN' }));
    expect(store.getState().users.error).toBe('Not found');
  });
});

describe('usersSlice — deleteUser thunk', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fulfilled — removes user from list', async () => {
    axiosInstance.delete.mockResolvedValue({ data: { success: true } });

    const store = makeStore();
    store.dispatch({
      type: fetchUsers.fulfilled.type,
      payload: { users: [sampleUser, sampleUser2], pagination: null },
    });

    await store.dispatch(deleteUser('u1'));
    const state = store.getState().users;
    expect(state.users).toHaveLength(1);
    expect(state.users[0]._id).toBe('u2');
  });

  it('rejected — sets error', async () => {
    axiosInstance.delete.mockRejectedValue({
      response: { data: { message: 'Cannot delete admin' } },
    });

    const store = makeStore();
    await store.dispatch(deleteUser('u2'));
    expect(store.getState().users.error).toBe('Cannot delete admin');
  });
});
