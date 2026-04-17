import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import tasksReducer, {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  socketTaskCreated,
  socketTaskUpdated,
  socketTaskDeleted,
  clearTaskError,
} from '../store/slices/tasksSlice.js';

vi.mock('../api/axios.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import axiosInstance from '../api/axios.js';

const makeStore = () =>
  configureStore({ reducer: { tasks: tasksReducer } });

const sampleTask = {
  _id: 'task1',
  title: 'Test Task',
  description: 'A test task',
  status: 'TODO',
  priority: 'HIGH',
  documents: [],
  createdBy: { _id: 'user1', email: 'user@test.com' },
};

const sampleTask2 = {
  _id: 'task2',
  title: 'Another Task',
  status: 'IN_PROGRESS',
  priority: 'MEDIUM',
  documents: [],
};

describe('tasksSlice — initial state', () => {
  it('should have correct initial state', () => {
    const store = makeStore();
    const state = store.getState().tasks;
    expect(state.tasks).toEqual([]);
    expect(state.currentTask).toBeNull();
    expect(state.pagination).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });
});

describe('tasksSlice — fetchTasks thunk', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fulfilled — sets tasks array and pagination', async () => {
    const pagination = { page: 1, limit: 10, total: 2, totalPages: 1 };
    axiosInstance.get.mockResolvedValue({
      data: { success: true, data: [sampleTask, sampleTask2], pagination },
    });

    const store = makeStore();
    await store.dispatch(fetchTasks());
    const state = store.getState().tasks;

    expect(state.tasks).toHaveLength(2);
    expect(state.tasks[0]._id).toBe('task1');
    expect(state.pagination).toEqual(pagination);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('pending — sets loading true', () => {
    const store = makeStore();
    store.dispatch({ type: fetchTasks.pending.type });
    expect(store.getState().tasks.loading).toBe(true);
  });

  it('rejected — sets error', async () => {
    axiosInstance.get.mockRejectedValue({
      response: { data: { message: 'Unauthorized' } },
    });

    const store = makeStore();
    await store.dispatch(fetchTasks());
    expect(store.getState().tasks.error).toBe('Unauthorized');
    expect(store.getState().tasks.loading).toBe(false);
  });
});

describe('tasksSlice — createTask thunk', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fulfilled — prepends task to tasks array', async () => {
    axiosInstance.post.mockResolvedValue({
      data: { success: true, data: sampleTask },
    });

    const store = makeStore();
    await store.dispatch(createTask(new FormData()));
    const state = store.getState().tasks;

    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0]._id).toBe('task1');
  });

  it('rejected — sets error', async () => {
    axiosInstance.post.mockRejectedValue({
      response: { data: { message: 'Title is required.' } },
    });

    const store = makeStore();
    await store.dispatch(createTask(new FormData()));
    expect(store.getState().tasks.error).toBe('Title is required.');
  });
});

describe('tasksSlice — updateTask thunk', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fulfilled — replaces task in state', async () => {
    const updated = { ...sampleTask, title: 'Updated Title', status: 'DONE' };
    axiosInstance.put.mockResolvedValue({ data: { success: true, data: updated } });

    const store = makeStore();
    // Pre-load tasks
    store.dispatch({ type: fetchTasks.fulfilled.type, payload: { tasks: [sampleTask, sampleTask2], pagination: null } });
    await store.dispatch(updateTask({ id: 'task1', formData: new FormData() }));

    const state = store.getState().tasks;
    const found = state.tasks.find((t) => t._id === 'task1');
    expect(found.title).toBe('Updated Title');
    expect(found.status).toBe('DONE');
    expect(state.currentTask).toEqual(updated);
  });
});

describe('tasksSlice — deleteTask thunk', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fulfilled — removes task from state', async () => {
    axiosInstance.delete.mockResolvedValue({ data: { success: true } });

    const store = makeStore();
    store.dispatch({ type: fetchTasks.fulfilled.type, payload: { tasks: [sampleTask, sampleTask2], pagination: null } });
    await store.dispatch(deleteTask('task1'));

    const state = store.getState().tasks;
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0]._id).toBe('task2');
  });
});

describe('tasksSlice — socket real-time reducers', () => {
  it('socketTaskCreated — adds task if not exists', () => {
    const store = makeStore();
    store.dispatch(socketTaskCreated({ task: sampleTask }));
    expect(store.getState().tasks.tasks).toHaveLength(1);
  });

  it('socketTaskCreated — does not duplicate existing task', () => {
    const store = makeStore();
    store.dispatch({ type: fetchTasks.fulfilled.type, payload: { tasks: [sampleTask], pagination: null } });
    store.dispatch(socketTaskCreated({ task: sampleTask }));
    expect(store.getState().tasks.tasks).toHaveLength(1);
  });

  it('socketTaskUpdated — replaces task in list', () => {
    const store = makeStore();
    store.dispatch({ type: fetchTasks.fulfilled.type, payload: { tasks: [sampleTask], pagination: null } });
    const updated = { ...sampleTask, title: 'Socket Updated' };
    store.dispatch(socketTaskUpdated({ task: updated }));
    expect(store.getState().tasks.tasks[0].title).toBe('Socket Updated');
  });

  it('socketTaskDeleted — removes task by id', () => {
    const store = makeStore();
    store.dispatch({ type: fetchTasks.fulfilled.type, payload: { tasks: [sampleTask, sampleTask2], pagination: null } });
    store.dispatch(socketTaskDeleted({ taskId: 'task1' }));
    const state = store.getState().tasks;
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0]._id).toBe('task2');
  });
});

describe('tasksSlice — clearTaskError reducer', () => {
  it('clears the error field', () => {
    const store = makeStore();
    store.dispatch({ type: fetchTasks.rejected.type, payload: 'Some error' });
    expect(store.getState().tasks.error).toBe('Some error');
    store.dispatch(clearTaskError());
    expect(store.getState().tasks.error).toBeNull();
  });
});
