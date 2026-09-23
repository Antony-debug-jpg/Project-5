import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import LayoutPage from './pages/LayoutPage'
import { useAuthStore } from './stores/authStore'

const queryClient = new QueryClient()

export default function App() {
  const { token } = useAuthStore()
  const isAuthenticated = !!token

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {isAuthenticated ? (
            <>
              <Route path="/" element={<LayoutPage />}>
                <Route index element={<ChatPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="change-password" element={<ChangePasswordPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          )}
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}
