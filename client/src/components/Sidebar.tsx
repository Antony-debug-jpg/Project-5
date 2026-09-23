import { Search, Plus, Settings } from 'lucide-react'

interface SidebarProps {
  open: boolean
}

export default function Sidebar({ open }: SidebarProps) {
  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col ${
        open ? 'w-64' : 'w-0 lg:w-64'
      }`}
    >
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* New conversation button */}
      <div className="p-4 border-b border-gray-200">
        <button className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary-dark transition">
          <Plus size={18} />
          New Chat
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {/* Placeholder conversations */}
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition group"
            >
              <div className="w-10 h-10 bg-gray-300 rounded-full mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-3/4 mb-1"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition text-gray-700">
          <Settings size={18} />
          <span className="text-sm">Settings</span>
        </button>
      </div>
    </aside>
  )
}
