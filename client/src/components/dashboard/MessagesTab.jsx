import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import api from '../../services/api';
import { Send } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

let socket = null;

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getRoleColor(role) {
  if (role === 'trainer') return 'bg-green-500';
  if (role === 'nutritionist') return 'bg-yellow-500';
  return 'bg-blue-500';
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, h:mm a');
}

export default function MessagesTab({ engagementId, user }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeout = useRef(null);
  // Track message IDs we sent in this session for reliable "isMine" detection
  const sentByMe = useRef(new Set());

  // Normalize any ID value to a plain lowercase hex string
  const normalizeId = (val) => {
    if (!val) return '';
    const s = typeof val === 'object' ? (val.toString ? val.toString() : JSON.stringify(val)) : String(val);
    return s.toLowerCase().trim();
  };

  const myId = normalizeId(user?._id || user?.id);

  const isMine = (msg) => {
    // 1) Check our session-sent set first (most reliable)
    if (msg._id && sentByMe.current.has(String(msg._id))) return true;
    if (msg.tempId && sentByMe.current.has(msg.tempId)) return true;
    // 2) Normalize and compare sender ID vs current user ID
    const senderId = normalizeId(msg.sender?._id || msg.sender?.id || msg.sender);
    if (!senderId || !myId) return false;
    return senderId === myId;
  };

  const { data, isLoading } = useQuery({
    queryKey: ['messages', engagementId],
    queryFn: () => api.get(`/messages/${engagementId}`).then(r => r.data),
  });

  useEffect(() => {
    if (data?.messages) setMessages(data.messages);
  }, [data]);

  useEffect(() => {
    const token = localStorage.getItem('fitbid_token');
    socket = io({ auth: { token }, transports: ['websocket'] });

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_engagement', engagementId);
      socket.emit('mark_read', { engagementId });
    });
    socket.on('disconnect', () => setConnected(false));

    socket.on('new_message', (msg) => {
      setMessages(prev => {
        // Remove any optimistic version of this message
        const filtered = prev.filter(m => !m._isOptimistic || m.tempId !== msg.tempId);
        return [...filtered, msg];
      });
      socket.emit('mark_read', { engagementId });
    });

    socket.on('user_typing', ({ userId }) => {
      if (normalizeId(userId) !== myId) {
        setTyping(true);
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setTyping(false), 2500);
      }
    });
    socket.on('user_stop_typing', () => setTyping(false));

    return () => {
      socket?.disconnect();
      socket = null;
      clearTimeout(typingTimeout.current);
    };
  }, [engagementId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = (e) => {
    e.preventDefault();
    const content = message.trim();
    if (!content || !socket) return;

    // Add an optimistic message immediately (definitely from me)
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      tempId,
      _isOptimistic: true,
      sender: { _id: myId, id: myId, name: user?.name, role: user?.role },
      content,
      createdAt: new Date().toISOString(),
    };
    sentByMe.current.add(tempId);
    setMessages(prev => [...prev, optimistic]);

    socket.emit('send_message', { engagementId, content, tempId });
    socket.emit('stop_typing', { engagementId });
    setMessage('');
    inputRef.current?.focus();
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (socket) {
      socket.emit('typing', { engagementId });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => socket?.emit('stop_typing', { engagementId }), 1500);
    }
  };

  // When server sends back new_message, mark it in sentByMe if it's ours
  // (by checking sender ID)
  useEffect(() => {
    messages.forEach(msg => {
      if (msg._id && normalizeId(msg.sender?._id || msg.sender?.id || msg.sender) === myId) {
        sentByMe.current.add(String(msg._id));
      }
    });
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-260px)] min-h-96 bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h2 className="font-semibold text-gray-800">Team Chat</h2>
        <span className={`text-xs flex items-center gap-1.5 font-medium ${connected ? 'text-green-600' : 'text-amber-500'}`}>
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-amber-400'}`} />
          {connected ? 'Live' : 'Reconnecting…'}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm">Loading messages…</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Send size={20} className="text-blue-500" />
            </div>
            <p className="text-gray-500 text-sm font-medium">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const mine = isMine(msg);
            const prev = messages[i - 1];
            const prevSenderId = normalizeId(prev?.sender?._id || prev?.sender?.id || prev?.sender);
            const currSenderId = normalizeId(msg.sender?._id || msg.sender?.id || msg.sender);
            const isGrouped = prev && prevSenderId === currSenderId;

            return (
              <div
                key={msg._id || msg.tempId || i}
                className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : 'flex-row'} ${isGrouped ? 'mt-0.5' : 'mt-4'}`}
              >
                {/* Avatar */}
                {!mine && (
                  isGrouped
                    ? <div className="w-8 shrink-0" />
                    : (
                      <div title={`${msg.sender?.name} (${msg.sender?.role})`}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mb-0.5 bg-gray-200 border border-gray-300 overflow-hidden">
                        {msg.sender?.avatar ? (
                          <img src={msg.sender.avatar} alt={msg.sender.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${getRoleColor(msg.sender?.role)}`}>
                            {getInitials(msg.sender?.name)}
                          </div>
                        )}
                      </div>
                    )
                )}

                {/* Bubble */}
                <div className={`flex flex-col max-w-xs lg:max-w-sm ${mine ? 'items-end' : 'items-start'}`}>
                  {/* Sender label (only first in group, only for others) */}
                  {!mine && !isGrouped && msg.sender?.name && (
                    <span className="text-[11px] text-gray-500 font-semibold mb-1 ml-1 capitalize">
                      {msg.sender.name}
                      {msg.sender.role && <span className="font-normal text-gray-400"> · {msg.sender.role}</span>}
                    </span>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`px-4 py-2.5 text-sm leading-relaxed break-words shadow-sm ${
                      mine
                        ? 'bg-blue-600 text-white rounded-2xl rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-none'
                    } ${msg._isOptimistic ? 'opacity-70' : 'opacity-100'}`}
                  >
                    {msg.content}
                  </div>

                  {/* Time */}
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {formatTime(msg.createdAt)}
                    {msg._isOptimistic && <span className="ml-1">· Sending…</span>}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {typing && (
          <div className="flex items-end gap-2 mt-4">
            <div className="w-8 h-8 rounded-full bg-gray-300 shrink-0" />
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <form onSubmit={sendMessage} className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${getRoleColor(user?.role)}`}>
            {getInitials(user?.name)}
          </div>
          <input
            ref={inputRef}
            className="flex-1 bg-white text-sm outline-none px-4 py-2.5 rounded-full border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 placeholder-gray-400 transition-all"
            placeholder="Type a message…"
            value={message}
            onChange={handleTyping}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(e)}
          />
          <button
            type="submit"
            disabled={!message.trim() || !connected}
            className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
