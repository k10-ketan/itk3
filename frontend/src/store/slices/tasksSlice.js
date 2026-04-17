import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios.js';

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/tasks', { params });
    return { tasks: res.data.data, pagination: res.data.pagination };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch tasks');
  }
});

export const fetchTaskById = createAsyncThunk('tasks/fetchTaskById', async (id, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`/tasks/${id}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch task');
  }
});

export const createTask = createAsyncThunk('tasks/createTask', async (formData, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post('/tasks', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create task');
  }
});

export const updateTask = createAsyncThunk('tasks/updateTask', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(`/tasks/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update task');
  }
});

export const deleteTask = createAsyncThunk('tasks/deleteTask', async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/tasks/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete task');
  }
});

export const deleteDocument = createAsyncThunk('tasks/deleteDocument', async ({ docId, taskId }, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/documents/${docId}`);
    return { docId, taskId };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete document');
  }
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    currentTask: null,
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearTaskError(state) { state.error = null; },
    clearCurrentTask(state) { state.currentTask = null; },
    socketTaskCreated(state, action) {
      const exists = state.tasks.find((t) => t._id === action.payload.task._id);
      if (!exists) state.tasks.unshift(action.payload.task);
    },
    socketTaskUpdated(state, action) {
      const idx = state.tasks.findIndex((t) => t._id === action.payload.task._id);
      if (idx !== -1) state.tasks[idx] = action.payload.task;
      if (state.currentTask?._id === action.payload.task._id) {
        state.currentTask = action.payload.task;
      }
    },
    socketTaskDeleted(state, action) {
      state.tasks = state.tasks.filter((t) => t._id !== action.payload.taskId);
      if (state.currentTask?._id === action.payload.taskId) state.currentTask = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchTaskById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(createTask.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.unshift(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateTask.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.tasks[idx] = action.payload;
        state.currentTask = action.payload;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(deleteTask.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
        if (state.currentTask?._id === action.payload) state.currentTask = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(deleteDocument.fulfilled, (state, action) => {
        if (state.currentTask) {
          state.currentTask.documents = state.currentTask.documents.filter(
            (d) => (d._id || d) !== action.payload.docId
          );
        }
      });
  },
});

export const {
  clearTaskError,
  clearCurrentTask,
  socketTaskCreated,
  socketTaskUpdated,
  socketTaskDeleted,
} = tasksSlice.actions;
export default tasksSlice.reducer;
