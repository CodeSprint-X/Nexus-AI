/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { ChatInput } from "./components/ChatInput";
import { ChatColumn } from "./components/ChatColumn";
import { GridControls } from "./components/GridControls";
import { ConsensusModal } from "./components/ConsensusModal";
import { useStreamingChat } from "./hooks/useStreamingChat";
import { GroqService, ChatMessage } from "./services/groqService";
import { Menu, PanelLeftClose, Sparkles, Wand2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "./lib/utils";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [columns, setColumns] = useState(3);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isConsensusOpen, setIsConsensusOpen] = useState(false);
  const [consensusContent, setConsensusContent] = useState("");
  const [isGeneratingConsensus, setIsGeneratingConsensus] = useState(false);

  const { states, startStreaming, stopStreaming } = useStreamingChat();

  const handleSend = (prompt: string) => {
    startStreaming(prompt);
    setHistory(prev => [{ role: "user", content: prompt }, ...prev]);
  };

  const generateConsensus = async () => {
    const outputs = Object.values(states).map(s => s.tokens).filter(Boolean);
    if (outputs.length < 2) return;

    setIsGeneratingConsensus(true);
    try {
      const result = await GroqService.fetchConsensus(outputs);
      setConsensusContent(result);
      setIsConsensusOpen(true);
    } catch (error) {
      console.error("Consensus generation failed", error);
    } finally {
      setIsGeneratingConsensus(false);
    }
  };

  const isStreamingAny = Object.values(states).some(s => s.status === "streaming");
  const hasMultipleOutputs = Object.values(states).filter(s => s.tokens).length >= 2;

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        history={history.filter(m => m.role === "user").map(m => ({ title: m.content, date: m.role }))} // Minimal mapping for sidebar
        onClearHistory={() => setHistory([])}
      />

      <main className={cn(
        "flex-1 flex flex-col transition-all duration-300 ease-in-out relative",
        isSidebarOpen ? "ml-72" : "ml-0"
      )}>
        {/* Header */}
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-black/40 backdrop-blur-3xl sticky top-0 z-30">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 hover:bg-white/10 rounded-2xl transition-all text-gray-400 hover:text-white active:scale-95 flex items-center justify-center border border-transparent hover:border-white/10"
            >
              {isSidebarOpen ? <PanelLeftClose size={22} /> : <Menu size={22} />}
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-sky-400" />
                <h1 className="text-base font-bold text-white tracking-tight">Design Console</h1>
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mt-0.5">Nexus Neural Engine active</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <GridControls columns={columns} setColumns={setColumns} />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-sky-500/10 blur-[120px] rounded-full pointer-events-none opacity-30" />
          
          <div className={cn(
            "h-full p-6 grid gap-6 transition-all duration-700 ease-out",
            columns === 1 ? "grid-cols-1 max-w-4xl mx-auto" : 
            columns === 2 ? "grid-cols-1 md:grid-cols-2" : 
            "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}>
            <AnimatePresence mode="popLayout" initial={false}>
              {Object.entries(states).slice(0, columns).map(([id, state], index) => (
                <ChatColumn 
                  key={id} 
                  state={state} 
                  modelId={id}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Floating Action Button for Consensus */}
          {hasMultipleOutputs && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateConsensus}
              disabled={isGeneratingConsensus}
              className="fixed bottom-32 right-8 flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-semibold shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all z-40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingConsensus ? (
                <Sparkles size={18} className="animate-spin" />
              ) : (
                <Wand2 size={18} />
              )}
              {isGeneratingConsensus ? "Synthesizing..." : "Generate Consensus"}
            </motion.button>
          )}
        </div>

        {/* Fixed Footer Input */}
        <footer className="p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
          <ChatInput onSend={handleSend} disabled={isStreamingAny} />
          <p className="text-[10px] text-gray-600 text-center mt-3 tracking-tight">
            Models can make mistakes. Check important info. Parallel streaming with Groq LPU.
          </p>
        </footer>

        <ConsensusModal 
          isOpen={isConsensusOpen} 
          onClose={() => setIsConsensusOpen(false)} 
          consensusContent={consensusContent}
        />
      </main>
    </div>
  );
}

