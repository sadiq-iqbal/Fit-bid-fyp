import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import api from '../../services/api';
import { Send, Paperclip } from 'lucide-react';
import { format } from 'date-fns';

let socket = null;

export default function MessagesTab({ engagementId, user }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['messages', engagementId],
    queryFn: () => api.get(`/messages/${engagementId}`).then(r => r.data),
    onSuccess: (d) => setMessages(d.messages || []),
  });

  useEffect(() => {
    if (data?.messages) setMessages(data.messages);
  }, [data]);

  useEffect(() => {
    const token = localStorage.getItem('fitbid_token');
    socket = io({ auth: { token }, transports: ['websocket'] });
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.emit('join_engagement', engagementId);
    socket.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => { socket?.disconnect(); socket = null; };
  }, [engagementId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;
    socket.emit('send_message', { engagementId, content: message.trim() });
    setMessage('');
  };

  const isOwnMessage = (msg) => msg.sender?._id === user._id || msg.sender === user._id;

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-80">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Team Chat</h2>
        <span className={`text-xs flex items-center gap-1 ${connected ? 'text-green-600' : 'text-gray-400'}`}>
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`} />
          {connected ? 'Connected' : 'Connecting…'}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading messages…</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg, i) => {
            const own = isOwnMessage(msg);
            return (
              <div key={msg._id || i} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md`}>
                  {!own && (
                    <div className="text-xs text-gray-500 mb-1 ml-1">
                      {msg.sender?.name} <span className="capitalize text-gray-400">· {msg.sender?.role}</span>
                    </div>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${own ? 'bg-brand-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-900 rounded-tl-sm'}`}>
                    {msg.content}
                  </div>
                  <div className={`text-xs text-gray-400 mt-1 ${own ? 'text-right' : 'text-left'} ml-1`}>
                    {msg.createdAt ? format(new Date(msg.createdAt), 'h:mm a') : ''}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2 border border-gray-200">
        <input
          className="flex-1 bg-transparent text-sm outline-none px-2 placeholder-gray-400"
          placeholder="Type a message…"
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(e)}
        />
        <button type="submit" disabled={!message.trim() || !connected}
          className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
