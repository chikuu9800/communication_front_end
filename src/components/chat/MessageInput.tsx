// import React, { useState, useRef } from 'react';
// import { Paperclip, Send, Smile, X, Image, FileText, Reply } from 'lucide-react';

// interface Message {
//   id: string;
//   sender: {
//     id: string;
//     name: string;
//     avatar?: string;
//   };
//   content: string;
//   timestamp: string;
//   isCurrentUser: boolean;
//   status?: 'sent' | 'delivered' | 'seen';
// }

// interface MessageInputProps {
//   onSendMessage: (content: string, attachments: File[], replyTo?: string) => void;
//   replyingTo?: Message;
//   onCancelReply?: () => void;
// }

// const MessageInput: React.FC<MessageInputProps> = ({
//   onSendMessage,
//   replyingTo,
//   onCancelReply
// }) => {
//   const [message, setMessage] = useState('');
//   const [attachments, setAttachments] = useState<File[]>([]);
//   const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (message.trim() || attachments.length > 0) {
//       onSendMessage(
//         message.trim(),
//         attachments,
//         replyingTo ? replyingTo.id : undefined
//       );

//       setMessage('');
//       setAttachments([]);

//       if (textareaRef.current) {
//         textareaRef.current.style.height = '40px';
//       }
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSubmit(e);
//     }
//   };

//   const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setMessage(e.target.value);

//     if (textareaRef.current) {
//       textareaRef.current.style.height = '40px';
//       textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const newFiles = Array.from(e.target.files);
//       setAttachments(prev => [...prev, ...newFiles]);
//     }
//   };

//   const removeAttachment = (index: number) => {
//     setAttachments(prev => prev.filter((_, i) => i !== index));
//   };

//   const triggerFileInput = () => {
//     if (fileInputRef.current) {
//       fileInputRef.current.click();
//     }
//   };

//   const getFileIcon = (file: File) => {
//     const isImage = file.type.startsWith('image/');
//     return isImage ? <Image size={18} /> : <FileText size={18} />;
//   };

//   return (
//     <div className="w-full bg-white border-t border-gray-200 px-2 py-2 shadow-sm w-full xl:w-[95%] m-auto rounded-xl">
//       {replyingTo && (
//         <div className="flex items-center justify-between rounded-lg bg-gray-100 border-l-4 border-blue-500 px-3 py-2 mb-3">
//           <div>
//             <p className="text-[13px] font-semibold text-gray-800">
//               Replying to {replyingTo.sender.name}
//             </p>
//             <p className="text-[12px] text-gray-600 truncate max-w-[250px]">
//               {replyingTo.content}
//             </p>
//           </div>

//           <button
//             className="p-1 hover:bg-gray-200 rounded-full transition"
//             onClick={onCancelReply}
//           >
//             <X size={14} />
//           </button>
//         </div>
//       )}

//       {attachments.length > 0 && (
//         <div className="flex flex-wrap gap-2 mb-2">
//           {attachments.map((file, index) => (
//             <div
//               key={index}
//               className="flex items-center bg-gray-100 border border-gray-300 rounded-lg px-3 py-1 text-sm shadow-sm"
//             >
//               <span className="mr-2 text-gray-600">
//                 {file.type.startsWith("image/") ? <Image size={16} /> : <FileText size={16} />}
//               </span>

//               <span className="truncate max-w-[120px] text-gray-700">{file.name}</span>

//               <button
//                 className="ml-2 p-1 hover:bg-gray-200 rounded-full"
//                 onClick={() => removeAttachment(index)}
//               >
//                 <X size={13} className="text-gray-500" />
//               </button>
//             </div>
//           ))}
//         </div>
//       )}

//       <form
//         onSubmit={handleSubmit} 
//         className="flex items-end gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-300 focus-within:ring focus-within:ring-blue-300"
//       >
//         <textarea
//           ref={textareaRef}
//           value={message}
//           onChange={handleTextareaChange}
//           placeholder="Message..."
//           rows={1}
//           className="flex-1 bg-transparent outline-none resize-none text-sm max-h-[140px] py-1"
//         />

//         <button
//           type="button"
//           onClick={() => fileInputRef.current?.click()}
//           className="p-2 rounded-full hover:bg-gray-200 transition"
//         >
//           <Paperclip size={20} className="text-gray-600" />
//         </button>

//         <button
//           type="button"
//           onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
//           className="p-2 rounded-full hover:bg-gray-200 transition"
//         >
//           <Smile size={20} className="text-gray-600" />
//         </button>

//         <button
//           type="submit"
//           disabled={!message.trim() && attachments.length === 0}
//           className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50"
//         >
//           <Send size={18} />
//         </button>

//         <input
//           type="file"
//           ref={fileInputRef}
//           onChange={handleFileChange}
//           multiple
//           className="hidden"
//         />
//       </form>

//       {isEmojiPickerOpen && (
//         <div className="absolute bottom-24 right-8 bg-white border shadow-lg rounded-xl p-3 grid grid-cols-6 gap-2">
//           {["😊", "👍", "❤️", "🎉", "🔥", "😂", "🙌", "👋", "👏", "💯", "🤔", "🙏"].map((emoji) => (
//             <button
//               key={emoji}
//               onClick={() => {
//                 setMessage((prev) => prev + emoji);
//                 setIsEmojiPickerOpen(false);
//               }}
//               className="text-xl p-1 hover:bg-gray-100 rounded-lg"
//             >
//               {emoji}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>

//   );
// };

// export default MessageInput;

import React, { useState, useRef } from "react";
import { Paperclip, Send, Smile, X, Image, FileText } from "lucide-react";

interface Message {
  id: string;
  sender: { id: string; name: string; avatar?: string };
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
}

interface MessageInputProps {
  onSendMessage: (content: string, attachments: File[], replyTo?: string) => void;
  replyingTo?: Message;
  onCancelReply?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  replyingTo,
  onCancelReply
}) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && attachments.length === 0) return;

    onSendMessage(message.trim(), attachments, replyingTo?.id);

    setMessage("");
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = "42px";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (i: number) =>
    setAttachments(prev => prev.filter((_, index) => i !== index));

  return (
    <div className="w-full bg-gray-100 px-2 py-2 pb-4 sm:px-3 sm:py-3 relative">
      {/* WhatsApp Style Reply Box */}
      {replyingTo && (
        <div className="flex flex-wrap items-center justify-between bg-white border-l-4 border-green-600 px-2 py-2 mb-2 rounded-lg shadow-sm">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-green-700 truncate max-w-[180px] sm:max-w-[250px]">Replying to {replyingTo.sender.name}</p>
            <p className="text-[12px] text-gray-600 truncate max-w-[180px] sm:max-w-[250px]">{replyingTo.content}</p>
          </div>
          <button className="p-1 hover:bg-gray-200 rounded-full" onClick={onCancelReply}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Attachments Preview WhatsApp Style */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((file, idx) => (
            <div key={idx} className="flex items-center bg-white border rounded-lg px-2 py-1 text-sm shadow-sm max-w-[60vw] sm:max-w-[300px]">
              {file.type.startsWith("image/") ? (
                <Image size={16} className="text-green-600" />
              ) : (
                <FileText size={16} className="text-green-600" />
              )}
              <span className="ml-2 truncate max-w-[80px] sm:max-w-[110px]">{file.name}</span>
              <button onClick={() => removeAttachment(idx)} className="ml-2 p-1 hover:bg-gray-200 rounded-full">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* WhatsApp Style Input */}
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
        {/* Input Box */}
        <div className="flex items-center bg-white border border-gray-300 px-2 py-2 rounded-3xl flex-1 shadow-sm min-w-0">
          {/* Attach Icon */}
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-gray-100 rounded-full">
            <Paperclip size={20} className="text-gray-600" />
          </button>
          {/* Emojis */}
          <button type="button" onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)} className="p-2 hover:bg-gray-100 rounded-full">
            <Smile size={20} className="text-gray-600" />
          </button>
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            rows={1}
            placeholder="Message"
            className="flex-1 bg-transparent resize-none outline-none text-sm px-2 max-h-[120px] min-w-0"
            onChange={(e) => {
              setMessage(e.target.value);
              textareaRef.current!.style.height = "40px";
              textareaRef.current!.style.height = Math.min(textareaRef.current!.scrollHeight, 120) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>
        {/* WhatsApp Green Send Button */}
        <button type="submit" disabled={!message.trim() && attachments.length === 0} className="p-3 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 disabled:opacity-40">
          <Send size={18} />
        </button>
        <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      </form>
      {/* Emoji Picker */}
      {isEmojiPickerOpen && (
        <div className="absolute bottom-20 right-2 sm:right-4 bg-white border shadow-xl rounded-xl p-3 grid grid-cols-6 gap-2">
          {["😊", "😂", "❤️", "🔥", "🎉", "👍", "👌", "😢", "🙏", "💯", "🤔", "😎"].map(e => (
            <button key={e} onClick={() => { setMessage(prev => prev + e); setIsEmojiPickerOpen(false); }} className="text-xl p-1 hover:bg-gray-100 rounded-lg">{e}</button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageInput;
