'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Smartphone, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  Circle,
  QrCode,
  Loader2,
  X,
  ShieldCheck,
  Zap,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCard } from "@/components/StatCard";

export default function WhatsAppPage() {
  const [instances, setInstances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInstance, setNewInstance] = useState({ name: '', key: '' });
  
  // QR Code States
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'generating' | 'scanning' | 'connected'>('idle');

  useEffect(() => {
    fetchInstances();
  }, []);

  const fetchInstances = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInstances(data || []);
    } catch (err) {
      console.error('Erro ao buscar instâncias:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!newInstance.name) return;
    
    setIsGeneratingQr(true);
    setConnectionStatus('generating');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL;
      const apiKey = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY;

      if (!apiUrl || !apiKey) {
        alert('Configuração da Evolution API ausente na Netlify! Verifique as variáveis de ambiente.');
        setConnectionStatus('idle');
        return;
      }

      // 1. Create Instance in Evolution API
      const createRes = await fetch(`${apiUrl}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
        },
        body: JSON.stringify({
          instanceName: newInstance.name,
          token: newInstance.key || 'token_automatico',
          qrcode: true
        })
      });

      const createData = await createRes.json();

      if (createRes.ok || createData.instance) {
        // 2. Get QR Code
        const connectRes = await fetch(`${apiUrl}/instance/connect/${newInstance.name}`, {
          method: 'GET',
          headers: { 'apikey': apiKey }
        });
        
        const connectData = await connectRes.json();
        
        if (connectData.base64) {
          setQrCode(connectData.base64);
          setConnectionStatus('scanning');
          
          // 3. Save to Supabase (Pending connection)
          await supabase.from('whatsapp_instances').insert({
            instance_name: newInstance.name,
            instance_key: newInstance.key || createData.hash || 'token',
            status: 'disconnected',
            user_id: (await supabase.auth.getUser()).data.user?.id || '00000000-0000-0000-0000-000000000000'
          });
          
          fetchInstances();
        } else {
           // If instance was already connected or error
           setConnectionStatus('connected');
           fetchInstances();
        }
      } else {
        alert('Erro ao criar instância: ' + (createData.message || 'Erro desconhecido'));
        setConnectionStatus('idle');
      }
    } catch (err) {
      console.error('Erro na conexão:', err);
      alert('Falha ao conectar com o servidor Railway.');
      setConnectionStatus('idle');
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const deleteInstance = async (id: string, name: string) => {
    if (!confirm('Deseja realmente remover esta instância? Isso desconectará o WhatsApp.')) return;

    try {
      // Also try to delete from Evolution API
      const apiUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL;
      const apiKey = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY;
      if (apiUrl && apiKey) {
        await fetch(`${apiUrl}/instance/delete/${name}`, {
          method: 'DELETE',
          headers: { 'apikey': apiKey }
        });
      }

      await supabase.from('whatsapp_instances').delete().eq('id', id);
      setInstances(instances.filter(i => i.id !== id));
    } catch (err) {
      console.error('Erro ao deletar:', err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setQrCode(null);
    setConnectionStatus('idle');
    setNewInstance({ name: '', key: '' });
  };

  return (
    <div className="p-12 space-y-12">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black mb-2">WhatsApp</h1>
          <p className="text-white/40 font-medium tracking-wide">Gerencie suas conexões e escaneie o QR Code.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-[#00e5ff] text-black rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,229,255,0.3)]"
        >
          <Plus className="w-5 h-5" /> Nova Conexão
        </button>
      </header>

      {/* Stats Section */}
      <div className="flex flex-wrap gap-6">
        <StatCard icon={<Smartphone />} label="Conexões" value={instances.length.toString()} trend="Ativo" color="#00e5ff" />
        <StatCard icon={<ShieldCheck />} label="Status API" value="Cloud" trend="Online" color="#4ade80" />
        <StatCard icon={<Zap />} label="Latência" value="28ms" trend="-5%" color="#9b4dff" />
      </div>

      <div className="glass rounded-[2.5rem] border-white/5 p-8">
        <h2 className="text-2xl font-bold mb-8">Aparelhos Conectados</h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-[#00e5ff]" size={40} />
            <p className="text-white/40 font-bold">Buscando instâncias...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {instances.map((instance) => (
                <motion.div
                  key={instance.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative bg-white/5 border border-white/5 p-6 rounded-[2.5rem] overflow-hidden hover:bg-white/[0.08] transition-all hover:border-[#00e5ff]/30"
                >
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${instance.status === 'connected' ? 'from-[#00e5ff]/20 to-[#00b8d4]/10' : 'from-white/10 to-white/5'}`}>
                        <MessageSquare size={24} className={instance.status === 'connected' ? 'text-[#00e5ff]' : 'text-white/40'} />
                      </div>
                      <button 
                        onClick={() => deleteInstance(instance.id, instance.instance_name)}
                        className="p-2 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{instance.instance_name}</h3>
                      <div className="flex items-center gap-2">
                        {instance.status === 'connected' ? (
                          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-[#00e5ff]">
                            <CheckCircle2 size={10} /> Conectado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-white/20">
                            <Circle size={10} /> Desconectado
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">
                        ID: {instance.id.slice(0, 8)}
                      </span>
                      <button className="text-[10px] font-bold text-[#00e5ff] hover:underline uppercase tracking-widest">
                        Gerenciar
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {instances.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white/5 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                <QrCode className="mx-auto text-white/5 mb-4" size={64} />
                <p className="text-white/20 text-lg font-bold">Nenhum WhatsApp conectado.</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 text-[#00e5ff] font-bold hover:underline uppercase text-xs tracking-widest"
                >
                  Conectar agora
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Conexão com QR Code Dinâmico */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md glass p-10 rounded-[3rem] border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-8 right-8">
                <button onClick={closeModal} className="p-2 text-white/20 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col gap-8">
                <div>
                  <h2 className="text-3xl font-black text-white mb-2 leading-none">Conectar</h2>
                  <p className="text-white/40 text-sm font-medium">Linkando sua Evolution API via QR Code.</p>
                </div>

                {connectionStatus === 'idle' ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-4">Nome da Instância</label>
                      <input 
                        required
                        type="text" 
                        placeholder="Ex: Grupo Premium"
                        className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#00e5ff] outline-none transition-all"
                        value={newInstance.name}
                        onChange={e => setNewInstance({...newInstance, name: e.target.value})}
                      />
                    </div>
                    
                    <button 
                      onClick={handleConnect}
                      disabled={!newInstance.name || isGeneratingQr}
                      className="w-full py-5 bg-[#00e5ff] text-black font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(0,229,255,0.2)]"
                    >
                      {isGeneratingQr ? "Gerando..." : "GERAR QR CODE"}
                    </button>
                  </div>
                ) : connectionStatus === 'scanning' && qrCode ? (
                  <div className="flex flex-col items-center gap-8 py-4 animate-in fade-in zoom-in duration-700">
                    <div className="relative p-6 bg-white rounded-[2rem] overflow-hidden shadow-[0_0_60px_rgba(0,229,255,0.2)]">
                      <img src={qrCode} alt="WhatsApp QR Code" className="w-56 h-56" />
                      
                      {/* Scan Line Animation */}
                      <motion.div 
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-[#00e5ff] shadow-[0_0_20px_#00e5ff] opacity-50"
                      />
                    </div>
                    
                    <div className="text-center space-y-3">
                      <p className="text-xs text-white/40 font-medium px-4">
                        Abra o WhatsApp {'>'} Configurações {'>'} Aparelhos Conectados {'>'} Conectar um Aparelho
                      </p>
                      <div className="flex items-center justify-center gap-2 text-[#00e5ff] font-black text-[10px] uppercase tracking-[0.2em]">
                        <RefreshCw className="animate-spin" size={14} /> Aguardando Leitura
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <Loader2 className="animate-spin text-[#00e5ff]" size={48} />
                    <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Estabelecendo túnel...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
