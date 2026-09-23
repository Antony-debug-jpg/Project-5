import { useEffect, useState } from 'react'
import { Star, Trash2, MessageCircle } from 'lucide-react'
import { contactService, conversationService } from '../services/authService'
import { useConversationStore } from '../stores/conversationStore'
import AddContactDialog from './AddContactDialog'

export default function ContactsList() {
  const { contacts, setContacts, removeContact, updateContact } = useConversationStore()
  const { addConversation, setSelectedConversationId } = useConversationStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      setError('')
      const contactList = await contactService.getContacts()
      setContacts(contactList)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveContact = async (contactId: string) => {
    if (!confirm('Remove this contact?')) return

    try {
      await contactService.removeContact(contactId)
      removeContact(contactId)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove contact')
    }
  }

  const handleToggleFavorite = async (contactId: string, isFavorite: boolean) => {
    try {
      await contactService.updateContact(contactId, { isFavorite: !isFavorite })
      updateContact(contactId, { isFavorite: !isFavorite })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update contact')
    }
  }

  const handleStartConversation = async (userId: string) => {
    try {
      const conversation = await conversationService.createConversation(userId)
      addConversation(conversation)
      setSelectedConversationId(conversation.id)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start conversation')
    }
  }

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const favorites = filteredContacts.filter((c) => c.isFavorite)
  const others = filteredContacts.filter((c) => !c.isFavorite)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Contacts</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          <button
            onClick={() => setShowAddDialog(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition whitespace-nowrap"
          >
            Add
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading contacts...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <p className="mb-2">No contacts yet</p>
            <button
              onClick={() => setShowAddDialog(true)}
              className="text-primary hover:underline text-sm"
            >
              Add your first contact
            </button>
          </div>
        ) : (
          <div className="space-y-0">
            {/* Favorites */}
            {favorites.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ⭐ Favorites
                </div>
                <div className="space-y-0">
                  {favorites.map((contact) => (
                    <ContactItem
                      key={contact.id}
                      contact={contact}
                      onRemove={handleRemoveContact}
                      onToggleFavorite={handleToggleFavorite}
                      onStartConversation={handleStartConversation}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Others */}
            {others.length > 0 && (
              <div>
                {favorites.length > 0 && (
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider mt-2">
                    📋 All Contacts
                  </div>
                )}
                <div className="space-y-0">
                  {others.map((contact) => (
                    <ContactItem
                      key={contact.id}
                      contact={contact}
                      onRemove={handleRemoveContact}
                      onToggleFavorite={handleToggleFavorite}
                      onStartConversation={handleStartConversation}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Contact Dialog */}
      <AddContactDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />
    </div>
  )
}

interface ContactItemProps {
  contact: any
  onRemove: (contactId: string) => void
  onToggleFavorite: (contactId: string, isFavorite: boolean) => void
  onStartConversation: (userId: string) => void
}

function ContactItem({
  contact,
  onRemove,
  onToggleFavorite,
  onStartConversation,
}: ContactItemProps) {
  return (
    <div className="px-4 py-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 mt-1">
          {contact.user.displayName?.charAt(0).toUpperCase()}
        </div>

        {/* Contact info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{contact.nickname}</p>
          <p className="text-xs text-gray-500 truncate">{contact.user.email}</p>
          {contact.user.aboutText && (
            <p className="text-xs text-gray-600 truncate mt-0.5">{contact.user.aboutText}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onStartConversation(contact.userId)}
            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition"
            title="Start conversation"
          >
            <MessageCircle size={16} />
          </button>
          <button
            onClick={() => onToggleFavorite(contact.id, contact.isFavorite)}
            className={`p-2 rounded-lg transition ${
              contact.isFavorite
                ? 'text-yellow-500 bg-yellow-50'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
            title={contact.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star size={16} fill={contact.isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => onRemove(contact.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Remove contact"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
