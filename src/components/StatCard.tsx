import React from "react";
import { ArrowUpRight } from "lucide-react";

export const StatCard = ({ icon, label, value, trend, color }: { icon: any, label: string, value: string, trend: string, color: string }) => (
    <div className="glass p-6 rounded-[2rem] border-white/5 flex-1 min-w-[240px]">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center`} style={{ background: `${color}15` }}>
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { 
            className: `w-6 h-6`, 
            style: { color: color } 
          }) : null}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${trend.startsWith("+") || trend === "100%" ? "text-green-400" : "text-red-400"}`}>
          {trend}
          <ArrowUpRight className="w-3 h-3" />
        </div>
      </div>
      <div className="text-white/40 text-[xs] font-bold uppercase tracking-widest mb-1">{label}</div>
      <div className="text-3xl font-black">{value}</div>
    </div>
  );
