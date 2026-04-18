"use client"

import { useState, useEffect, useRef } from "react"
import { X, Send, User } from "lucide-react"
import { useSocket } from "@/hooks/use-socket"
import { cn } from "@/lib/utils"

interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  receiverId: string
  content: string
  isRead: boolean
  createdAt: string
  senderName: string | null
  senderRole: string
}

interface ConversationItem {
  id: string
  dealerId: string
  adminId: string
  unreadCount: number
  dealer: {
    id: string
    name: string | null
    email: string
  }
}

interface MessageDrawerProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  role: "ADMIN" | "DEALER"
}

export function MessageDrawer({ isOpen, onClose, userId, role }: MessageDrawerProps) {
  const socket = useSocket(userId)
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch initial conversations or create one if dealer
  useEffect(() => {
    if (!isOpen) return

    fetch("/api/messages/conversations")
      .then(r => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          const list = data as ConversationItem[]
          setConversations(list)
          
          if (role === "DEALER" && list.length > 0) {
            setActiveConversationId(list[0].id)
            setActivePartnerId(list[0].adminId)
          }
        }
      })
      .catch(console.error)
  }, [isOpen, role])

  // Load messages when conversation changes
  useEffect(() => {
    if (!isOpen || !activeConversationId) return

    fetch(`/api/messages/${activeConversationId}`)
      .then(r => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          setMessages(data as ChatMessage[])
          scrollToBottom()
        }
      })
      .catch(console.error)

    // Mark as read
    fetch(`/api/messages/${activeConversationId}`, { method: "PATCH" })
      .catch(console.error)
    
    socket.emit("mark_read", { conversationId: activeConversationId, userId })
    socket.emit("join_conversation", activeConversationId)

  }, [isOpen, activeConversationId, socket, userId])

  // Socket listeners
  useEffect(() => {
    if (!isOpen) return

    const handleNewMessage = (msg: unknown) => {
      const message = msg as ChatMessage
      if (message.conversationId === activeConversationId) {
        setMessages(prev => {
          // Avoid duplicate optimistc messages
          if (prev.some(m => m.id === message.id)) return prev
          return [...prev, message]
        })
        scrollToBottom()

        // Mark as read immediately if it's open
        if (message.receiverId === userId) {
          socket.emit("mark_read", { conversationId: activeConversationId, userId })
          fetch(`/api/messages/${activeConversationId}`, { method: "PATCH" }).catch(() => {})
        }
      } else if (role === "ADMIN") {
        // Update unread count for other conversations
        setConversations(prev => prev.map(c => 
          c.id === message.conversationId ? { ...c, unreadCount: (c.unreadCount || 0) + 1 } : c
        ))
      }
    }

    socket.on("new_message", handleNewMessage)
    return () => { socket.off("new_message", handleNewMessage) }
  }, [isOpen, activeConversationId, socket, role, userId])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleSend = () => {
    if (!inputValue.trim() || !activeConversationId || !activePartnerId) return

    const content = inputValue.trim()
    setInputValue("")

    // Optimistic append
    const tempId = `temp-${Date.now()}`
    const optimisticMsg: ChatMessage = {
      id: tempId,
      conversationId: activeConversationId,
      senderId: userId,
      receiverId: activePartnerId,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
      senderName: "You",
      senderRole: role
    }
    setMessages(prev => [...prev, optimisticMsg])
    scrollToBottom()

    socket.emit("send_message", {
      conversationId: activeConversationId,
      senderId: userId,
      receiverId: activePartnerId,
      content
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Auto focus logic removed to keep it simpler

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-card border-l shadow-2xl transition-transform duration-300 ease-in-out sm:max-w-md md:max-w-xl",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <h2 className="font-semibold text-lg">Messages</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Admin Conversation List */}
          {role === "ADMIN" && (
            <div className="w-1/3 border-r overflow-y-auto flex flex-col bg-muted/20">
              {conversations.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveConversationId(c.id)
                    setActivePartnerId(c.dealerId)
                    // clear unread
                    setConversations(prev => prev.map(conv => conv.id === c.id ? { ...conv, unreadCount: 0 } : conv))
                  }}
                  className={cn(
                    "flex flex-col border-b p-3 text-left hover:bg-accent transition-colors",
                    activeConversationId === c.id && "bg-accent"
                  )}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-medium text-sm truncate">{c.dealer.name || "Dealer"}</span>
                    {c.unreadCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground truncate w-full mt-1">
                    {c.dealer.email}
                  </span>
                </button>
              ))}
              {conversations.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No conversations
                </div>
              )}
            </div>
          )}

          {/* Chat Area */}
          <div className={cn("flex flex-1 flex-col", role === "ADMIN" ? "w-2/3" : "w-full")}>
            {activeConversationId ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, i) => {
                    const isMe = msg.senderId === userId
                    return (
                      <div 
                        key={msg.id === `temp-${i}` ? msg.id + i : msg.id}
                        className={cn("flex flex-col", isMe ? "items-end" : "items-start")}
                      >
                        <div 
                          className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                            isMe 
                              ? "bg-primary text-primary-foreground rounded-tr-sm" 
                              : "bg-muted text-foreground rounded-tl-sm"
                          )}
                        >
                          {msg.content}
                        </div>
                        <span className="mt-1 text-[10px] text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="border-t p-3 bg-card">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 rounded-full border border-input bg-transparent px-4 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!inputValue.trim()}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground p-6 text-center">
                <User className="h-12 w-12 mb-4 opacity-20" />
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
