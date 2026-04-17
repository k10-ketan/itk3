import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import useAuth from './hooks/useAuth.js';
import useSocket from './hooks/useSocket.js';
import { fetchCurrentUser } from './store/slices/authSlice.js';
import Spinner from './components/UI/Spinner.jsx';
import Toast from './components/UI/Toast.jsx';
import Navbar from './components/Layout/Navbar.jsx';
import Sidebar from './components/Layout/Sidebar.jsx';

const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Tasks = lazy(() => import('./pages/Tasks.jsx'));
const TaskDetail = lazy(() => import('./pages/TaskDetail.jsx'));
const CreateTask = lazy(() => import('./pages/CreateTask.jsx'));
const EditTask = lazy(() => import('./pages/EditTask.jsx'));
const AdminUsers = lazy(() => import('./pages/AdminUsers.jsx'));

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
    <Spinner size="lg" />
  </div>
);

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content" style={{ flex: 1 }}>
        <Navbar onMenuClick={() => setSidebarOpen((p) => !p)} />
        <main style={{ paddingTop: '1rem' }}>{children}</main>
      </div>
    </div>
  );
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();
  const [appReady, setAppReady] = useState(false);

  useSocket(isAuthenticated);

  useEffect(() => {
    const init = async () => {
      // Try to restore session from cookie
      if (!isAuthenticated) {
        try {
          // Try refresh silently
          const { default: axiosInstance } = await import('./api/axios.js');
          const res = await axiosInstance.post('/auth/refresh');
          if (res.status === 200) {
            // fetch user info from localStorage fallback or skip
          }
        } catch {
          // Not logged in
        }
      } else if (user) {
        dispatch(fetchCurrentUser(user.id || user._id));
      }
      setAppReady(true);
    };
    init();
  }, []); // eslint-disable-line

  if (!appReady) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Toast />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <AppLayout><Tasks /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/new"
            element={
              <ProtectedRoute>
                <AppLayout><CreateTask /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/:id"
            element={
              <ProtectedRoute>
                <AppLayout><TaskDetail /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/:id/edit"
            element={
              <ProtectedRoute>
                <AppLayout><EditTask /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly>
                <AppLayout><AdminUsers /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
