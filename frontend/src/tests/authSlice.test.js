import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  loginUser,
  registerUser,
  logoutUser,
  clearAuthError,
  setUser,
} from '../store/slices/authSlice.js';

// Mock axios
vi.mock('../api/axios.js', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import axiosInstance from '../api/axios.js';

const makeStore = () =>
  configureStore({ reducer: { auth: authReducer } });

describe('authSlice — initial state', () => {
  it('should have correct initial state', () => {
    const store = makeStore();
    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });
});

describe('authSlice — setUser reducer', () => {
  it('should set user and isAuthenticated=true when user is provided', () => {
    const store = makeStore();
    const user = { _id: '1', email: 'test@test.com', role: 'USER' };
    store.dispatch(setUser(user));
    const state = store.getState().auth;
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should clear user and isAuthenticated=false when null is passed', () => {
    const store = makeStore();
    store.dispatch(setUser({ _id: '1', email: 'test@test.com', role: 'USER' }));
    store.dispatch(setUser(null));
    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});

describe('authSlice — clearAuthError reducer', () => {
  it('should clear the error', () => {
    const store = makeStore();
    // Simulate an error by dispatching rejected login
    const action = { type: loginUser.rejected.type, payload: 'Some error' };
    store.dispatch(action);
    expect(store.getState().auth.error).toBe('Some error');
    store.dispatch(clearAuthError());
    expect(store.getState().auth.error).toBeNull();
  });
});

describe('authSlice — loginUser thunk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login fulfilled — sets user and isAuthenticated', async () => {
    const user = { _id: '1', email: 'admin@test.com', role: 'ADMIN' };
    axiosInstance.post.mockResolvedValue({ data: { success: true, data: user } });

    const store = makeStore();
    await store.dispatch(loginUser({ email: 'admin@test.com', password: 'Admin@123' }));

    const state = store.getState().auth;
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('login rejected — sets error and isAuthenticated stays false', async () => {
    axiosInstance.post.mockRejectedValue({
      response: { data: { message: 'Invalid email or password.' } },
    });

    const store = makeStore();
    await store.dispatch(loginUser({ email: 'bad@test.com', password: 'wrong' }));

    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe('Invalid email or password.');
    expect(state.loading).toBe(false);
  });

  it('login pending — sets loading true', () => {
    const store = makeStore();
    store.dispatch({ type: loginUser.pending.type });
    expect(store.getState().auth.loading).toBe(true);
    expect(store.getState().auth.error).toBeNull();
  });
});

describe('authSlice — registerUser thunk', () => {
  beforeEach(() => vi.clearAllMocks());

  it('register fulfilled — clears loading, no error', async () => {
    axiosInstance.post.mockResolvedValue({
      data: { success: true, data: { _id: '2', email: 'new@test.com', role: 'USER' } },
    });

    const store = makeStore();
    const result = await store.dispatch(registerUser({ email: 'new@test.com', password: 'Secret@123' }));

    expect(result.meta.requestStatus).toBe('fulfilled');
    const state = store.getState().auth;
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('register rejected — sets error', async () => {
    axiosInstance.post.mockRejectedValue({
      response: { data: { message: 'Email already registered.' } },
    });

    const store = makeStore();
    await store.dispatch(registerUser({ email: 'dup@test.com', password: 'Test@123' }));
    expect(store.getState().auth.error).toBe('Email already registered.');
  });
});

describe('authSlice — logoutUser thunk', () => {
  it('logout fulfilled — clears user and isAuthenticated', async () => {
    axiosInstance.post.mockResolvedValue({ data: { success: true } });

    const store = makeStore();
    store.dispatch(setUser({ _id: '1', email: 'u@u.com', role: 'USER' }));
    await store.dispatch(logoutUser());

    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
