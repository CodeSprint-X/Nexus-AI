import React, { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { Copy, RefreshCw, XCircle, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";
import { ModelStreamState } from "../hooks/useStreamingChat";

interface ChatColumnProps {
  state: ModelStreamState;
  modelId: string;
}

const OpenAIIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-500">
    <path d="M22.28 9.82a5.98 5.98 0 0 0-.51-4.91 6.04 6.04 0 0 0-3.99-3.08 6.03 6.03 0 0 0-5.09.75 6.06 6.06 0 0 0-4.66-2.1 6.05 6.05 0 0 0-6.04 6.06 6.04 6.04 0 0 0 .51 2.45c-.5 1.55-.65 3.19-.51 4.91a6.05 6.05 0 0 0 4 3.08 6.03 6.03 0 0 0 5.09-.75 6.06 6.06 0 0 0 4.66 2.1 6.05 6.05 0 0 0 6.04-6.06 6.04 6.04 0 0 0-.51-2.45zM12 13.91l-2.01-1.16v2.32l2.01 1.16 2.01-1.16v-2.32L12 13.91zM10.99 9.39l-2.01 1.16v2.32l2.01 1.16 2.01-1.16v-2.32l-2.01-1.16zm5.02 2.91l-2.01 1.16v2.32l2.01 1.16 2.01-1.16v-2.32l-2.01-1.16zm-5-3.48l1.01-.58 1.01.58v1.17l-1.01.58-1.01-.58v-1.17zm-4.02 1.74l1.01-.58 1.01.58v1.17l-1.01.58-1.01-.58v-1.17zm4.02 4.07l-1.01.58-1.01-.58v-1.17l1.01-.58 1.01.58v1.17z" fill="currentColor"/>
  </svg>
);

const GeminiIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" fill="url(#gemini-gradient)"/>
    <defs>
      <linearGradient id="gemini-gradient" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4E82EE"/>
        <stop offset="1" stopColor="#B065F0"/>
      </linearGradient>
    </defs>
  </svg>
);

const DeepSeekIcon = () => (
  <svg width="22" height="22" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-500">
    <path d="M20 5C11.7157 5 5 11.7157 5 20C5 28.2843 11.7157 35 20 35C28.2843 35 35 28.2843 35 20C35 11.7157 28.2843 5 20 5ZM25 25C25 25 18 28 15 22C12 16 18 13 18 13L25 25Z" fill="currentColor"/>
  </svg>
);

const MODEL_META: Record<string, { name: string, icon: React.ReactNode }> = {
  "llama-3.3-70b-versatile": { name: "GPT-5 mini", icon: <OpenAIIcon /> },
  "qwen/qwen3-32b": { name: "Gemini 2.5 Lite", icon: <GeminiIcon /> },
  "llama-3.1-8b-instant": { name: "DeepSeek Chat", icon: <DeepSeekIcon /> },
};

export const ChatColumn: React.FC<ChatColumnProps> = ({ state, modelId }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const meta = MODEL_META[modelId] || { name: modelId, icon: <Sparkles size={20} className="text-sky-400" /> };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.tokens, state.history, state.status]);

  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      className="flex flex-col h-full glass-panel overflow-hidden group border-white/10 hover:border-sky-500/30 transition-all duration-500 shadow-2xl relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            {meta.icon}
            <span className="text-sm font-bold text-gray-100 tracking-tight">{meta.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
           <div className={cn(
              "w-2 h-2 rounded-full",
              state.status === "streaming" ? "bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.5)]" : 
              state.status === "completed" ? "bg-emerald-400" :
              state.status === "error" ? "bg-red-400" : "bg-white/10"
            )} />
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth relative z-10 custom-scrollbar"
      >
        {state.history.length === 0 && !state.tokens && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20 space-y-3">
            <div className="w-16 h-16 rounded-3xl border-2 border-dashed border-white/50 flex items-center justify-center">
              <Sparkles size={32} />
            </div>
            <p className="text-sm font-medium">Awaiting input...</p>
          </div>
        )}

        {/* Previous Messages */}
        <div className="space-y-6">
          {state.history.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex flex-col gap-2",
                msg.role === 'user' ? "items-end" : "items-start"
              )}
            >
              <div className={cn(
                "max-w-[85%] p-4 rounded-2xl relative",
                msg.role === 'user' 
                  ? "bg-sky-500/10 border border-sky-500/20 text-sky-50" 
                  : "bg-white/5 border border-white/10 text-gray-200"
              )}>
                <div className="prose prose-invert max-w-none prose-sm prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/5 prose-headings:text-white prose-strong:text-sky-300">
                  <ReactMarkdown
                    components={{
                      p: ({children}) => <p className="mb-0 last:mb-0 text-[14px] leading-relaxed">{children}</p>,
                      code: ({ children, className }) => {
                        const isInline = !className?.includes('language-');
                        return (
                          <code className={cn(
                            "font-mono rounded text-sky-400",
                            isInline ? "bg-white/10 px-1.5 py-0.5 text-[0.9em]" : "block"
                          )}>
                            {children}
                          </code>
                        );
                      },
                      pre: ({ children }) => (
                        <div className="relative group/code my-4">
                          <pre className="p-4 rounded-xl overflow-x-auto bg-black/40 border border-white/5 text-[13px]">
                            {children}
                          </pre>
                        </div>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider px-1">
                {msg.role === 'user' ? 'YOU' : meta.name}
              </span>
            </motion.div>
          ))}

          {/* Current Streaming Response */}
          {state.status === "streaming" && state.tokens && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-2 items-start"
            >
              <div className="max-w-[85%] p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-200 relative group/msg shadow-xl">
                <div className="absolute top-2 right-2 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                  <button onClick={() => copyToClipboard(state.tokens)} className="p-1 hover:bg-white/10 rounded">
                    <Copy size={12} className="text-gray-400" />
                  </button>
                </div>
                <div className="prose prose-invert max-w-none prose-sm prose-p:leading-relaxed">
                  <ReactMarkdown
                    components={{
                      p: ({children}) => <p className="mb-0 last:mb-0 text-[14px] leading-relaxed typing-cursor">{children}</p>,
                    }}
                  >
                    {state.tokens}
                  </ReactMarkdown>
                </div>
              </div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider px-1 flex items-center gap-2">
                {meta.name}
                <div className="flex gap-0.5">
                  <div className="w-1 h-1 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </span>
            </motion.div>
          )}

          {state.status === "streaming" && !state.tokens && (
             <div className="flex items-center gap-3 p-4 opacity-40 italic text-sm">
                <div className="w-4 h-4 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
                Thinking...
             </div>
          )}
        </div>

        {state.status === "error" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-3 p-5 bg-red-500/5 border border-red-500/10 rounded-2xl text-red-400 group/error shadow-xl"
          >
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-[0.2em]">
              <XCircle size={18} />
              <span>Diagnostic Failure</span>
            </div>
            <p className="text-sm opacity-80 leading-relaxed font-medium">
              {state.error || "The model failed to materialize a response."}
            </p>
          </motion.div>
        )}
      </div>

      <div className="px-5 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between relative z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Network</span>
            <span className="text-[10px] text-gray-400 font-mono uppercase">
              {state.status}
            </span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Context</span>
            <span className="text-[10px] text-gray-400 font-mono">
              {state.history.length} MSG
            </span>
          </div>
        </div>
        {state.status === "completed" && (
          <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase tracking-[0.1em] transition-all">
            <CheckCircle2 size={12} />
            Live
          </div>
        )}
      </div>
    </motion.div>
  );
};
