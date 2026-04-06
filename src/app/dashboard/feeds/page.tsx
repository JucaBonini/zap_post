"use client";

import React, { useState, useEffect } from "react";
import { 
  Rss, 
  Plus, 
  Globe, 
  CheckCircle2, 
  Settings,
  X,
  Loader2,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { StatCard } from "@/components/StatCard";

export default function FeedsPage() {
  const [feeds, setFeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addingFeed, setAddingFeed] = useState(false);
  const [editingFeed, setEditingFeed] = useState<any>(null);

  const [newFeed, setNewFeed] = useState({ 
    name: "", 
    url: "", 
    limit: 10,
    target_jid: "",
    template: `🚀 *Nova fofoca fresquinha!*\n\n*{{titulo}}*\n\n{{resumo}}...\n\n🔗 *Leia mais:* {{link}}\n\n_Enviado via RSS Flow ⚡_`
  });

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('feeds')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFeeds(data || []);
    } catch (err) {
      console.error('Erro ao buscar feeds:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingFeed(true);
    
    try {
      const { error } = await supabase.from('feeds').insert({
        name: newFeed.name,
        url: newFeed.url,
        posts_limit_daily: newFeed.limit,
        message_template: newFeed.template,
        target_jid: newFeed.target_jid,
        user_id: (await supabase.auth.getUser()).data.user?.id || '00000000-0000-0000-0000-000000000000'
      });

      if (!error) {
        setIsModalOpen(false);
        setNewFeed({ 
          name: "", 
          url: "", 
          limit: 10, 
          target_jid: "",
          template: `🚀 *Nova fofoca fresquinha!*\n\n*{{titulo}}*\n\n{{resumo}}...\n\n🔗 *Leia mais:* {{link}}\n\n_Enviado via RSS Flow ⚡_` 
        });
        fetchFeeds();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingFeed(false);
    }
  };

  const handleEditFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingFeed(true);
    try {
      const { error } = await supabase
        .from('feeds')
        .update({
          name: editingFeed.name,
          url: editingFeed.url,
          posts_limit_daily: editingFeed.posts_limit_daily,
          message_template: editingFeed.message_template,
          target_jid: editingFeed.target_jid,
          is_active: editingFeed.is_active
        })
        .eq('id', editingFeed.id);

      if (!error) {
        setEditingFeed(null);
        fetchFeeds();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingFeed(false);
    }
  };

  const handleDeleteFeed = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este feed?")) return;
    try {
      const { error } = await supabase.from('feeds').delete().eq('id', id);
      if (!error) fetchFeeds();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-12">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black mb-2">Meus Feeds</h1>
          <p className="text-white/40 font-medium tracking-wide">Gerencie as fontes de notícia e canais de saída.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-[#00e5ff] text-black rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,229,255,0.3)]"
        >
          <Plus className="w-5 h-5" /> Novo Feed
        </button>
      </header>

      <div className="flex flex-wrap gap-6 mb-12">
        <StatCard icon={<Rss />} label="Total de Feeds" value={feeds.length.toString()} trend="Ativo" color="#00e5ff" />
        <StatCard icon={<CheckCircle2 />} label="Status Sistema" value="Online" trend="OK" color="#4ade80" />
      </div>

      <div className="glass rounded-[2.5rem] border-white/5 p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#00e5ff] mb-4" />
            <span className="font-bold text-white/40">Sincronizando com Supabase...</span>
          </div>
        ) : feeds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/10 border-2 border-dashed border-white/5 rounded-3xl">
            <Rss size={64} className="mb-4 opacity-5" />
            <p className="font-bold">Nenhum feed encontrado.</p>
            <button onClick={() => setIsModalOpen(true)} className="mt-4 text-[#00e5ff] font-bold underline">Clique aqui para adicionar o primeiro</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {feeds.map((feed) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={feed.id} 
                className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-[#00e5ff]/30 transition-all hover:bg-white/[0.08] group"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#0a0a0c] flex items-center justify-center border border-white/10 group-hover:border-[#00e5ff]/50 transition-colors">
                    <Globe className="text-[#00e5ff] w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-lg mb-0.5">{feed.name}</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest truncate max-w-[250px]">{feed.url}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-center hidden md:block">
                    <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Posts/Dia</div>
                    <div className="font-black text-lg">{feed.posts_limit_daily}</div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    feed.is_active ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"
                  }`}>
                    {feed.is_active ? "Ativo" : "Pausado"}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingFeed(feed)} className="p-3 hover:bg-white/10 rounded-2xl transition-colors">
                      <Settings className="w-5 h-5 text-white/20 hover:text-white" />
                    </button>
                    <button onClick={() => handleDeleteFeed(feed.id)} className="p-3 hover:bg-white/10 rounded-2xl transition-colors">
                      <Trash2 className="w-5 h-5 text-red-400/40 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add New Feed */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg glass p-10 rounded-[3rem] border-white/10 shadow-2xl">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full"><X className="w-6 h-6 text-white/40" /></button>
              <h2 className="text-3xl font-black mb-6">Novo Feed RSS</h2>
              
              <form onSubmit={handleAddFeed} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2 ml-4">Nome do Feed</label>
                  <input required type="text" placeholder="Ex: G1 Fofocas" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-[#00e5ff] outline-none" value={newFeed.name} onChange={e => setNewFeed({...newFeed, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2 ml-4">URL RSS</label>
                  <input required type="url" placeholder="https://site.com/feed" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-[#00e5ff] outline-none" value={newFeed.url} onChange={e => setNewFeed({...newFeed, url: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2 ml-4">WhatsApp JID (ID do Grupo)</label>
                  <input required type="text" placeholder="1234567890@g.us" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-[#00e5ff] outline-none" value={newFeed.target_jid} onChange={e => setNewFeed({...newFeed, target_jid: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2 ml-4">Limite Diário</label>
                    <input required type="number" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-[#00e5ff] outline-none text-center" value={newFeed.limit} onChange={e => setNewFeed({...newFeed, limit: parseInt(e.target.value)})} />
                  </div>
                  <div className="flex items-end">
                    <button type="submit" disabled={addingFeed} className="w-full py-4 bg-[#00e5ff] text-black rounded-2xl font-black uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 text-xs">
                      {addingFeed ? "Salvando..." : "Criar Feed"}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Edit Feed */}
      <AnimatePresence>
        {editingFeed && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingFeed(null)} className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg glass p-10 rounded-[3rem] border-white/10 shadow-2xl">
              <button onClick={() => setEditingFeed(null)} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full"><X className="w-6 h-6 text-white/40" /></button>
              <h2 className="text-3xl font-black mb-6">Editar Feed</h2>
              
              <form onSubmit={handleEditFeed} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2 ml-4">Nome do Feed</label>
                  <input required type="text" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-[#00e5ff] outline-none" value={editingFeed.name} onChange={e => setEditingFeed({...editingFeed, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2 ml-4">URL RSS</label>
                  <input required type="url" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-[#00e5ff] outline-none" value={editingFeed.url} onChange={e => setEditingFeed({...editingFeed, url: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2 ml-4">Status</label>
                  <select className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-[#00e5ff] outline-none text-white" value={editingFeed.is_active ? 'true' : 'false'} onChange={e => setEditingFeed({...editingFeed, is_active: e.target.value === 'true'})}>
                    <option value="true" className="bg-[#0a0a0c]">Ativo</option>
                    <option value="false" className="bg-[#0a0a0c]">Pausado</option>
                  </select>
                </div>
                <button type="submit" disabled={addingFeed} className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-wider hover:scale-[1.02] shadow-xl disabled:opacity-50 text-xs">
                  {addingFeed ? "Salvando..." : "Salvar Alterações"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
