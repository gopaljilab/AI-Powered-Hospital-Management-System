import React, { useState } from 'react';
import { Bot, X, MessageSquare, Maximize2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChatInterface } from '../chat/ChatInterface';

export const FloatingChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-[360px] sm:w-[420px] shadow-2xl rounded-3xl overflow-hidden bg-white border border-slate-200 animate-slideUp">
          <div className="relative">
            <div className="absolute top-3 right-3 z-10 flex items-center space-x-1">
              <Link
                to="/assistant"
                title="Open full page assistant"
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ChatInterface isDrawer={true} />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-brand-600 via-teal-600 to-teal-500 hover:from-brand-700 hover:to-teal-700 text-white rounded-full shadow-xl shadow-brand-500/30 hover:scale-105 active:scale-95 transition-all"
        >
          <div className="relative">
            <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
          <span className="text-xs font-bold tracking-wide pr-1">Hospital Assistant</span>
        </button>
      )}
    </div>
  );
};
