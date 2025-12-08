import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import ChatInfo from '../components/chat/ChatInfo';
import Sidebar from '../components/layout/Sidebar';
import { socketManager } from '../api/socket';
import { debounce } from 'lodash';
import { useAuth } from '../contexts/AuthContext';
import Profile from '../components/chat/Profile';
import { BASE_URL } from '../config/constants';

// -----------------------------
// Types
// -----------------------------
interface Attachment {
  id?: string;
  url: string;
  name: string;
  size?: string;
  type: 'image' | 'file';
}

interface Message {
  id: string;
  channelId: string;

  sender: {
    id: string;
    name: string;
    avatar?: string;
  };

  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'seen' | 'sent';
  isCurrentUser: boolean;

  replyTo?: string | null;
  forwardedFrom?: string | null;
  seenBy?: string[];
  tempId?: string | null;

  attachments?: Attachment[];
}

interface Channel {
  id: string;
  name: string;
  type: string;
  users: { id: string; name: string; avatar?: string }[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

interface ChatPageProps {
  isMobile: boolean;
  activeChat: string | null;
  onChatSelect: (chatId: string) => void;
  onBackToChats: () => void;
  setActiveSection: (
    section: 'chats' | 'calls' | 'files' | 'meet' | 'apps'
  ) => void;
  channels: Channel[];
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
}






const normalizeMessage = (
  raw: any,
  currentUserId?: string,
  channel?: Channel
): Message => {

  // Find sender in channel users (always has correct avatar)
  const senderFromChannel =
    channel?.users?.find(
      (u) =>
        u.id === raw.sender?.id ||
        u.id === raw.user ||
        u.id === raw.sender // some socket events may send raw.sender = id
    ) || null;

  return {
    id: raw.id || raw._id,
    channelId: raw.channelId,

    sender: {
      id: raw.sender?.id || raw.user || senderFromChannel?.id || "",
      name:
        raw.sender?.name ||
        senderFromChannel?.name ||
        "",
      avatar:
        senderFromChannel?.avatar ||   // <-- ALWAYS TAKE FROM CHANNEL
        raw.sender?.avatar ||           // fallback if channel missing
        "",
    },

    content: raw.content || raw.text || "",
    timestamp: raw.timestamp || raw.createdAt || new Date().toISOString(),
    status: raw.status || "sent",

    isCurrentUser:
      (raw.sender?.id || raw.user) === currentUserId,

    replyTo: raw.replyTo ?? null,
    forwardedFrom: raw.forwardedFrom ?? null,
    seenBy: raw.seenBy ?? [],
    tempId: raw.tempId ?? null,

    attachments: raw.attachments ?? [],
  };
};


const ChatPage: React.FC<ChatPageProps> = ({
  isMobile,
  activeChat,
  onChatSelect,
  onBackToChats,
  setActiveSection,
  channels,
  setChannels,
}) => {
  const [isChatInfoOpen, setIsChatInfoOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [hasUnseenMessages, setHasUnseenMessages] = useState(false);
  const { user } = useAuth();
  const [userM, setuserM] = useState(false);
  const [cachedAvatar, setCachedAvatar] = useState<string>('');

  const messageCache = useRef<Record<string, Message[]>>({});

  const currentChannel = channels.find((ch) => ch.id === activeChat);

  const otherUser = React.useMemo(() => {
    if (!currentChannel || !user) return null;

    // direct chat: return the correct other user
    if (currentChannel.type === 'direct') {
      return currentChannel.users.find((u) => u.id !== user.id) || null;
    }

    return null;
  }, [currentChannel, user]);


  const getDisplayName = () => {
    if (!currentChannel || !user) return '';
    if (currentChannel.type === 'direct') {
      const other = currentChannel.users.find((u) => u.id !== user.id);
      return other?.name || 'Direct Chat';
    }
    return currentChannel.name;
  };

  useEffect(() => {
    if (otherUser?.avatar) {
      setCachedAvatar(api.defaults.baseURL + otherUser.avatar);
    } else {
      setCachedAvatar('');
    }
  }, [otherUser?.avatar]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || '';
    socketManager.initializeSocket(token);
    return () => { };
  }, [user?.id]);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await api.get('/channels', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });
        const data = Array.isArray(response.data) ? response.data : response.data.channels || [];
        const sortedChannels = data
          .map((ch: any) => ({
            id: ch.id,
            name: ch.name,
            type: ch.type,
            users: ch.users,
            lastMessage: ch.lastMessage,
            lastMessageTime: ch.lastMessageTime,
            unreadCount: ch.unreadCount || 0,
          }))
          .sort((a: Channel, b: Channel) => {
            const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
            const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
            return timeB - timeA;
          });
        setChannels(sortedChannels);
      } catch (error) {
        setChannels([]);
      }
    };
    fetchChannels();
  }, [setChannels]);

  // Load messages + caching
  useEffect(() => {
    if (!activeChat) return;

    if (messageCache.current[activeChat]) {
      setMessages(messageCache.current[activeChat]);
    } else {
      setMessages([]);
    }

    socketManager.joinChannel(activeChat);

    const fetchMessages = async () => {
      if (messageCache.current[activeChat]) return;

      try {
        const response = await api.get(`/message/messages`, {
          params: { channelId: activeChat },
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });

        const data = response.data;

        const normalized = Array.from(
          new Map(
            data.map((msg: any) => [msg.id, normalizeMessage(msg, user?.id)])
          ).values()
        );

        messageCache.current[activeChat] = normalized;
        setMessages(normalized);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    return () => {
      socketManager.leaveChannel(activeChat);
    };
  }, [activeChat, user?.id]);

  // SOCKET: receive messages
  useEffect(() => {
    const socket = socketManager.getSocket();
    if (!socket) return;

    const handleReceiveMessage = (rawMsg: any) => {
      const formatted = normalizeMessage(rawMsg, user?.id);
      console.log('Received message:', formatted);
      setMessages((prev) => {
        let updated = [...prev];
        if (formatted.isCurrentUser) {
          updated = updated.filter((m) => !m.tempId);
        }
        // If this message is a reply and the replied-to message is missing, add a stub
        if (formatted.replyTo && !updated.some(m => m.id === formatted.replyTo)) {
          updated = [
            ...updated,
            {
              id: formatted.replyTo,
              channelId: formatted.channelId,
              sender: { id: '', name: 'Unknown', avatar: '' },
              content: '',
              timestamp: '',
              status: 'sent',
              isCurrentUser: false,
              replyTo: null,
              forwardedFrom: null,
              seenBy: [],
              tempId: null,
              attachments: [],
            }
          ];
          console.log('Added stub for replied-to message:', formatted.replyTo);
        }
        if (updated.some((m) => m.id === formatted.id)) return updated;
        updated = [...updated, formatted];
        messageCache.current[formatted.channelId] = updated;
        console.log('Updated messages state:', updated);
        return updated;
      });
    };

    // Listen for normal and reply messages
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('replyMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('replyMessage', handleReceiveMessage);
    };
  }, [activeChat, user?.id]);

  // SEND MESSAGE
  const handleSendMessage = async (content: string, attachments: File[], replyTo?: string) => {
    if (!activeChat || !user) return;

    const formData = new FormData();
    formData.append('channelId', activeChat);
    formData.append('text', content);
    if (replyTo) formData.append('replyTo', replyTo);
    attachments.forEach((file) => formData.append('files', file));

    const tempId = `temp-${Date.now()}`;
    const tempRaw = {
      id: tempId,
      tempId,
      channelId: activeChat,
      sender: { id: user.id, name: user.name, avatar: user.avatar },
      content,
      timestamp: new Date().toISOString(),
      status: 'sent',
      replyTo: replyTo ?? null,
      attachments: [],
    };
    const tempMessage = normalizeMessage(tempRaw, user.id);

    setMessages((prev) => {
      let updated = [...prev, tempMessage];
      if (replyTo && !prev.some(m => m.id === replyTo)) {
        updated = [
          ...prev,
          {
            id: replyTo,
            channelId: activeChat,
            sender: { id: '', name: 'Unknown', avatar: '' },
            content: '',
            timestamp: new Date().toISOString(),
            status: 'sent',
            isCurrentUser: false,
            replyTo: null,
            forwardedFrom: null,
            seenBy: [],
            tempId: null,
            attachments: [],
          },
          tempMessage,
        ];
        api.get(`/message/messages${replyTo}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        }).then(res => {
          const realMsg = normalizeMessage(res.data, user.id);
          setMessages((prev2) => prev2.map(m => m.id === replyTo ? realMsg : m));
        }).catch(() => {});
      }
      messageCache.current[activeChat] = updated;
      return updated;
    });

    try {
      const res = await api.post('/message/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const savedMessage = normalizeMessage(res.data, user.id);
      setMessages((prev) => {
        const updated = prev.map((m) => (m.id === tempId ? savedMessage : m));
        messageCache.current[activeChat] = updated;
        return updated;
      });
      // Emit replyMessage via socket if replyTo is present
      if (replyTo) {
        socketManager.getSocket()?.emit('replyMessage', {
          ...savedMessage,
          channelId: activeChat,
          replyTo,
        });
      }
    } catch (err) {
      console.error('Send message failed:', err);
    }
    setReplyingTo(null);
  };

  // DELETE
  const handleDeleteMessage = async (messageId: string) => {
    if (!activeChat || !user) return;

    try {
      await api.delete(`/message/delete/${messageId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });

      setMessages((prev) => {
        const updated = prev.filter((m) => m.id !== messageId);
        messageCache.current[activeChat] = updated;
        return updated;
      });

      socketManager.getSocket()?.emit('deleteMessage', { messageId, channelId: activeChat });
    } catch (err) {
      console.error('Delete message failed:', err);
    }
  };

  // EDIT
  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!activeChat || !user) return;

    try {
      setMessages((prev) => {
        const updated = prev.map((m) => (m.id === messageId ? { ...m, content: newContent } : m));
        messageCache.current[activeChat] = updated;
        return updated;
      });

      await api.put(
        `/message/edit/${messageId}`,
        { newText: newContent },
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
      );

      socketManager.getSocket()?.emit('editMessage', { messageId, newContent, channelId: activeChat });
    } catch (err) {
      console.error('Edit message failed:', err);
    }
  };

  const handleReplymessage = (messageId: string) => {
    const msg = messages.find((m) => m.id === messageId) || null;
    setReplyingTo(msg);
  };

  const getChatAvatar = () => {
    if (!currentChannel) return '';
    if (currentChannel.type === 'direct') {
      const other = currentChannel.users.find((u) => u.id !== user?.id);
      return other?.avatar ? `${BASE_URL}${other.avatar}` : '';
    }
    // For group, use channel avatar if available, else blank
    return currentChannel.avatar ? `${BASE_URL}${currentChannel.avatar}` : '';
  };

  return (
    <>
      <div className={`${isMobile && activeChat ? 'hidden' : 'block'} lg:block lg:w-80 h-full`}>
        <Sidebar
          isMobile={isMobile}
          isOpen={true}
          onToggle={() => { }}
          activeChat={activeChat}
          onChatSelect={onChatSelect}
          chats={channels}
          setChats={setChannels}
          isGroupChat={(ch: Channel) => ch.type === 'group'}
        />
      </div>

      <div className={`flex-1 flex flex-col h-full ${isMobile && !activeChat ? 'hidden' : 'block'}`}>
        {activeChat ? (
          <>
            <ChatHeader
              name={getDisplayName()}
              status={'online'}
              avatar={getChatAvatar()}
              onToggleInfo={() => setIsChatInfoOpen(!isChatInfoOpen)}
              onBack={isMobile ? onBackToChats : undefined}
              isMobile={isMobile}
              type={currentChannel?.type}
              memberCount={currentChannel?.type === 'group' ? currentChannel?.users.length : undefined}
            />

            <div className="flex w-full h-full overflow-hidden">
              <div className={`flex flex-col flex-1 min-w-0 ${isChatInfoOpen && !isMobile ? 'hidden lg:flex' : ''}`}>
                <MessageList
                  messages={messages}
                  activeChat={activeChat}
                  onEditMessage={handleEditMessage}
                  onDeleteMessage={handleDeleteMessage}
                  onReplyMessage={handleReplymessage}
                />
                <MessageInput
                  onSendMessage={handleSendMessage}
                  onTyping={() => { }}
                  replyingTo={replyingTo}
                  onCancelReply={() => setReplyingTo(null)}
                />
              </div>

              {isChatInfoOpen && (
                <ChatInfo
                  name={getDisplayName()}
                  status={'online'}
                  avatar={getChatAvatar()}
                  members={currentChannel?.type === 'group' ? currentChannel?.users : undefined}
                  onClose={() => setIsChatInfoOpen(false)}
                  isMobile={isMobile}
                  setuserM={setuserM}
                  channelId={currentChannel?.id}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <h2 className="text-xl text-gray-600">Select a conversation</h2>
          </div>
        )}
      </div>
      {userM && <Profile setuserM={setuserM} userId={otherUser?.id || null} />}
    </>
  );
};

export default ChatPage;
