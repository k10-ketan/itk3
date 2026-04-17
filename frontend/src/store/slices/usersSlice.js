import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios.js';

export const fetchUsers = createAsyncThunk('users/fetchUsers', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/users', { params });
    return { users: res.data.data, pagination: res.data.pagination };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch users');
  }
});

export const updateUserRole = createAsyncThunk('users/updateUserRole', async ({ id, role }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(`/users/${id}`, { role });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update user');
  }
});

export const deleteUser = createAsyncThunk('users/deleteUser', async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/users/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete user');
  }
});

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearUsersError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u) => u._id === action.payload._id);
        if (idx !== -1) state.users[idx] = action.payload;
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.error = action.payload;
      });

    builder
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;
