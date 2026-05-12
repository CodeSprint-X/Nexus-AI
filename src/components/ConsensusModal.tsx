import React from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Copy, Download } from "lucide-react";

interface ConsensusModalProps {
  isOpen: boolean;
  onClose: () => void;
  consensusContent: string;
}

export const ConsensusModal: React.FC<ConsensusModalProps> = ({ 
  isOpen, 
  onClose, 
  consensusContent 
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(consensusContent);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-3xl max-h-[85vh] flex flex-col glass-panel shadow-[0_30px_90px_rgba(0,0,0,0.7)] border-white/10 bg-[#0d0d11]/95"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
                  <Sparkles size={22} className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-xl tracking-tight text-white">Neural Synthesis</h2>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Consensus Analysis complete</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white active:scale-90 border border-transparent hover:border-white/10"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              <div className="prose prose-invert prose-stone max-w-none prose-p:text-gray-300 prose-p:leading-relaxed prose-headings:text-white prose-strong:text-sky-300 prose-ul:list-disc prose-ol:list-decimal prose-li:mb-2">
                <ReactMarkdown>{consensusContent}</ReactMarkdown>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono italic">
                Derived from 3 distinct neural paths
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-bold active:scale-95"
                >
                  <Copy size={18} />
                  Copy Analysis
                </button>
                <button 
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 text-white hover:bg-sky-400 hover:shadow-[0_0_30px_rgba(14,165,233,0.3)] transition-all text-sm font-bold active:scale-95 shadow-xl shadow-sky-500/10"
                >
                  <Download size={18} />
                  Export Assets
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
