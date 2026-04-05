"use client";

import React, { useState, useEffect } from "react";
import { 
  History, 
  Search, 
  Filter, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*, feeds(name)')
        .order('sent_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setLogs(data);
      }
    } catch (err) {
      console.error("Erro ao buscar logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.feeds?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-12">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black mb-2 flex items-center gap-4">
            <History className="w-10 h-10 text-[#9b4dff]" />
            Histórico de Disparos
          </h1>
          <p className="text-white/40 font-medium tracking-wide">Acompanhe todos os posts enviados aos canais do WhatsApp.</p>
        </div>
      </header>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
          <input 
            type="text" 
            placeholder="Pesquisar por título ou feed..."
            className="w-full bg-white/5 border border-white/5 p-4 pl-12 rounded-2xl focus:outline-none focus:border-[#9b4dff] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-6 py-4 bg-white/5 border border-white/5 rounded-2xl font-bold flex items-center gap-2 hover:bg-white/10 transition-all">
          <Filter className="w-4 h-4" /> Filtros
        </button>
      </div>

      <div className="glass rounded-[2.5rem] border-white/5 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 text-white/20">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <span className="font-bold uppercase tracking-widest text-xs">Carregando Histórico...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-white/10">
            <History className="w-20 h-20 mb-6 opacity-5" />
            <span className="font-bold text-xl">Nenhum registro encontrado</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="p-6 text-[10px] uppercase font-bold tracking-widest text-white/40">Data / Hora</th>
                  <th className="p-6 text-[10px] uppercase font-bold tracking-widest text-white/40">Feed</th>
                  <th className="p-6 text-[10px] uppercase font-bold tracking-widest text-white/40">Título do Post</th>
                  <th className="p-6 text-[10px] uppercase font-bold tracking-widest text-white/40 text-center">Status</th>
                  <th className="p-6 text-[10px] uppercase font-bold tracking-widest text-white/40 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.map((log) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={log.id} 
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="p-6 whitespace-nowrap">
                      <div className="text-sm font-bold text-white/80">
                        {new Date(log.sent_at).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-white/30 font-medium">
                        {new Date(log.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="px-3 py-1 bg-[#9b4dff]/10 text-[#9b4dff] text-[10px] font-black uppercase tracking-widest rounded-full inline-block">
                        {log.feeds?.name || 'RSS Feed'}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-sm font-bold text-white/90 line-clamp-1 max-w-md">{log.title}</div>
                      <div className="text-[10px] text-white/20 truncate max-w-sm">{log.link}</div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Enviado</span>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <a href={log.link} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-xl inline-block transition-colors">
                        <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-[#00e5ff]" />
                      </a>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-8 px-4">
        <div className="text-[10px] text-white/20 uppercase font-black tracking-widest">
          Exibindo {filteredLogs.length} de {logs.length} registros
        </div>
        <div className="flex gap-2">
            <button className="p-2 rounded-xl border border-white/5 opacity-50 hover:opacity-100 transition-opacity">
                <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-xl border border-white/5 hover:bg-white/5 transition-all">
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
}
