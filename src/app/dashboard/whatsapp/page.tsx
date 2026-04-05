"use client";

import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Plus, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Trash2,
  X,
  Smartphone,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { StatCard } from "@/components/StatCard";

export default function WhatsAppPage() {
  const [instances, setInstances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  
  const [newInstance, setNewInstance] = useState({ name: "", apiKey: "" });

  useEffect(() => {
    fetchInstances();
  }, []);

  const fetchInstances = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('whatsapp_instances').select('*').order('created_at', { ascending: false });
      if (data) setInstances(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInstance = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    
    try {
      // Simulate real API connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { error } = await supabase.from('whatsapp_instances').insert({
        instance_name: newInstance.name,
        instance_key: newInstance.apiKey,
        status: 'connected', // Simulating successful connection
        user_id: (await supabase.auth.getUser()).data.user?.id || '00000000-0000-0000-0000-000000000000'
      });

      if (!error) {
        setIsModalOpen(false);
        setNewInstance({ name: "", apiKey: "" });
        fetchInstances();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConnecting(false);
    }
  };

  const handleDeleteInstance = async (id: string) => {
    if (!confirm("Desconectar esta instância?")) return;
    const { error } = await supabase.from('whatsapp_instances').delete().eq('id', id);
    if (!error) fetchInstances();
  };

  return (
    <div className="p-12">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black mb-2">WhatsApp</h1>
          <p className="text-white/40 font-medium tracking-wide">Gerencie suas conexões e grupos de destino.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-[#00e5ff] text-black rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,229,255,0.3)]"
        >
          <Plus className="w-5 h-5" /> Nova Conexão
        </button>
      </header>

      {/* Stats */}
      <div className="flex flex-wrap gap-6 mb-12">
        <StatCard icon={<Smartphone />} label="Aparelhos" value={instances.length.toString()} trend="Ativo" color="#00e5ff" />
        <StatCard icon={<ShieldCheck />} label="Segurança" value="Alta" trend="100%" color="#4ade80" />
        <StatCard icon={<Zap />} label="Latência" value="45ms" trend="-10%" color="#9b4dff" />
      </div>

      <div className="glass rounded-[2.5rem] border-white/5 p-8">
        <h2 className="text-2xl font-bold mb-8">Instâncias Ativas</h2>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/20">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <span className="font-bold text-glow">Buscando instâncias...</span>
          </div>
        ) : instances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/10 border-2 border-dashed border-white/5 rounded-3xl">
            <MessageSquare className="w-16 h-16 mb-4 opacity-5" />
            <span className="font-bold text-lg mb-2">Nenhuma conta conectada</span>
            <p className="text-sm">Conecte seu WhatsApp para começar a disparar posts.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instances.map((instance) => (
              <motion.div 
                key={instance.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-white/5 border border-white/5 relative group hover:border-[#00e5ff]/30 transition-all overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDeleteInstance(instance.id)} className="p-2 hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#075e54]/20 flex items-center justify-center text-[#25d366]">
                    <MessageSquare />
                  </div>
                  <div>
                    <div className="font-bold">{instance.instance_name}</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest">ID: {instance.id.substring(0,8)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] uppercase font-bold text-green-400 tracking-widest">{instance.status}</span>
                  </div>
                  <div className="text-[10px] text-white/30 font-bold">API KEY: ****{instance.instance_key.slice(-4)}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add Connection */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass p-10 rounded-[3rem] border-white/10 shadow-2xl"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full">
                <X className="w-6 h-6 text-white/40" />
              </button>
              <h2 className="text-3xl font-black mb-2">Conectar WhatsApp</h2>
              <p className="text-white/40 mb-8 font-medium">Integração com Evolution API ou similar.</p>
              
              <form onSubmit={handleAddInstance} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2 ml-4">Nome da Instância</label>
                  <input required type="text" placeholder="Ex: Grupo de Vendas"
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-[#00e5ff] outline-none"
                    value={newInstance.name} onChange={e => setNewInstance({...newInstance, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2 ml-4">API Key / Token</label>
                  <input required type="password" placeholder="Sua chave secreta"
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-[#00e5ff] outline-none"
                    value={newInstance.apiKey} onChange={e => setNewInstance({...newInstance, apiKey: e.target.value})}
                  />
                </div>
                <button type="submit" disabled={connecting}
                  className="w-full py-4 bg-[#00e5ff] text-black rounded-2xl font-black text-sm uppercase tracking-wider hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {connecting ? "Estabelecendo Conexão..." : "Conectar Agora"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
