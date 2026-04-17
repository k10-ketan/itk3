import { useSelector, useDispatch } from 'react-redux';
import { loginUser, registerUser, logoutUser } from '../store/slices/authSlice.js';

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const login = (credentials) => dispatch(loginUser(credentials));
  const register = (userData) => dispatch(registerUser(userData));
  const logout = () => dispatch(logoutUser());

  const isAdmin = user?.role === 'ADMIN';

  return { user, isAuthenticated, loading, error, login, register, logout, isAdmin };
};

export default useAuth;
