import React, { useState, useEffect, useRef } from "react";
import { Send, Power } from "lucide-react";
import { cn } from "../lib/utils";

interface ChatInputProps {
  onSend: (prompt: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="relative flex items-end gap-3 w-full max-w-4xl mx-auto p-4 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] transition-all duration-500 focus-within:border-sky-500/50 focus-within:shadow-[0_0_50px_-12px_rgba(14,165,233,0.3)] group mt-auto mb-4">
      <div className="flex-1 min-h-[44px] flex items-center pr-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind?"
          className="w-full bg-transparent border-0 ring-0 outline-none focus:ring-0 focus:outline-none text-gray-100 placeholder-gray-500 resize-none max-h-60 py-2.5 px-3 text-base leading-relaxed selection:bg-sky-500/30 shadow-none appearance-none"
          rows={1}
          disabled={disabled}
        />
      </div>
      
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className={cn(
          "w-12 h-12 rounded-[1.2rem] transition-all duration-500 flex items-center justify-center shrink-0 relative overflow-hidden",
          input.trim() && !disabled
            ? "bg-sky-500 text-white shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:shadow-[0_0_50px_rgba(14,165,233,0.7)] hover:-translate-y-1.5 active:scale-90"
            : "bg-white/5 text-gray-600 cursor-not-allowed"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <Send size={22} strokeWidth={2.5} className="relative z-10" />
      </button>
    </div>
  );
};
