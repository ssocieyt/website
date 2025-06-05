import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, addDoc, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { Send, ArrowLeft, Plus, Search, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Messages: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [conversations, setConversations] = useState<any[]>([]);
  const [currentChat, setCurrentChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [followedUsers, setFollowedUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Fetch conversations
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessage.timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const convs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConversations(convs);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch followed users
  useEffect(() => {
    if (!user) return;

    const fetchFollowedUsers = async () => {
      const userDoc = await getDocs(query(collection(db, 'users'), where('followers', 'array-contains', user.uid)));
      setFollowedUsers(userDoc.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchFollowedUsers();
  }, [user]);

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(followedUsers);
      return;
    }

    const filtered = followedUsers.filter(user =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, followedUsers]);

  // Fetch current chat messages
  useEffect(() => {
    if (!id) {
      setCurrentChat(null);
      setMessages([]);
      return;
    }

    const conv = conversations.find(c => c.id === id);
    setCurrentChat(conv);

    if (!conv) return;

    const messagesRef = collection(db, 'conversations', id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, snapshot => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [id, conversations]);

  const startNewChat = async (selectedUserId: string) => {
    if (!user || !selectedUserId) return;

    // Check if conversation already exists
    const existingChat = conversations.find(conv => {
      const participants = conv.participants as string[];
      return participants.length === 2 &&
        participants.includes(user.uid) &&
        participants.includes(selectedUserId);
    });

    if (existingChat) {
      navigate(`/messages/${existingChat.id}`);
      setShowNewChat(false);
      setSelectedUser(null);
      return;
    }

    // Create new conversation
    const convRef = await addDoc(collection(db, 'conversations'), {
      participants: [user.uid, selectedUserId],
      lastMessage: {
        text: '',
        senderId: '',
        timestamp: new Date()
      },
      createdAt: new Date()
    });

    setShowNewChat(false);
    setSelectedUser(null);
    navigate(`/messages/${convRef.id}`);
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !currentChat || !user) return;

    const messagesRef = collection(db, 'conversations', currentChat.id, 'messages');
    const message = {
      senderId: user.uid,
      text: messageText.trim(),
      timestamp: new Date()
    };

    await addDoc(messagesRef, message);
    setMessageText('');
  };

  return (
    <div className={`h-[calc(100vh-4rem)] flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {showNewChat ? (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
            <button
              onClick={() => setShowNewChat(false)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-lg font-semibold">New Message</h2>
            <div className="w-10" /> {/* Spacer for alignment */}
          </div>

          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-800 text-white placeholder-gray-400'
                    : 'bg-white text-gray-900 placeholder-gray-500'
                } border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => startNewChat(user.id)}
                  className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition`}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-purple-500 flex items-center justify-center">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <User size={24} className="text-white" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{user.displayName}</div>
                    <div className="text-sm text-gray-500">@{user.username}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No users found
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex h-full">
          {/* Conversations List */}
          <div className={`w-full md:w-80 border-r dark:border-gray-700 ${currentChat ? 'hidden md:block' : ''}`}>
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Messages</h2>
              <button
                onClick={() => setShowNewChat(true)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Plus size={24} />
              </button>
            </div>

            <div className="overflow-y-auto h-[calc(100%-4rem)]">
              {conversations.map(conv => {
                const otherParticipant = conv.participants.find((p: string) => p !== user?.uid);
                const otherUser = followedUsers.find(u => u.id === otherParticipant);

                return (
                  <Link
                    key={conv.id}
                    to={`/messages/${conv.id}`}
                    className={`block p-4 border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
                      conv.id === id ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-purple-500 flex items-center justify-center">
                        {otherUser?.photoURL ? (
                          <img src={otherUser.photoURL} alt={otherUser.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <User size={24} className="text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{otherUser?.displayName || 'Unknown User'}</div>
                        <div className="text-sm text-gray-500">
                          {conv.lastMessage?.text || 'No messages yet'}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Chat Area */}
          {currentChat ? (
            <div className="flex-1 flex flex-col h-full">
              <div className="p-4 border-b dark:border-gray-700 flex items-center space-x-3">
                <button
                  onClick={() => navigate('/messages')}
                  className="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <ArrowLeft size={24} />
                </button>
                {currentChat && (
                  <>
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-500 flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {followedUsers.find(u => currentChat.participants.includes(u.id))?.displayName || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{followedUsers.find(u => currentChat.participants.includes(u.id))?.username}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-lg ${
                        msg.senderId === user?.uid
                          ? 'bg-purple-500 text-white'
                          : darkMode
                          ? 'bg-gray-800'
                          : 'bg-gray-200'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t dark:border-gray-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className={`flex-1 px-4 py-2 rounded-lg ${
                      darkMode
                        ? 'bg-gray-800 text-white placeholder-gray-400'
                        : 'bg-white text-gray-900 placeholder-gray-500'
                    } border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!messageText.trim()}
                    className="p-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="text-center">
                <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
                <p className="text-gray-500">
                  Choose from your existing conversations or start a new one
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Messages;