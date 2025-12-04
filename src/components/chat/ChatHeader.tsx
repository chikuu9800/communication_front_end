import React, { useState } from 'react';
import { MoreHorizontal, Phone, Video, Users, ChevronLeft } from 'lucide-react';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { getAvatarFromCache, setAvatarCache } from '../../utils/avatarcapcha';
import { BASE_URL } from '../../config/constants';

interface ChatHeaderProps {
  name: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  avatar?: string;
  memberCount?: number;
  type?: 'direct' | 'group';
  onToggleInfo: () => void;
  onBack?: () => void;
  isMobile?: boolean;
}


const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  status,
  avatar,
  memberCount,
  type,
  onToggleInfo,
  onBack,
  isMobile
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);


  return (
    <div className="h-16 border-b border-gray-200 px-4 bg-white flex items-center justify-between shadow-lg sticky top-0 z-20">
      <div className="flex items-center">
        {isMobile && onBack && (
          <Button
            variant="ghost"
            size="sm"
            className="mr-2 text-gray-600 hover:bg-gray-100 rounded-full w-10 h-10 p-0 flex items-center justify-center"
            onClick={onBack}
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </Button>
        )}
        <button
          onClick={onToggleInfo}
          className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg py-2 px-2 transition-colors"
        >
          {(() => {
            const avatarPath = avatar ? `${BASE_URL}${avatar}` : getAvatarFromCache(name);
            console.log('Header avatar path:', avatarPath);
            return null;
          })()}
          <Avatar
            src={avatar}
            name={name}
            size="sm"
            className={type === 'group' ? 'bg-[#426a42] text-black' : 'bg-[#7591ad] text-black'}
          />
          <div className="flex flex-col items-start">
            <h2 className="text-base font-semibold leading-tight">{name}</h2>

            {status && (
              <div className="flex items-center gap-1">
                {/* Colored dot */}
                <span
                  className={`
          inline-block w-2 h-2 rounded-full 
          ${(status?.toLowerCase() === 'online')
                      ? 'bg-green-500'
                      : status?.toLowerCase() === 'offline'
                        ? 'bg-red-500'
                        : status?.toLowerCase() === 'away'
                          ? 'bg-yellow-500'
                          : status?.toLowerCase() === 'busy'
                            ? 'bg-orange-500'
                            : 'bg-gray-400'}

        `}
                ></span>

                {/* Status text */}
                <p className="text-xs text-gray-500 capitalize leading-tight">
                  {status}
                </p>
              </div>
            )}

            {memberCount && (
              <div className="flex items-center text-xs text-gray-500">
                <Users size={12} className="mr-1" />
                <span>{memberCount} members</span>
              </div>
            )}
          </div>

        </button>
      </div>

      <div className="flex items-center space-x-1">
        {!isMobile && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:bg-gray-100 rounded-full w-10 h-10 p-0 flex items-center justify-center"
              aria-label="Start voice call"
            >
              <Phone size={20} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:bg-gray-100 rounded-full w-10 h-10 p-0 flex items-center justify-center"
              aria-label="Start video call"
            >
              <Video size={20} />
            </Button>
          </>
        )}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:bg-gray-100 rounded-full w-10 h-10 p-0 flex items-center justify-center"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            aria-label="More options"
          >
            <MoreHorizontal size={20} />
          </Button>

          {showMoreMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-30">
              {isMobile && (
                <>
                  <button
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowMoreMenu(false)}
                  >
                    <Phone size={16} className="mr-2" />
                    Voice Call
                  </button>
                  <button
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowMoreMenu(false)}
                  >
                    <Video size={16} className="mr-2" />
                    Video Call
                  </button>
                  <div className="h-px bg-gray-200 my-1" />
                </>
              )}
              <button
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  onToggleInfo();
                  setShowMoreMenu(false);
                }}
              >
                <Users size={16} className="mr-2" />
                View Info
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;