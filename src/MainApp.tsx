import React, { useState, useEffect } from 'react';
import IconSidebar from './components/layout/IconSidebar';
import ChatPage from './pages/ChatPage';
import CallsView from './components/calls/CallsView';
import FilesView from './components/files/FilesView';
import MeetView from './components/meet/MeetView';
import AppsView from './components/apps/AppsView';
import Sidebar from './components/layout/Sidebar';

interface Channel {
  id: string;
  name: string;
  type: string;
  users: { id: string; name: string; avatar?: string }[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

const MainApp = () => {
  const [activeSection, setActiveSection] = useState<'chats' | 'calls' | 'files' | 'meet' | 'apps'>('chats');
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showAppsPopup, setShowAppsPopup] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true); // new state

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const unreadCount = channels.reduce((sum, channel) => sum + (channel.unreadCount || 0), 0);
    setTotalUnreadCount(unreadCount);
    console.log('Total unread count updated:', unreadCount, 'Channels:', channels); // Debug log
  }, [channels]);

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId);
    if (isMobile) setSidebarOpen(false); // hide sidebar on mobile when chat opens
  };

  const handleBackToChats = () => {
    setActiveChat(null);
    if (isMobile) setSidebarOpen(true); // show sidebar on mobile when back from chat
  };

  const handleBackToSection = () => {
    setActiveSection('chats');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'chats':
        return (
          <ChatPage
            isMobile={isMobile}
            activeChat={activeChat}
            onChatSelect={handleChatSelect}
            onBackToChats={handleBackToChats}
            setActiveSection={setActiveSection}
            channels={channels}
            setChannels={setChannels}
          />
        );

      case 'calls':
        return (
          <div className={`flex-1 ${isMobile ? 'w-full' : ''}`}>
            <CallsView onBack={isMobile ? handleBackToSection : undefined} isMobile={isMobile} />
          </div>
        );

      case 'files':
        return (
          <div className={`flex-1 ${isMobile ? 'w-full' : ''}`}>
            <FilesView onBack={isMobile ? handleBackToSection : undefined} isMobile={isMobile} />
          </div>
        );

      case 'meet':
        return (
          <div className={`flex-1 ${isMobile ? 'w-full' : ''}`}>
            <MeetView />
          </div>
        );

      case 'apps':
        return <AppsView onClose={() => setActiveSection('chats')} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile: show IconSidebar when sidebar is closed */}
      {isMobile && !sidebarOpen && (
        <IconSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          totalUnreadCount={totalUnreadCount}
        />
      )}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile: show Sidebar only if open, Desktop: always show */}
        {(sidebarOpen || !isMobile) && (
          <Sidebar
            isMobile={isMobile}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            activeChat={activeChat}
            onChatSelect={handleChatSelect}
            chats={channels}
            setChats={setChannels}
            isGroupChat={(chat) => chat.type === 'group'}
          />
        )}
        {renderContent()}
      </div>
      {showAppsPopup && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAppsPopup(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <AppsView onClose={() => setShowAppsPopup(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MainApp;