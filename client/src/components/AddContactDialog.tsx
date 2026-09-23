import { useState } from 'react'
import { contactService } from '../services/authService'
import { useConversationStore } from '../stores/conversationStore'
import { X, Search, AlertCircle } from 'lucide-react'

interface AddContactDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddContactDialog({ isOpen, onClose }: AddContactDialogProps) {
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState<string | null>(null)
  const { addContact } = useConversationStore()

  const handleSearch = async (query: string) => {
    setSearch(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setLoading(true)
    setError('')

    try {
      const results = await contactService.searchUsers(query)
      setSearchResults(results)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to search users')
    } finally {
      setLoading(false)
    }
  }

  const handleAddContact = async (email: string) => {
    setAdding(email)
    try {
      const newContact = await contactService.addContact(email)
      addContact(newContact)
      setSearch('')
      setSearchResults([])
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add contact')
    } finally {
      setAdding(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Add Contact</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">Searching...</p>
            </div>
          )}

          {/* Search results */}
          {!loading && search.length >= 2 && (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {searchResults.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No users found</p>
              ) : (
                searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {user.displayName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => handleAddContact(user.email)}
                      disabled={adding === user.email}
                      className="ml-3 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition disabled:opacity-50"
                    >
                      {adding === user.email ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Empty state */}
          {!loading && search.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Start typing to search for users
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
