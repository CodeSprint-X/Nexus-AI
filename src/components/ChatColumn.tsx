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
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#19c37d]">
    <path d="M21.55 10.004a5.416 5.416 0 00-.478-4.501c-1.217-2.09-3.662-3.166-6.05-2.66A5.59 5.59 0 0010.831 1C8.39.995 6.224 2.546 5.473 4.838A5.553 5.553 0 001.76 7.496a5.487 5.487 0 00.691 6.5 5.416 5.416 0 00.477 4.502c1.217 2.09 3.662 3.165 6.05 2.66A5.586 5.586 0 0013.168 23c2.443.006 4.61-1.546 5.361-3.84a5.553 5.553 0 003.715-2.66 5.488 5.488 0 00-.693-6.497v.001zm-8.381 11.558a4.199 4.199 0 01-2.675-.954c.034-.018.093-.05.132-.074l4.44-2.53a.71.71 0 00.364-.623v-6.176l1.877 1.069c.02.01.033.029.036.05v5.115c-.003 2.274-1.87 4.118-4.174 4.123zM4.192 17.78a4.059 4.059 0 01-.498-2.763c.032.02.09.055.131.078l4.44 2.53c.225.13.504.13.73 0l5.42-3.088v2.138a.068.068 0 01-.027.057L9.9 19.288c-1.999 1.136-4.552.46-5.707-1.51h-.001zM3.023 8.216A4.15 4.15 0 015.198 6.41l-.002.151v5.06a.711.711 0 00.364.624l5.42 3.087-1.876 1.07a.067.067 0 01-.063.005l-4.489-2.559c-1.995-1.14-2.679-3.658-1.53-5.63h.001zm15.417 3.54l-5.42-3.088L14.896 7.6a.067.067 0 01.063-.006l4.489 2.557c1.998 1.14 2.683 3.662 1.529 5.633a4.163 4.163 0 01-2.174 1.807V12.38a.71.71 0 00-.363-.623zm1.867-2.773a6.04 6.04 0 00-.132-.078l-4.44-2.53a.731.731 0 00-.729 0l-5.42 3.088V7.325a.068.068 0 01.027-.057L14.1 4.713c2-1.137 4.555-.46 5.707 1.513.487.833.664 1.809.499 2.757h.001zm-11.741 3.81l-1.877-1.068a.065.065 0 01-.036-.051V6.559c.001-2.277 1.873-4.122 4.181-4.12.976 0 1.92.338 2.671.954-.034.018-.092.05-.131.073l-4.44 2.53a.71.71 0 00-.365.623l-.003 6.173v.002zm1.02-2.168L12 9.25l2.414 1.375v2.75L12 14.75l-2.415-1.375v-2.75z" fill="currentColor"/>
  </svg>
);

const GeminiIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 24" fill="url(#gemini-gradient)" fillRule="nonzero" />
    <defs>
      <linearGradient id="gemini-gradient" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4E82EE"/>
        <stop offset="1" stopColor="#B065F0"/>
      </linearGradient>
    </defs>
  </svg>
);

const DeepSeekIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z" fill="#4D6BFE"/>
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

        {/* Messages List with layout animations */}
        <div className="space-y-6">
          <AnimatePresence initial={false} mode="popLayout">
            {state.history.map((msg, i) => (
              <motion.div 
                key={`${state.modelId}-msg-${i}`}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex flex-col gap-2",
                  msg.role === 'user' ? "items-end" : "items-start"
                )}
              >
                <div className={cn(
                  "max-w-[90%] p-4 rounded-2xl relative transition-all duration-500",
                  msg.role === 'user' 
                    ? "bg-sky-500/10 border border-sky-500/20 text-sky-50 px-5" 
                    : "bg-white/[0.03] border border-white/10 text-gray-200"
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
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest px-2 opacity-50 group-hover:opacity-100 transition-opacity">
                  {msg.role === 'user' ? 'YOU' : meta.name}
                </span>
              </motion.div>
            ))}

            {/* Current Streaming Response */}
            {state.status === "streaming" && state.tokens && (
              <motion.div 
                key={`${state.modelId}-streaming`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2 items-start"
              >
                <div className="max-w-[90%] p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-gray-200 relative group/msg shadow-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-500/[0.02] to-transparent pointer-events-none" />
                  <div className="absolute top-2 right-2 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                    <button onClick={() => copyToClipboard(state.tokens)} className="p-1 hover:bg-white/10 rounded">
                      <Copy size={12} className="text-gray-400" />
                    </button>
                  </div>
                  <div className="prose prose-invert max-w-none prose-sm prose-p:leading-relaxed relative z-10">
                    <ReactMarkdown
                      components={{
                        p: ({children}) => <p className="mb-0 last:mb-0 text-[14px] leading-relaxed typing-cursor">{children}</p>,
                      }}
                    >
                      {state.tokens}
                    </ReactMarkdown>
                  </div>
                </div>
                <span className="text-[9px] text-sky-400/50 font-bold uppercase tracking-widest px-2 flex items-center gap-2">
                  {meta.name}
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {state.status === "streaming" && !state.tokens && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="flex items-center gap-3 p-4 opacity-40 italic text-sm"
             >
                <div className="w-4 h-4 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
                Thinking...
             </motion.div>
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
