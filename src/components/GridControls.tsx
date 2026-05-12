import React from "react";
import { LayoutGrid, Maximize2, Columns, Monitor } from "lucide-react";
import { cn } from "../lib/utils";

interface GridControlsProps {
  columns: number;
  setColumns: (n: number) => void;
}

export const GridControls: React.FC<GridControlsProps> = ({ columns, setColumns }) => {
  const options = [
    { n: 1, icon: Maximize2, label: "Single" },
    { n: 2, icon: Columns, label: "Dual" },
    { n: 3, icon: LayoutGrid, label: "Triple" },
  ];

  return (
    <div className="flex items-center p-1.5 bg-white/5 border border-white/10 rounded-2xl shadow-xl backdrop-blur-md">
      {options.map((opt) => (
        <button
          key={opt.n}
          onClick={() => setColumns(opt.n)}
          className={cn(
            "p-2.5 rounded-xl transition-all duration-300 flex items-center gap-2.5 px-4",
            columns === opt.n 
              ? "bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.2)]" 
              : "text-gray-500 hover:text-gray-200 hover:bg-white/5 active:scale-95"
          )}
        >
          <opt.icon size={18} strokeWidth={columns === opt.n ? 2.5 : 2} />
          <span className={cn(
            "text-xs font-bold uppercase tracking-wider hidden sm:inline",
            columns === opt.n ? "opacity-100" : "opacity-60"
          )}>{opt.label}</span>
        </button>
      ))}
    </div>
  );
};
