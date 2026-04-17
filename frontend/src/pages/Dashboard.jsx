import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fetchTasks } from '../store/slices/tasksSlice.js';
import useAuth from '../hooks/useAuth.js';
import Badge from '../components/UI/Badge.jsx';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'var(--surface-container-lowest)',
        border: '1px solid var(--outline-variant)',
        borderRadius: '0.625rem',
        padding: '0.625rem 0.875rem',
        fontSize: '0.875rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}>
        <div style={{ color: 'var(--outline)', marginBottom: '0.25rem' }}>{label}</div>
        <div style={{ color: 'var(--on-surface)', fontWeight: 700 }}>{payload[0].value} tasks</div>
      </div>
    );
  }
  return null;
};

const StatCard = ({ label, value, icon, accent, badge }) => (
  <div className="stat-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--outline)' }}>
          {label}
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.625rem' }}>
          <span style={{ fontFamily: 'var(--font-headline)', fontSize: '2rem', fontWeight: 800, color: 'var(--on-surface)', lineHeight: 1 }}>
            {value}
          </span>
          {badge && (
            <span style={{
              fontSize: '0.6875rem', fontWeight: 700,
              background: 'var(--primary-fixed)',
              color: 'var(--on-primary-fixed-variant)',
              borderRadius: '9999px', padding: '0.15rem 0.5rem',
              marginBottom: '0.125rem',
            }}>
              {badge}
            </span>
          )}
        </div>
      </div>
      <div style={{
        width: '2.5rem', height: '2.5rem',
        borderRadius: '0.625rem',
        background: `${accent}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.25rem',
      }}>
        {icon}
      </div>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="stat-card">
    <div className="skeleton" style={{ width: '6rem', height: '0.75rem', marginBottom: '0.5rem' }} />
    <div className="skeleton" style={{ width: '4rem', height: '2rem' }} />
  </div>
);

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
    { name: 'Todo',        count: todo,       fill: '#727783' },
    { name: 'In Progress', count: inProgress,  fill: '#00488d' },
    { name: 'Done',        count: done,        fill: '#22c55e' },
  ];

  const recent = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const username = user?.email ? user.email.split('@')[0] : '';

  return (
    <div className="page-enter" style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-headline)', margin: '0 0 0.375rem', fontSize: '1.875rem', fontWeight: 800, color: 'var(--on-surface)', letterSpacing: '-0.01em' }}>
            Project Workspace
          </h1>
          <p style={{ margin: 0, color: 'var(--on-surface-variant)' }}>
            Welcome back{username ? `, ${username}` : ''}! Here's your team's overview.
          </p>
        </div>

        {/* <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="card" style={{ padding: '0.875rem 1.25rem', borderRadius: '1rem', textAlign: 'center', minWidth: '120px' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--outline)', display: 'block', marginBottom: '0.25rem' }}>In Progress</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--on-surface)' }}>{inProgress}</span>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: 'var(--tertiary-fixed)', color: 'var(--tertiary)', borderRadius: '9999px', padding: '0.1rem 0.4rem' }}>+2 today</span>
            </div>
          </div>
          <div className="card" style={{ padding: '0.875rem 1.25rem', borderRadius: '1rem', textAlign: 'center', minWidth: '120px' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--outline)', display: 'block', marginBottom: '0.25rem' }}>Completed</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--on-surface)' }}>{done}</span>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>trending_up</span>
            </div>
          </div>
        </div> */}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {loading ? (
          [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Tasks"  value={total}      icon="📋" accent="#00488d"  />
            <StatCard label="Todo"         value={todo}       icon="🔲" accent="#727783" />
            <StatCard label="In Progress"  value={inProgress} icon="⚡" accent="#00488d" />
            <StatCard label="Completed"    value={done}       icon="✅" accent="#22c55e" />
          </>
        )}
      </div>

      {/* Content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Filters sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quick filters card */}
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-headline)', margin: '0 0 1.25rem', fontSize: '0.9375rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--on-surface)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.125rem', color: 'var(--primary)' }}>filter_list</span>
              Quick Filters
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="label">Priority</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {['All', 'High', 'Medium', 'Low'].map((p, i) => (
                    <button key={p} className={`filter-pill ${i === 0 ? 'active' : ''}`}>{p}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" style={{ fontSize: '0.875rem' }}>
                  <option>Everything</option>
                  <option>Todo</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
              </div>
            </div>
          </div>

          {/* Chart card */}
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-headline)', margin: '0 0 1.25rem', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--on-surface)' }}>Tasks by Status</h3>
            {loading ? (
              <div className="skeleton" style={{ height: '160px' }} />
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--outline)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--outline)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,72,141,0.05)' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Tip card */}
          {/* <div style={{
            borderRadius: '1.25rem',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
            padding: '1.5rem',
          }}>
            <p style={{ margin: '0 0 0.375rem', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary-fixed-dim)' }}>
              TaskArchitect Tip
            </p>
            <h4 style={{ fontFamily: 'var(--font-headline)', margin: 0, color: '#fff', fontSize: '1rem', fontWeight: 800, lineHeight: 1.35 }}>
              Master your flow with Time Blocking techniques.
            </h4>
          </div> */}
        </div>

        {/* Main tasks table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Table header action */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-container)' }}>
              <h2 style={{ fontFamily: 'var(--font-headline)', margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                Recent Tasks
              </h2>
              <button
                onClick={() => navigate('/tasks')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                View all
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_forward</span>
              </button>
            </div>

            {loading ? (
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: '3.5rem', borderRadius: '0.625rem' }} />)}
              </div>
            ) : recent.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--outline-variant)', display: 'block', marginBottom: '0.75rem' }}>assignment</span>
                <div style={{ fontWeight: 600 }}>No tasks yet.</div>
                <button onClick={() => navigate('/tasks/new')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, marginTop: '0.5rem' }}>
                  Create one!
                </button>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Task Details</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((task) => (
                    <tr key={task._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/tasks/${task._id}`)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '2.25rem', height: '2.25rem',
                            borderRadius: '50%',
                            background: 'var(--secondary-container)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: 'var(--primary)' }}>assignment</span>
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--on-surface)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {task.title}
                          </span>
                        </div>
                      </td>
                      <td><Badge type={task.priority} /></td>
                      <td><Badge type={task.status} label={task.status === 'IN_PROGRESS' ? 'In Progress' : task.status} /></td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.375rem', borderRadius: '0.5rem', color: 'var(--outline)' }}
                          onClick={(e) => { e.stopPropagation(); navigate(`/tasks/${task._id}`); }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div style={{ padding: '0.875rem 1.5rem', background: 'color-mix(in srgb, var(--surface-container-low) 50%, transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--surface-container)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--outline)' }}>Showing 1-{Math.min(5, total)} of {total} tasks</span>
              <button onClick={() => navigate('/tasks')} className="btn btn-ghost btn-sm">View All Tasks</button>
            </div>
          </div>

          {/* Bottom tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* <div className="card" style={{ background: 'color-mix(in srgb, var(--primary) 6%, transparent)', border: 'none' }}>
              <h4 style={{ fontFamily: 'var(--font-headline)', margin: '0 0 0.5rem', color: 'var(--primary)', fontWeight: 800 }}>Team Efficiency</h4>
              <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
                Completing tasks 15% faster than last month. Keep up the momentum!
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '3rem', height: '3rem', borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.875rem', fontWeight: 800, color: '#fff',
                }}>88%</div>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Active Productivity
                </span>
              </div>
            </div> */}

            {/* <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              <div>
                <h4 style={{ fontFamily: 'var(--font-headline)', margin: '0 0 0.375rem', fontWeight: 800, color: 'var(--on-surface)', fontSize: '1rem' }}>
                  Upcoming Milestone
                </h4>
                <p style={{ margin: '0 0 0.875rem', fontSize: '0.75rem', color: 'var(--outline)', lineHeight: 1.5 }}>
                  Beta Launch — Phase 2 is due in 4 days.
                </p>
                <button onClick={() => navigate('/tasks')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: 0 }}>
                  View Timeline
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_forward</span>
                </button>
              </div>
              <div style={{
                width: '4rem', height: '4rem', borderRadius: '0.875rem',
                background: 'var(--surface-container-lowest)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: 'rotate(-6deg)',
                flexShrink: 0,
              }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--outline-variant)', fontSize: '1.75rem' }}>auto_awesome</span>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
