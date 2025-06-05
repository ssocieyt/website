import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, addDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { Send, ArrowLeft, Plus } from 'lucide-react';

const MessagesMobile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<any[]>([]);
  const [currentChat, setCurrentChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Tüm kullanıcıları getir (kendi dışındakiler)
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const allUsers = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.id !== user.uid); // Kendini listeden çıkar
      setUsersList(allUsers);
    });

    return () => unsubscribe();
  }, [user]);

  // Sohbetleri getir
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'conversations'), where('participants', 'array-contains', user.uid));
    const unsubscribe = onSnapshot(q, snapshot => {
      const convs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConversations(convs);
    });

    return () => unsubscribe();
  }, [user]);

  // Aktif sohbet ve mesajları getir
  useEffect(() => {
    if (!id) {
      setCurrentChat(null);
      setMessages([]);
      return;
    }

    const conv = conversations.find(c => c.id === id) || null;
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

  // Mesaj gönderme
  const sendMessage = async () => {
    if (!messageText.trim() || !currentChat || !user) return;

    const messagesRef = collection(db, 'conversations', currentChat.id, 'messages');

    await addDoc(messagesRef, {
      senderId: user.uid,
      text: messageText.trim(),
      timestamp: new Date(),
    });

    setMessageText('');
  };

  // Yeni sohbet oluşturma
  const createNewChat = async () => {
    if (!selectedUserId || !user) return;

    // Önce böyle bir sohbet var mı kontrol et (participants aynı 2 kullanıcı)
    const existingChat = conversations.find(conv => {
      const participants = conv.participants as string[];
      return (
        participants.length === 2 &&
        participants.includes(user.uid) &&
        participants.includes(selectedUserId)
      );
    });

    if (existingChat) {
      // Zaten varsa o sohbeti aç
      navigate(`/messages/${existingChat.id}`);
      setIsCreatingChat(false);
      setSelectedUserId(null);
      return;
    }

    // Yeni sohbet oluştur
    const convRef = await addDoc(collection(db, 'conversations'), {
      participants: [user.uid, selectedUserId],
      createdAt: new Date(),
      // Başlık opsiyonel, otomatik oluşturabiliriz:
      title: null,
    });

    setIsCreatingChat(false);
    setSelectedUserId(null);

    navigate(`/messages/${convRef.id}`);
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
        {currentChat ? (
          <button
            onClick={() => navigate('/messages')}
            aria-label="Geri"
            className="mr-3 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ArrowLeft size={24} />
          </button>
        ) : null}
        <h1 className="text-lg font-semibold flex-grow">
          {currentChat
            ? currentChat.title ||
              usersList.find(u => currentChat.participants.includes(u.id))?.displayName ||
              'Sohbet'
            : 'Mesajlar'}
        </h1>

        {!currentChat && (
          <button
            onClick={() => setIsCreatingChat(true)}
            aria-label="Yeni Sohbet Başlat"
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Plus size={24} />
          </button>
        )}
      </header>

      <main className="flex-1 overflow-auto">
        {!currentChat ? (
          <>
            {isCreatingChat ? (
              <div className="p-4">
                <h2 className="mb-2 font-semibold">Kullanıcı Seç</h2>
                <ul className="max-h-60 overflow-auto border border-gray-300 dark:border-gray-700 rounded">
                  {usersList.length === 0 ? (
                    <li className="p-2 text-gray-500">Kullanıcı bulunamadı.</li>
                  ) : (
                    usersList.map(u => (
                      <li
                        key={u.id}
                        className={`p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${
                          selectedUserId === u.id ? 'bg-purple-600 text-white' : ''
                        }`}
                        onClick={() => setSelectedUserId(u.id)}
                      >
                        {u.displayName || u.email || 'İsimsiz Kullanıcı'}
                      </li>
                    ))
                  )}
                </ul>
                <div className="mt-4 flex space-x-2">
                  <button
                    disabled={!selectedUserId}
                    onClick={createNewChat}
                    className="flex-1 bg-purple-600 disabled:bg-purple-400 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
                  >
                    Sohbet Başlat
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingChat(false);
                      setSelectedUserId(null);
                    }}
                    className="flex-1 border border-gray-400 dark:border-gray-600 rounded px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <ul>
                {conversations.length === 0 ? (
                  <p className="p-4 text-center text-gray-500">Sohbet yok</p>
                ) : (
                  conversations.map(conv => {
                    // Sohbet başlığını belirle, ya title ya da katılımcı adı
                    let title = conv.title;
                    if (!title) {
                      const otherUserId = user
                        ? conv.participants.find((pid: string) => pid !== user.uid)
                        : null;
                      const otherUser = usersList.find(u => u.id === otherUserId);
                      title = otherUser?.displayName || 'Sohbet';
                    }

                    return (
                      <li key={conv.id}>
                        <Link
                          to={`/messages/${conv.id}`}
                          className="block p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          {title}
                        </Link>
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">Henüz mesaj yok</p>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`max-w-xs px-3 py-2 rounded-lg break-words ${
                      msg.senderId === user?.uid
                        ? 'bg-purple-600 text-white self-end'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 self-start'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-2">
              <input
                type="text"
                className="flex-1 rounded border border-gray-300 dark:border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-800"
                placeholder="Mesaj yaz..."
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') sendMessage();
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!messageText.trim()}
                className="bg-purple-600 disabled:bg-purple-400 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MessagesMobile;
