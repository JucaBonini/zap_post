"use client";

import React, { useState } from "react";
import { 
  Settings as SettingsIcon, 
  User, 
  CreditCard, 
  Bell, 
  Shield, 
  LogOut,
  Save,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("perfil");
  const [profile, setProfile] = useState({ name: "Usuário Premium", email: "contato@exemplo.com", notify: true });

  const tabs = [
    { id: "perfil", label: "Meu Perfil", icon: <User className="w-4 h-4" /> },
    { id: "plano", label: "Plano & Cobrança", icon: <CreditCard className="w-4 h-4" /> },
    { id: "notificacoes", label: "Notificações", icon: <Bell className="w-4 h-4" /> },
    { id: "seguranca", label: "Segurança", icon: <Shield className="w-4 h-4" /> }
  ];

  return (
    <div className="p-12">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black mb-2 flex items-center gap-4">
            <SettingsIcon className="w-10 h-10 text-white/40" />
            Configurações
          </h1>
          <p className="text-white/40 font-medium tracking-wide">Gerencie sua conta e preferências do sistema.</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
            {tabs.map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                    activeTab === tab.id ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
            ))}
        </div>

        <div className="lg:col-span-3">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-[2.5rem] border-white/5 p-12"
          >
            {activeTab === "perfil" && (
                <div className="max-w-xl space-y-8">
                    <h2 className="text-2xl font-bold mb-8">Informações Pessoais</h2>
                    
                    <div className="grid gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] uppercase font-black tracking-widest text-white/20 ml-2">Nome Completo</label>
                            <input 
                                type="text" 
                                className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl focus:border-[#9b4dff] transition-all outline-none"
                                value={profile.name}
                                onChange={e => setProfile({...profile, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] uppercase font-black tracking-widest text-white/20 ml-2">E-mail de Acesso</label>
                            <input 
                                type="email" 
                                disabled
                                className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl opacity-50 cursor-not-allowed"
                                value={profile.email}
                            />
                            <div className="text-[9px] text-[#00e5ff] uppercase font-black tracking-widest ml-1">E-mail Verificado ✅</div>
                        </div>
                    </div>

                    <button className="px-8 py-4 bg-[#9b4dff] text-white rounded-2xl font-black text-sm uppercase tracking-wider flex items-center gap-2 hover:scale-[1.02] shadow-[0_0_20px_rgba(155,77,255,0.3)] transition-all">
                        <Save className="w-4 h-4" /> Salvar Alterações
                    </button>
                </div>
            )}

            {activeTab === "plano" && (
                <div className="space-y-10">
                    <div className="flex justify-between items-center bg-[#9b4dff]/10 p-10 rounded-[3rem] border border-[#9b4dff]/20">
                        <div>
                            <div className="text-[10px] uppercase font-black tracking-widest text-[#9b4dff] mb-2">Seu Plano Atual</div>
                            <h3 className="text-4xl font-black mb-1 text-glow">Professional</h3>
                            <p className="text-white/40 text-sm">Próxima renovação: 15 de Abril, 2026</p>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-black mb-2">R$ 97<span className="text-sm opacity-30">/mês</span></div>
                            <button className="px-6 py-2 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-full hover:scale-105 transition-all">Mudar Plano</button>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-white/40 border-b border-white/5 pb-4">Benefícios do Plano</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                "Feeds Ilimitados",
                                "Conexões WhatsApp Ilimitadas",
                                "Suporte Prioritário 24/7",
                                "Dashboard Analytics",
                                "Templates Customizáveis",
                                "Logs de Atividade"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-white/80 font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "notificacoes" && (
                <div className="space-y-8">
                    <h2 className="text-2xl font-bold mb-8">Preferências de Notificação</h2>
                    <div className="space-y-6">
                        {[
                            { title: "Alertas de Erro", desc: "Receber notificações quando um feed falhar ao sincronizar." },
                            { title: "Relatório Mensal", desc: "Sumário mensal de desempenho dos disparos." },
                            { title: "Novos Posts", desc: "Alertar quando um novo post for enviado ao WhatsApp." }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 group hover:border-white/10 transition-all">
                                <div>
                                    <div className="font-bold mb-1">{item.title}</div>
                                    <div className="text-xs text-white/40">{item.desc}</div>
                                </div>
                                <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer p-1">
                                    <div className="w-4 h-4 bg-white/40 rounded-full absolute" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {activeTab === "seguranca" && (
                <div className="space-y-10">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Gerenciar Senha</h2>
                        <div className="grid gap-4 max-w-sm">
                            <input type="password" placeholder="Senha Atual" className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl" />
                            <input type="password" placeholder="Nova Senha" className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl" />
                            <button className="px-6 py-4 bg-white/5 text-white/60 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">Redefinir Senha</button>
                        </div>
                    </div>
                    
                    <div className="pt-10 border-t border-white/5">
                        <div className="p-8 bg-red-500/5 rounded-[2.5rem] border border-red-500/10 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-red-500 mb-2">Zona de Perigo</h3>
                                <p className="text-white/30 text-xs">Excluir sua conta e todos os dados permanentemente.</p>
                            </div>
                            <button className="px-8 py-4 bg-red-500/20 text-red-400 font-bold uppercase tracking-widest text-[10px] rounded-2xl hover:bg-red-500 hover:text-white transition-all">Excluir Conta</button>
                        </div>
                    </div>
                </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
