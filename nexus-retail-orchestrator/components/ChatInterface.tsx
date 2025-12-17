import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { Send, User, Bot, Command, QrCode } from 'lucide-react';

interface Props {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
}

export const ChatInterface: React.FC<Props> = ({ messages, onSendMessage, isTyping }) => {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Command className="w-4 h-4 text-white" />
            </div>
            <div>
                <h1 className="font-bold text-slate-100">Nexus Client</h1>
                <p className="text-xs text-slate-400">Concierge Service</p>
            </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.filter(m => m.role !== 'system').map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-slate-700' : 'bg-indigo-600'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4 text-slate-300" /> : <Bot className="w-4 h-4 text-white" />}
            </div>
            
            <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                className={`p-3 rounded-2xl text-sm leading-relaxed shadow-md ${
                    msg.role === 'user'
                    ? 'bg-slate-700 text-slate-100 rounded-tr-sm'
                    : 'bg-indigo-600 text-white rounded-tl-sm'
                }`}
                >
                  {/* Text Content */}
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* QR Code Render Logic */}
                  {msg.messageType === 'qr_code' && (
                    <div className="mt-4 bg-white p-4 rounded-xl flex flex-col items-center gap-2">
                       <div className="w-32 h-32 bg-slate-100 border-2 border-slate-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                          {/* Fake QR Pattern */}
                          <div className="absolute inset-0 opacity-80" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '8px 8px' }}></div>
                          <QrCode className="w-12 h-12 text-slate-900 relative z-10" />
                          
                          {/* Scan Line Animation */}
                          <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 shadow-[0_0_10px_rgba(255,0,0,0.5)] animate-[scan_2s_ease-in-out_infinite]" style={{ animationName: 'scanDown' }}></div>
                       </div>
                       <p className="text-xs text-slate-500 font-mono font-bold">SCAN TO PAY $45.00</p>
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-500 mt-1 px-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
               <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-sm flex items-center gap-1">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response..."
            className="w-full bg-slate-950 text-slate-200 rounded-xl py-3 pl-4 pr-12 border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
      <style>{`
        @keyframes scanDown {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
};