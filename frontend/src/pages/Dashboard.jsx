import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fetchTasks } from '../store/slices/tasksSlice.js';
import useAuth from '../hooks/useAuth.js';
import Badge from '../components/UI/Badge.jsx';

const StatCard = ({ label, value, icon, color }) => (
  <div className="stat-card">
    <div className="stat-card-icon" style={{ background: `${color}20` }}>
      <span style={{ fontSize: '1.25rem' }}>{icon}</span>
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 500 }}>{label}</div>
    <div style={{
      position: 'absolute', top: 0, right: 0, width: '4px', height: '100%',
      background: color, borderRadius: '0 0.75rem 0.75rem 0', opacity: 0.7,
    }} />
  </div>
);

const SkeletonCard = () => (
  <div className="stat-card">
    <div className="skeleton" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem' }} />
    <div className="skeleton" style={{ width: '4rem', height: '2rem', marginTop: '0.5rem' }} />
    <div className="skeleton" style={{ width: '6rem', height: '0.875rem', marginTop: '0.5rem' }} />
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem',
        padding: '0.625rem 0.875rem', fontSize: '0.875rem',
      }}>
        <div style={{ color: '#94a3b8', marginBottom: '0.25rem' }}>{label}</div>
        <div style={{ color: '#f1f5f9', fontWeight: 700 }}>{payload[0].value} tasks</div>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tasks, loading } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks({ limit: 100 }));
  }, [dispatch]);

  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === 'TODO').length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const done = tasks.filter((t) => t.status === 'DONE').length;

  const chartData = [
    { name: 'Todo', count: todo, fill: '#94a3b8' },
    { name: 'In Progress', count: inProgress, fill: '#6366f1' },
    { name: 'Done', count: done, fill: '#22c55e' },
  ];

  const recent = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 800, color: '#f1f5f9' }}>
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''} 👋
          </h1>
          <p style={{ margin: '0.375rem 0 0', color: '#64748b' }}>Here's what's happening with your tasks today.</p>
        </div>
        <button
          onClick={() => navigate('/tasks/new')}
          className="btn btn-primary"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          id="dashboard-create-task"
        >
          + Create Task
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {loading ? (
          [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Tasks" value={total} icon="📋" color="#6366f1" />
            <StatCard label="Todo" value={todo} icon="🔲" color="#94a3b8" />
            <StatCard label="In Progress" value={inProgress} icon="⚡" color="#6366f1" />
            <StatCard label="Completed" value={done} icon="✅" color="#22c55e" />
          </>
        )}
      </div>

      {/* Chart + Recent table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* Chart */}
        <div className="card">
          <h2 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>Tasks by Status</h2>
          {loading ? (
            <div className="skeleton" style={{ height: '200px' }} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent tasks */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>Recent Tasks</h2>
            <button
              onClick={() => navigate('/tasks')}
              style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
            >
              View all →
            </button>
          </div>
          {loading ? (
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: '3rem' }} />)}
            </div>
          ) : recent.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
              <div>No tasks yet. <button onClick={() => navigate('/tasks/new')} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: 600 }}>Create one!</button></div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((task) => (
                  <tr
                    key={task._id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/tasks/${task._id}`)}
                  >
                    <td style={{ color: '#f1f5f9', maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.title}
                    </td>
                    <td><Badge type={task.priority} /></td>
                    <td><Badge type={task.status} label={task.status === 'IN_PROGRESS' ? 'In Progress' : task.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
