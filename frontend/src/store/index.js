import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import tasksReducer from './slices/tasksSlice.js';
import usersReducer from './slices/usersSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    users: usersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
