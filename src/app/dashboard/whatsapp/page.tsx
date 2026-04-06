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
  const [newInstance, setNewInstance] = useState({ name: '' });
  
  // QR Code States
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'generating' | 'scanning' | 'connected'>('idle');

  useEffect(() => {
    fetchInstances();
    // Poll for changes if scanning
    let interval: NodeJS.Timeout;
    if (connectionStatus === 'scanning') {
      interval = setInterval(fetchInstances, 5000);
    }
    return () => clearInterval(interval);
  }, [connectionStatus]);

  const fetchInstances = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInstances(data || []);
      
      // If we find our brand new instance is now connected, close modal
      if (connectionStatus === 'scanning' && data?.find(i => i.instance_name === newInstance.name && i.status === 'connected')) {
        setConnectionStatus('connected');
        setTimeout(() => closeModal(), 2000);
      }
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
      console.log('Solicitando conexão via Proxy...');

      // Chamada para a nossa nova ponte (Proxy)
      const res = await fetch('/api/whatsapp/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName: newInstance.name })
      });

      const data = await res.json();
      console.log('Resposta do Proxy:', data);

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Erro na comunicação com a API');
      }

      // A Evolution API retorna o QR em base64 num campo chamado base64 (ou qrcode)
      const qrData = data.base64 || data.qrcode?.base64;

      if (qrData) {
        setQrCode(qrData);
        setConnectionStatus('scanning');
        
        // Registrar no Supabase que a instância existe (ou atualizar)
        await supabase.from('whatsapp_instances').upsert({
          instance_name: newInstance.name,
          instance_key: 'token_api',
          status: 'disconnected',
          user_id: (await supabase.auth.getUser()).data.user?.id || '00000000-0000-0000-0000-000000000000'
        }, { onConflict: 'instance_name' });
        
        fetchInstances();
      } else if (data.status === 'open' || data.instance?.status === 'open') {
        // Se já estiver conectada
        setConnectionStatus('connected');
        setTimeout(() => closeModal(), 2000);
        fetchInstances();
      } else {
        throw new Error('Não recebi o QR Code esperado. A instância pode estar ocupada.');
      }
    } catch (err: any) {
      console.error('Erro na conexão:', err);
      alert('ERRO: ' + (err.message || 'Falha ao processar QR Code.'));
      setConnectionStatus('idle');
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const deleteInstance = async (id: string, name: string) => {
    if (!confirm('Deseja realmente remover?')) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_EVOLUTION_API_URL;
      const apiKey = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY;
      if (apiUrl && apiKey) {
        await fetch(`${apiUrl}/instance/delete/${name}`, { method: 'DELETE', headers: { 'apikey': apiKey } });
      }
      await supabase.from('whatsapp_instances').delete().eq('id', id);
      fetchInstances();
    } catch (err) { console.error(err); }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setQrCode(null);
    setConnectionStatus('idle');
    setNewInstance({ name: '' });
  };

  return (
    <div className="p-12 space-y-12">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black mb-2">WhatsApp</h1>
          <p className="text-white/40 font-medium tracking-wide">Conexão direta via QR Code.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-[#00e5ff] text-black rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,229,255,0.3)]">
          <Plus className="w-5 h-5" /> Nova Conexão
        </button>
      </header>

      <div className="flex flex-wrap gap-6">
        <StatCard icon={<Smartphone />} label="Aparelhos" value={instances.length.toString()} trend="Ativo" color="#00e5ff" />
        <StatCard icon={<CheckCircle2 />} label="API Host" value="Railway" trend="Online" color="#4ade80" />
        <StatCard icon={<Zap />} label="Status" value="Pronto" trend="OK" color="#9b4dff" />
      </div>

      <div className="glass rounded-[2.5rem] border-white/5 p-8">
        <h2 className="text-2xl font-bold mb-8">Instâncias</h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <Loader2 className="animate-spin text-[#00e5ff]" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {instances.map((instance) => (
                <motion.div key={instance.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] hover:border-[#00e5ff]/30 transition-all">
                   <div className="flex justify-between items-start mb-4">
                      <div className={`p-4 rounded-2xl ${instance.status === 'connected' ? 'bg-[#00e5ff]/20 text-[#00e5ff]' : 'bg-white/5 text-white/20'}`}>
                        <MessageSquare size={24} />
                      </div>
                      <button onClick={() => deleteInstance(instance.id, instance.instance_name)} className="p-2 text-white/20 hover:text-red-400">
                        <Trash2 size={18} />
                      </button>
                   </div>
                   <h3 className="text-xl font-bold text-white">{instance.instance_name}</h3>
                   <span className={`text-[10px] font-black uppercase tracking-widest ${instance.status === 'connected' ? 'text-[#00e5ff]' : 'text-white/20'}`}>
                     {instance.status === 'connected' ? '● Conectado' : '○ Desconectado'}
                   </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal QR Code */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md glass p-10 rounded-[3rem] border-white/10 shadow-2xl overflow-hidden">
              <button onClick={closeModal} className="absolute top-8 right-8 text-white/20 hover:text-white"><X size={24} /></button>
              
              <div className="flex flex-col gap-8 text-center pt-4">
                <h2 className="text-3xl font-black text-white">Conectar Zap</h2>
                
                {connectionStatus === 'idle' ? (
                  <div className="space-y-6">
                    <input 
                      type="text" placeholder="Nome da Instância"
                      className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#00e5ff] outline-none text-center"
                      value={newInstance.name}
                      onChange={e => setNewInstance({ name: e.target.value })}
                    />
                    <button onClick={handleConnect} disabled={!newInstance.name} className="w-full py-5 bg-[#00e5ff] text-black font-black rounded-2xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)]">
                      GERAR QR CODE
                    </button>
                  </div>
                ) : connectionStatus === 'scanning' ? (
                  <div className="flex flex-col items-center gap-6">
                     <div className="p-4 bg-white rounded-3xl relative overflow-hidden">
                        <img src={qrCode!} className="w-56 h-56" alt="QR" />
                        <motion.div animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 3, repeat: Infinity }} className="absolute left-0 right-0 h-1 bg-[#00e5ff] shadow-[0_0_15px_#00e5ff]" />
                     </div>
                     <p className="text-xs text-[#00e5ff] font-black uppercase tracking-[0.2em] animate-pulse">Aguardando Leitura...</p>
                  </div>
                ) : connectionStatus === 'connected' ? (
                  <div className="flex flex-col items-center py-10 gap-4">
                     <CheckCircle2 className="text-[#00e5ff]" size={64} />
                     <p className="text-[#00e5ff] font-black">CONECTADO COM SUCESSO!</p>
                  </div>
                ) : (
                  <div className="py-20"><Loader2 className="animate-spin mx-auto text-[#00e5ff]" size={48} /></div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
