import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  trend?: string;
  trendType?: "positive" | "neutral" | "warning";
  icon: ReactNode;
}

export default function MetricCard({ title, value, description, trend, trendType = "neutral", icon }: MetricCardProps) {
  const trendColors = {
    positive: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20",
    neutral: "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20",
    warning: "text-amber-400 bg-amber-500/10 border border-amber-500/20"
  };

  return (
    <div className="bg-slate-900/50 border border-white/8 backdrop-blur-md rounded-2xl p-5 flex items-start justify-between shadow-xl shadow-black/10 hover:border-slate-700 hover:shadow-cyan-950/10 transition-all duration-300" id={`metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-sans font-semibold text-slate-400 uppercase tracking-widest">{title}</span>
        <span className="text-3xl font-display font-black text-white tracking-tight leading-none drop-shadow-sm">{value}</span>
        <div className="flex items-center gap-1.5 mt-2.5">
          {trend && (
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${trendColors[trendType]}`}>
              {trend}
            </span>
          )}
          <span className="text-xs font-sans text-slate-400 font-normal">{description}</span>
        </div>
      </div>
      <div className="p-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-slate-300 shadow-inner">
        {icon}
      </div>
    </div>
  );
}
