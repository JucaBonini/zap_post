"use client";

import React, { useState, useEffect } from "react";
import { 
  Rss, 
  Plus, 
  Globe, 
  CheckCircle2, 
  MessageSquare,
  Zap,
  Loader2,
  Trash2,
  Settings,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { StatCard } from "@/components/StatCard";

export default function Dashboard() {
  const [feeds, setFeeds] = useState<any[]>([]);
  const [stats, setStats] = useState({ postsToday: 0, feedsActive: 0, groupsTarget: 0 });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  // Modal State
  const [newFeed, setNewFeed] = useState({ 
    name: "", 
    url: "", 
    limit: 10,
    target_jid: "",
    template: `🚀 *Nova fofoca fresquinha!*\n\n*{{titulo}}*\n\n{{resumo}}...\n\n🔗 *Leia mais:* {{link}}\n\n_Enviado via RSS Flow ⚡_`
  });
  const [addingFeed, setAddingFeed] = useState(false);
  const [editingFeed, setEditingFeed] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Feeds
      const { data: feedsData } = await supabase.from('feeds').select('*').order('created_at', { ascending: false });
      if (feedsData) setFeeds(feedsData);

      // 2. Fetch Stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gte('sent_at', today.toISOString());

      const { count: groupsCount } = await supabase
        .from('whatsapp_instances')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'connected');

      setStats({
        postsToday: postsCount || 0,
        feedsActive: feedsData?.length || 0,
        groupsTarget: groupsCount || 0
      });

      // 3. Fetch Recent Activity
      const { data: activityData, error: activityError } = await supabase
        .from('posts')
        .select('*, feeds(name)')
        .order('sent_at', { ascending: false })
        .limit(5);
      
      if (!activityError && activityData) {
        setRecentPosts(activityData);
      }

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();
      console.log('Sync result:', data);
      await fetchDashboardData();
    } catch (err) {
      console.error('Falha na sincronização:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteFeed = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este feed?")) return;
    
    try {
      const { error } = await supabase.from('feeds').delete().eq('id', id);
      if (!error) fetchDashboardData();
    } catch (err) {
      console.error(err);
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
        fetchDashboardData();
      } else {
        console.error('Erro ao salvar feed:', error);
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
          target_jid: editingFeed.target_jid
        })
        .eq('id', editingFeed.id);

      if (!error) {
        setEditingFeed(null);
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingFeed(false);
    }
  };

  return (
    <div className="p-12">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black mb-2">Painel de Controle</h1>
          <p className="text-white/40 font-medium tracking-wide">Benvindo de volta! Suas automações estão prontas.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-[#9b4dff] text-white rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_30px_rgba(155,77,255,0.4)]"
        >
          <Plus className="w-5 h-5" /> Novo Feed
        </button>
      </header>

      {/* Stats Grid */}
      <div className="flex flex-wrap gap-6 mb-12">
        <StatCard icon={<Zap />} label="Posts Hoje" value={stats.postsToday.toString()} trend="+0%" color="#9b4dff" />
        <StatCard icon={<Rss />} label="Feeds Ativos" value={stats.feedsActive.toString()} trend={`+${stats.feedsActive}`} color="#00e5ff" />
        <StatCard icon={<MessageSquare />} label="Grupos Alvo" value={stats.groupsTarget.toString()} trend="0%" color="#ff4d94" />
        <StatCard icon={<CheckCircle2 />} label="Eficiência" value="100%" trend="0" color="#4ade80" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="glass rounded-[2.5rem] border-white/5 p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Meus Canais de Conteúdo</h2>
              <div className="text-white/30 text-xs font-bold uppercase tracking-widest">{feeds.length} Feed(s) Encontrados</div>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/20">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <span className="font-bold">Carregando dados do Supabase...</span>
              </div>
            ) : feeds.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/10 border-2 border-dashed border-white/5 rounded-3xl">
                <Rss className="w-16 h-16 mb-4 opacity-5" />
                <span className="font-bold text-lg mb-2">Nenhum feed cadastrado ainda</span>
                <p className="text-sm">Clique em "Novo Feed" para começar sua automação.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feeds.map((feed, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={feed.id} 
                    className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-[#9b4dff]/30 transition-all hover:bg-white/[0.08] group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#0a0a0c] flex items-center justify-center border border-white/10 group-hover:border-[#9b4dff]/50 transition-colors">
                        <Globe className="text-[#9b4dff] w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-lg mb-0.5">{feed.name}</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-widest truncate max-w-[200px]">{feed.url}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Posts/Dia</div>
                        <div className="font-black text-lg">{feed.posts_limit_daily}</div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        feed.is_active ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"
                      }`}>
                        {feed.is_active ? "Ativo" : "Pausado"}
                      </div>
                      <button 
                        onClick={() => setEditingFeed(feed)}
                        className="p-3 hover:bg-white/10 rounded-2xl transition-colors"
                      >
                        <Settings className="w-5 h-5 text-white/20 hover:text-white transition-colors" />
                      </button>
                      <button 
                        onClick={() => handleDeleteFeed(feed.id)}
                        className="p-3 hover:bg-white/10 rounded-2xl transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-400/40 hover:text-red-400 transition-colors" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity Logs */}
        <div className="lg:col-span-1">
          <div className="glass rounded-[2.5rem] border-white/5 p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Atividade Recente</h2>
              <button 
                onClick={handleSync}
                disabled={syncing}
                className={`p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all ${syncing ? 'animate-spin opacity-50' : ''}`}
                title="Sincronizar Agora"
              >
                <Zap className="w-4 h-4 text-[#9b4dff]" />
              </button>
            </div>

            {recentPosts.length === 0 ? (
              <div className="text-white/20 text-center py-20 italic flex-1 flex items-center justify-center">
                {syncing ? "Sincronizando feeds..." : "Nenhuma atividade registrada ainda."}
              </div>
            ) : (
              <div className="space-y-6 flex-1">
                {recentPosts.map((post: any, i: number) => (
                  <div key={post.id} className="flex gap-4 group">
                    <div className="relative">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#9b4dff] mt-2 group-hover:scale-150 transition-transform" />
                      {i !== recentPosts.length - 1 && <div className="absolute top-4 left-[3px] w-[1px] h-full bg-white/5" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-1">
                        {new Date(post.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {post.feeds?.name}
                      </div>
                      <div className="text-xs font-bold text-white/80 line-clamp-1">{post.title}</div>
                      <div className="text-[10px] text-green-400 font-bold uppercase mt-1 tracking-tighter">Enviado ao WhatsApp</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button className="w-full mt-8 py-3 rounded-2xl border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white hover:bg-white/5 transition-all">
              Ver Logs Completos
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Add New Feed */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass p-10 rounded-[3rem] border-white/10 shadow-2xl"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white/40" />
              </button>
              <h2 className="text-3xl font-black mb-2">Novo Feed RSS</h2>
              <p className="text-white/40 mb-8 font-medium">Cadastre seu blog e deixe o bot gerenciar as postagens.</p>
              
              <form onSubmit={handleAddFeed} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2 ml-4">Nome Amigável</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ex: Blog da Empresa"
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:outline-none focus:border-[#9b4dff] transition-colors"
                    value={newFeed.name}
                    onChange={e => setNewFeed({...newFeed, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2 ml-4">URL do RSS Feed</label>
                  <input 
                    required
                    type="url" 
                    placeholder="https://seu-site.com/feed"
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:outline-none focus:border-[#00e5ff] transition-colors"
                    value={newFeed.url}
                    onChange={e => setNewFeed({...newFeed, url: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2 ml-4">ID de Destino (Grupo ou Canal)</label>
                  <input 
                    required
                    type="text" 
                    placeholder="ex: 1234567890@g.us ou @newsletter"
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:outline-none focus:border-[#00e5ff] transition-colors"
                    value={newFeed.target_jid}
                    onChange={e => setNewFeed({...newFeed, target_jid: e.target.value})}
                  />
                  <p className="text-[9px] text-white/20 mt-1 ml-4 font-medium uppercase tracking-tight">Pegue este ID no painel Manager da Evolution API</p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2 ml-4">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Template da Mensagem</label>
                    <div className="text-[9px] text-white/20 flex gap-2">
                        <span>{"{{titulo}}"}</span>
                        <span>{"{{link}}"}</span>
                        <span>{"{{resumo}}"}</span>
                    </div>
                  </div>
                  <textarea 
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:outline-none focus:border-[#9b4dff] transition-colors resize-none text-sm"
                    value={newFeed.template}
                    onChange={e => setNewFeed({...newFeed, template: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2 ml-4">Limite Diário</label>
                    <input 
                      required
                      type="number" 
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:outline-none focus:border-[#ff4d94] transition-colors"
                      value={newFeed.limit}
                      onChange={e => setNewFeed({...newFeed, limit: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      type="submit"
                      disabled={addingFeed}
                      className="w-full py-4 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50"
                    >
                      {addingFeed ? "Salvando..." : "Salvar Feed"}
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
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditingFeed(null)}
              className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass p-10 rounded-[3rem] border-white/10 shadow-2xl"
            >
              <button 
                onClick={() => setEditingFeed(null)}
                className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white/40" />
              </button>
              <h2 className="text-3xl font-black mb-2">Editar Feed</h2>
              <p className="text-white/40 mb-8 font-medium">Atualize as configurações do seu canal de conteúdo.</p>
              
              <form onSubmit={handleEditFeed} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2 ml-4">Nome Amigável</label>
                  <input 
                    required type="text"
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:outline-none focus:border-[#9b4dff] transition-colors"
                    value={editingFeed.name}
                    onChange={e => setEditingFeed({...editingFeed, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2 ml-4">URL do RSS Feed</label>
                  <input 
                    required type="url"
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:outline-none focus:border-[#00e5ff] transition-colors"
                    value={editingFeed.url}
                    onChange={e => setEditingFeed({...editingFeed, url: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2 ml-4">ID de Destino (Grupo ou Canal)</label>
                  <input 
                    required type="text"
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:outline-none focus:border-[#00e5ff] transition-colors"
                    value={editingFeed.target_jid}
                    onChange={e => setEditingFeed({...editingFeed, target_jid: e.target.value})}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2 ml-4">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Template da Mensagem</label>
                    <div className="text-[9px] text-white/20 flex gap-2">
                        <span>{"{{titulo}}"}</span>
                        <span>{"{{link}}"}</span>
                        <span>{"{{resumo}}"}</span>
                    </div>
                  </div>
                  <textarea 
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:outline-none focus:border-[#9b4dff] transition-colors resize-none text-sm"
                    value={editingFeed.message_template}
                    onChange={e => setEditingFeed({...editingFeed, message_template: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2 ml-4">Limite Diário</label>
                    <input 
                      required type="number" 
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:outline-none focus:border-[#ff4d94] transition-colors"
                      value={editingFeed.posts_limit_daily}
                      onChange={e => setEditingFeed({...editingFeed, posts_limit_daily: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      type="submit"
                      disabled={addingFeed}
                      className="w-full py-4 bg-[#9b4dff] text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:scale-[1.02] shadow-xl disabled:opacity-50"
                    >
                      {addingFeed ? "Salvando..." : "Salvar Alterações"}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
