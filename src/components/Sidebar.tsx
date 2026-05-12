import React from "react";
import { MessageSquare, Settings, History, Trash2, Github } from "lucide-react";
import { cn } from "../lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  history: any[];
  onClearHistory: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onToggle, 
  history, 
  onClearHistory 
}) => {
  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-40 w-72 bg-[#0a0a0c] border-r border-white/5 transition-transform duration-300 ease-in-out transform flex flex-col",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <MessageSquare size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Nexus AI</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">
        <div>
          <div className="flex items-center justify-between mb-5 px-3">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <History size={14} className="text-gray-600" />
              History
            </h3>
            <button 
              onClick={onClearHistory}
              className="text-gray-600 hover:text-red-400 p-1.5 rounded-lg transition-all hover:bg-red-400/10 active:scale-90"
              title="Clear all history"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="space-y-1.5">
            {history.length === 0 ? (
              <div className="px-3 py-10 flex flex-col items-center justify-center text-center space-y-2 opacity-40">
                <div className="w-10 h-10 rounded-full border border-dashed border-gray-600 flex items-center justify-center">
                  <MessageSquare size={16} />
                </div>
                <p className="text-[10px] text-gray-400">No session history</p>
              </div>
            ) : (
              history.map((item, idx) => (
                <button
                  key={idx}
                  className="group w-full text-left px-4 py-3 rounded-2xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all truncate border border-transparent hover:border-white/5 relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 transform -translate-x-full group-hover:translate-x-0 transition-transform" />
                  {item.title}
                </button>
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
