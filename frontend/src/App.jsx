import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import Analytics from './pages/Analytics'
import DailyActivity from './pages/DailyActivity'
import Dashboard from './pages/Dashboard'
import Goals from './pages/Goals'
import History from './pages/History'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Register from './pages/Register'

function GuestOnly({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="auth-layout"><div className="loading-state">Loading…</div></div>
  if (isAuthenticated) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestOnly>
            <Login />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <Register />
          </GuestOnly>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="activity" element={<DailyActivity />} />
          <Route path="history" element={<History />} />
          <Route path="goals" element={<Goals />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
