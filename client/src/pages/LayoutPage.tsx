import { Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { LogOut, User, Settings } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

export default function LayoutPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">ChatFlow</h1>
          </div>

          {/* User menu */}
          <div className="flex items-center gap-4 relative">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.displayName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold hover:bg-primary-dark transition"
            >
              {user?.displayName?.charAt(0).toUpperCase()}
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div className="absolute right-0 top-16 bg-white rounded-lg shadow-lg border border-gray-200 z-50 w-48">
                <button
                  onClick={() => {
                    navigate('/profile')
                    setMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition border-b border-gray-200"
                >
                  <User size={18} />
                  <span>View Profile</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/change-password')
                    setMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition border-b border-gray-200"
                >
                  <Settings size={18} />
                  <span>Change Password</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition text-red-600"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
