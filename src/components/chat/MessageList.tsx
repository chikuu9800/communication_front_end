import React, { useState, useRef, useEffect } from "react";
import Avatar from "../ui/Avatar";
import { cn } from "../../utils/cn";
import {
  Check,
  CheckCheck,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.tsx";
import { BASE_URL } from "../../config/constants.tsx";

const MessageList = ({
  messages,
  pinnedMessage,
  onEditMessage,
  onDeleteMessage,
  onReplyMessage,
  onForwardMessage,
  activeChatType, // expects 'group' or 'direct'
}) => {
  const { user } = useAuth();
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close menu on outside click
  useEffect(() => {
    if (!openMenuId) return;
    const handleClick = (e) => {
      // If click is outside any menu
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenuId]);

  // Download attachment
  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(`${BASE_URL}${fileUrl}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const groupedMessages = {};
  const getMessageById = (id) => messages.find((m) => m.id === id);

  messages.forEach((msg) => {
    const date = new Date(msg.timestamp).toLocaleDateString();
    if (!groupedMessages[date]) groupedMessages[date] = [];
    groupedMessages[date].push(msg);
  });

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const isConsecutiveMessage = (curr, prev) => {
    if (!prev) return false;
    return (
      curr.sender.id === prev.sender.id &&
      new Date(curr.timestamp) - new Date(prev.timestamp) < 5 * 60 * 1000
    );
  };

  const MessageStatus = ({ status }) => {
    if (!status) return null;

    return (
      <div className="ml-2 flex items-center text-xs">
        {status === "sent" && <Check size={14} className="text-gray-400" />}
        {status === "delivered" && <CheckCheck size={14} className="text-gray-400" />}
        {status === "seen" && <CheckCheck size={14} className="text-blue-500" />}
      </div>
    );
  };

  const ReplyPreview = ({ replyTo }) => {
    const original = getMessageById(replyTo);
    if (!original) return null;

    return (
      <div className="bg-white/90 rounded-t-lg px-3 py-2 -mb-2 text-sm border-l-2 border-blue-500">
        <div className="font-medium text-gray-700">
          {original.isCurrentUser ? "You" : original.sender.name}
        </div>

        {original.content && <div className="text-gray-600 truncate">{original.content}</div>}

        {!original.content && original.attachments?.length > 0 && (
          <div className="flex items-center gap-2 text-gray-600">
            {original.attachments[0].type === "image" ? (
              <ImageIcon size={14} />
            ) : (
              <FileText size={14} />
            )}
            <span>{original.attachments[0].name}</span>
          </div>
        )}
      </div>
    );
  };

  // -------------------------
  // MENU ITEM COMPONENT
  // -------------------------
  const MenuItem = ({ label, onClick, danger }) => (
    <button
      onClick={() => {
        onClick();
        setOpenMenuId(null);
      }}
      className={cn("w-full text-left px-4 py-2 text-sm hover:bg-gray-100", danger && "text-red-600")}
    >
      {label}
    </button>
  );

  // -------------------------
  // MESSAGE MENU COMPONENT
  // -------------------------
  const MessageMenu = ({ message }) => {
    const isMine = message.isCurrentUser;
    const isAttachment = message.attachments?.length > 0;
    const isOpen = openMenuId === message.id;
    // Menu position: left for mine, right for others
    const menuPosition = isMine ? 'left' : 'right';
    const menuButtonRef = useRef(null);

    return (
      <div className="relative">
        {/* Hover 3-dot icon (appears on group hover) */}
        <button
          ref={menuButtonRef}
          onClick={() => setOpenMenuId(isOpen ? null : message.id)}
          className="opacity-0 group-hover:opacity-100 absolute -right-6 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition"
        >
          <span className="font-bold text-gray-600">⋮</span>
        </button>

        {isOpen && (
          <div
            ref={menuRef}
            className={
              menuPosition === 'right'
                ? 'absolute left-full top-0 ml-2 bg-white shadow-lg rounded-lg border z-50 w-40'
                : 'absolute right-full top-0 mr-2 bg-white shadow-lg rounded-lg border z-50 w-40'
            }
          >
            {!isMine && !isAttachment && (
              <>
                <MenuItem label="Reply" onClick={() => onReplyMessage(message.id)} />
                <MenuItem label="Forward" onClick={() => onForwardMessage(message.id)} />
                <MenuItem label="Copy" onClick={() => navigator.clipboard.writeText(message.content)} />
              </>
            )}

            {isMine && !isAttachment && (
              <>
                <MenuItem label="Reply" onClick={() => onReplyMessage(message.id)} />
                <MenuItem label="Copy" onClick={() => navigator.clipboard.writeText(message.content)} />
                <MenuItem
                  label="Edit"
                  onClick={() => {
                    setEditingMessageId(message.id);
                    setEditContent(message.content);
                  }}
                />
                <MenuItem label="Delete" danger onClick={() => onDeleteMessage(message.id)} />
              </>
            )}

            {isMine && isAttachment && (
              <>
                <MenuItem label="Reply" onClick={() => onReplyMessage(message.id)} />
                <MenuItem
                  label="Download"
                  onClick={() => handleDownload(message.attachments[0].url, message.attachments[0].name)}
                />
                <MenuItem label="Delete" danger onClick={() => onDeleteMessage(message.id)} />
              </>
            )}

            {!isMine && isAttachment && (
              <>
                <MenuItem label="Reply" onClick={() => onReplyMessage(message.id)} />
                <MenuItem
                  label="Download"
                  onClick={() => handleDownload(message.attachments[0].url, message.attachments[0].name)}
                />
                <MenuItem label="Forward" onClick={() => onForwardMessage(message.id)} />
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  // -------------------------
  // RENDER MESSAGES
  // -------------------------
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-1 sm:px-2 md:px-4 bg-[#ece5dd]">
      {Object.keys(groupedMessages).map((date) => (
        <div key={date}>
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-200" />
            <div className="text-xs text-gray-500 px-3">{date}</div>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          {groupedMessages[date].map((message, index) => {
            // Skip message completely when both text and attachments missing
            if (!message.content?.trim() && (!message.attachments || message.attachments.length === 0)) return null;

            const prev = groupedMessages[date][index - 1];
            const isConsecutive = isConsecutiveMessage(message, prev);

            const displayName = message.sender.id === user?.id ? "You" : message.sender.name;

            const outgoing = message.isCurrentUser;

            return (
              <div
                key={message.id}
                className={cn(
                  "flex mb-2 group",
                  outgoing ? "justify-end" : "justify-start",
                  isConsecutive ? "mt-1" : "mt-3"
                )}
              >
                {/* Only show avatar and name if group chat */}
                {activeChatType === 'group' && !outgoing && !isConsecutive && (
                  <Avatar src={message.sender.avatar ? `${BASE_URL}${message.sender.avatar}` : undefined} name={message.sender.name} size="sm" className="mr-2 mt-1" />
                )}
                {activeChatType === 'group' && !outgoing && isConsecutive && <div className="w-8 mr-2" />}
                <div className="max-w-[90%] sm:max-w-[70%] md:max-w-[60%] lg:max-w-[40%] min-w-0 relative">
                  {/* Only show name if group chat */}
                  {activeChatType === 'group' && !isConsecutive && (
                    <div className={cn("flex mb-1", outgoing ? "justify-end" : "justify-start")}> 
                      <span className="text-sm font-medium">{displayName}</span>
                      <span className="text-xs text-gray-500 ml-2">{formatTime(message.timestamp)}</span>
                    </div>
                  )}

                  {/* Reply Preview */}
                  {message.replyTo && <ReplyPreview replyTo={message.replyTo} />}

                  {/* ONLY SHOW TEXT BUBBLE IF content exists */}
                  {message.content?.trim() && (
                    <div
                      className={cn(
                        "rounded-xl px-4 py-2 shadow-sm relative break-words group flex  items-center ",
                        outgoing ? "bg-[#dcf8c6] text-black" : "bg-white text-gray-800"
                      )}
                    >
                      {editingMessageId === message.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-white text-black rounded-lg px-3 py-2 border"
                            autoFocus
                          />
                          <div className="flex justify-end space-x-2">
                            <button onClick={() => setEditingMessageId(null)} className="px-3 py-1 rounded bg-gray-500 text-white">
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                onEditMessage(message.id, editContent);
                                setEditingMessageId(null);
                              }}
                              className="px-3 py-1 rounded bg-green-500 text-white"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-end ">
                          <p>{message.content}</p>
                          {message.isCurrentUser && <MessageStatus status={message.status} />}
                        </div>
                      )}
                      <MessageMenu message={message} />
                    </div>
                  )}

                  {/* ATTACHMENTS — WhatsApp style */}
                  {message.attachments?.length > 0 && (
                    <div
                      className={cn(
                        "mt-2 w-full rounded-xl overflow-hidden shadow-sm",
                        outgoing ? "bg-[#bfe9b8]" : "bg-white"
                      )}
                    >
                      {message.attachments.map((a) => {
                        const isImage = a.type === "image";
                        return (
                          <div key={a.id} className="w-full relative">
                            {/* IMAGE STYLE */}
                            {isImage && (
                              <div className="relative group">
                                <img
                                  src={`${BASE_URL}${a.url}`}
                                  alt={a.name}
                                  className="w-full h-auto rounded-lg cursor-pointer"
                                  onClick={() => window.open(`${BASE_URL}${a.url}`, "_blank")}
                                />
                                {/* WhatsApp-style menu button (3-dot) */}
                                <button
                                  className="absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow hover:bg-white z-10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(a.id);
                                  }}
                                >
                                  <span className="font-bold text-gray-700">⋮</span>
                                </button>
                                {/* Menu for image attachment */}
                                {openMenuId === a.id && (
                                  <div ref={menuRef} className="absolute top-10 right-2 bg-white rounded-lg shadow-lg border z-50 w-36">
                                    <button
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                      onClick={() => {
                                        handleDownload(a.url, a.name);
                                        setOpenMenuId(null);
                                      }}
                                    >Download</button>
                                    <button
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                      onClick={() => {
                                        window.open(`${BASE_URL}${a.url}`, "_blank");
                                        setOpenMenuId(null);
                                      }}
                                    >View</button>
                                    <button
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                      onClick={() => {
                                        onForwardMessage(message.id);
                                        setOpenMenuId(null);
                                      }}
                                    >Forward</button>
                                    {outgoing && (
                                      <button
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                                        onClick={() => {
                                          onDeleteMessage(message.id);
                                          setOpenMenuId(null);
                                        }}
                                      >Delete</button>
                                    )}
                                  </div>
                                )}
                                {/* Download button below image */}
                                {/* <button
                                  onClick={() => handleDownload(a.url, a.name)}
                                  className="absolute bottom-2 right-2 px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600 shadow"
                                >
                                  Download
                                </button> */}
                                {/* If NO content → show small caption below image */}
                                {!message.content?.trim() && (
                                  <div className="px-3 py-2 text-xs text-gray-700">{a.name}</div>
                                )}
                              </div>
                            )}

                            {/* FILE STYLE */}
                            {!isImage && (
                              <div className="flex items-center gap-3 px-4 py-3">
                                <FileText size={30} className="text-gray-600" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{a.name}</p>
                                  {a.size && <p className="text-xs text-gray-500">{(a.size / 1024).toFixed(1)} KB</p>}
                                </div>
                                <button
                                  onClick={() => handleDownload(a.url, a.name)}
                                  className="px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600"
                                >
                                  Download
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
