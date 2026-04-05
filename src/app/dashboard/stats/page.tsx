"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  MessageSquare, 
  Clock, 
  Target,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { StatCard } from "@/components/StatCard";

// Mock data for the chart since we don't have a charting lib installed.
// We'll build a custom CSS-Based chart that looks premium.
const weeklyData = [
    { day: "Seg", count: 45, color: "#9b4dff" },
    { day: "Ter", count: 68, color: "#ff4d94" },
    { day: "Qua", count: 32, color: "#00e5ff" },
    { day: "Qui", count: 89, color: "#4ade80" },
    { day: "Sex", count: 54, color: "#9b4dff" },
    { day: "Sab", count: 21, color: "#ff4d94" },
    { day: "Dom", count: 12, color: "#00e5ff" }
];

export default function StatsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating data loading
    setTimeout(() => setLoading(false), 800);
  }, []);

  return (
    <div className="p-12">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black mb-2 flex items-center gap-4">
            <BarChart3 className="w-10 h-10 text-[#00e5ff]" />
            Estatísticas de Tráfego
          </h1>
          <p className="text-white/40 font-medium tracking-wide">Análise detalhada do desempenho dos seus disparos.</p>
        </div>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard icon={<TrendingUp />} label="Crescimento" value="+12%" trend="Este mês" color="#00e5ff" />
        <StatCard icon={<Zap />} label="Posts Totais" value="1,280" trend="+12% hoje" color="#9b4dff" />
        <StatCard icon={<MessageSquare />} label="Engajamento" value="High" trend="98.2%" color="#4ade80" />
        <StatCard icon={<Target />} label="Taxa de Entrega" value="99.9%" trend="0 falhas" color="#ff4d94" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="glass rounded-[2.5rem] border-white/5 p-10 h-full">
            <div className="flex justify-between items-center mb-12">
                <h2 className="text-2xl font-bold">Posts Enviados (Últimos 7 dias)</h2>
                <div className="flex gap-2">
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#9b4dff]/40">Relatório Semanal</span>
                </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/10">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="flex items-end justify-between gap-6 h-64 mt-12 bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 shadow-inner">
                {weeklyData.map((data, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center group relative">
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 bg-white text-black text-[10px] font-black px-2 py-1 rounded-lg shadow-xl translate-y-2 group-hover:translate-y-0">
                      {data.count}
                    </div>
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${data.count}%` }}
                      transition={{ delay: i * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                      style={{ backgroundColor: data.color }}
                      className="w-full rounded-t-xl group-hover:brightness-125 transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] cursor-pointer"
                    />
                    <span className="mt-4 text-[10px] font-bold uppercase tracking-widest text-white/20 group-hover:text-white transition-colors">{data.day}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-12 flex gap-10">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#9b4dff]" />
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Feeds Blogs</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#ff4d94]" />
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Feeds Notícias</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="glass rounded-[2.5rem] border-white/5 p-10 h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-8">Performance por Canal</h2>
            <div className="space-y-8 flex-1 mt-6">
                {[
                  { name: "Blog ICDDH", progress: 85, color: "#9b4dff" },
                  { name: "Portal G1", progress: 40, color: "#00e5ff" },
                  { name: "Folha de SP", progress: 65, color: "#ff4d94" }
                ].map((channel, i) => (
                  <div key={i}>
                      <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-bold text-white/80">{channel.name}</span>
                          <span className="text-xs font-black text-white/30 uppercase tracking-tighter">{channel.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${channel.progress}%` }}
                              transition={{ duration: 1, delay: 0.5 + (i * 0.2) }}
                              className="h-full rounded-full shadow-[0_0_10px_rgba(155,77,255,0.4)]" 
                              style={{ backgroundColor: channel.color }}
                          />
                      </div>
                  </div>
                ))}
            </div>

            <div className="mt-8 p-6 bg-[#4ade80]/10 rounded-3xl border border-[#4ade80]/10 flex items-center justify-between">
                <div>
                    <div className="text-[10px] font-black uppercase text-[#4ade80] tracking-widest mb-1">Status Global</div>
                    <div className="text-sm font-bold">Bots Operando 100%</div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#4ade80]/20 flex items-center justify-center">
                    <ArrowUpRight className="text-[#4ade80] w-6 h-6" />
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
