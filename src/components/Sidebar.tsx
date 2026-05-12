import React from "react";
import { MessageSquare, Settings, History, Trash2, Github, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { ChatSession } from "../App";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onClearAll: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onToggle, 
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAll 
}) => {
  const [showConfirm, setShowConfirm] = React.useState(false);

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-40 w-72 bg-[#0a0a0c] border-r border-white/5 transition-transform duration-300 ease-in-out transform flex flex-col",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <AnimatePresence>
        {showConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#0a0a0c]/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
              <Trash2 className="text-red-500" size={24} />
            </div>
            <h4 className="text-white font-bold text-lg mb-2">Reset Sessions?</h4>
            <p className="text-gray-500 text-[12px] leading-relaxed mb-6">
              This will wipe out all your saved conversations and neural histories permanently.
            </p>
            <div className="flex flex-col w-full gap-3">
              <button 
                onClick={() => {
                  onClearAll();
                  setShowConfirm(false);
                }}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xs transition-all active:scale-95 shadow-lg shadow-red-500/20"
              >
                Clear Everything
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl font-bold text-xs transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 h-20 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <MessageSquare size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Nexus AI</span>
        </div>
      </div>

      <div className="p-4 shrink-0">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-5 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all active:scale-[0.98] group"
        >
          <div className="w-6 h-6 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-all">
            <Plus size={16} />
          </div>
          <span className="text-sm font-bold tracking-tight">New Interaction</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
        <div>
          <div className="flex items-center justify-between mb-5 px-3">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <History size={14} className="text-gray-600" />
              History
            </h3>
            <button 
              onClick={() => setShowConfirm(true)}
              className="text-gray-600 hover:text-red-400 p-1.5 rounded-lg transition-all hover:bg-red-400/10 active:scale-90"
              title="Reset all"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="space-y-1">
            {sessions.length === 0 ? (
              <div className="px-3 py-10 flex flex-col items-center justify-center text-center space-y-2 opacity-40">
                <div className="w-10 h-10 rounded-full border border-dashed border-gray-600 flex items-center justify-center">
                  <MessageSquare size={16} />
                </div>
                <p className="text-[10px] text-gray-400">Empty void</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="group relative">
                  <button
                    onClick={() => onSelectSession(session.id)}
                    className={cn(
                      "w-full text-left px-4 py-3.5 rounded-2xl text-[13px] transition-all truncate pr-12 relative overflow-hidden flex flex-col gap-0.5",
                      activeSessionId === session.id 
                        ? "bg-white/5 text-white border border-white/10" 
                        : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.03] border border-transparent"
                    )}
                  >
                    {activeSessionId === session.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500" />
                    )}
                    <span className="font-semibold block truncate">{session.title}</span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.1em] opacity-40">
                      {new Date(session.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
           <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-5 px-3">
              <Settings size={14} className="text-gray-600" />
              Parameters
            </h3>
            <div className="space-y-6 px-3">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Creativity</label>
                  <span className="text-[10px] font-mono text-sky-400 bg-sky-400/10 px-1.5 py-0.5 rounded">0.7</span>
                </div>
                <input type="range" className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-sky-500 border border-white/5" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Context Window</label>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">32K</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-lg overflow-hidden border border-white/5">
                  <div className="w-3/4 h-full bg-emerald-500/50" />
                </div>
              </div>
            </div>
        </div>
      </div>

      <div className="p-4 border-t border-white/5 space-y-4">
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors px-2"
        >
          <Github size={14} />
          View Source
        </a>
        <div className="text-[10px] text-gray-600 px-2">
          Nexus v1.0.0-alpha
        </div>
      </div>
    </div>
  );
};
