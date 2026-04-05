"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Rss, 
  MessageSquare, 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  BarChart3,
  ArrowRight,
  TrendingUp,
  Settings2
} from "lucide-react";
import Image from "next/image";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] text-[#f2f2f7] overflow-x-hidden selection:bg-[#9b4dff]/30">
      {/* Background Glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#9b4dff]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00e5ff]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#9b4dff] to-[#00e5ff] rounded-xl flex items-center justify-center">
              <Rss className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">RSS Flow</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-white/70">
            <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
            <a href="#pricing" className="hover:text-white transition-colors">Preços</a>
            <a href="#about" className="hover:text-white transition-colors">Sobre</a>
          </div>
          <button className="px-5 py-2.5 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition-transform">
            Try Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            {...fadeInUp}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-6 border-white/10"
          >
            <Zap className="w-4 h-4 text-[#00e5ff]" />
            <span className="text-xs font-semibold tracking-wider uppercase text-white/60">Novo: Automação por IA integrada</span>
          </motion.div>
          
          <motion.h1 
            {...fadeInUp}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter"
          >
            Seu Blog direto no <br />
            <span className="bg-gradient-to-r from-[#9b4dff] via-[#00e5ff] to-[#ff4d94] bg-clip-text text-transparent">
              WhatsApp em segundos.
            </span>
          </motion.h1>
          
          <motion.p 
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            O RSS Flow automatiza a postagem das suas notícias em grupos e canais. 
            Controle total sobre o volume de posts, sem repetições e com design profissional.
          </motion.p>
          
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <button className="w-full sm:w-auto px-8 py-4 bg-[#9b4dff] text-white rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(155,77,255,0.4)] transition-all flex items-center justify-center gap-2">
              Começar Agora <ArrowRight className="w-5 h-5" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 glass text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all">
              Ver Demonstração
            </button>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="relative max-w-5xl mx-auto mt-12 rounded-[2rem] glass p-1.5 shadow-2xl border-white/5 overflow-hidden"
          >
            <div className="relative rounded-[1.8rem] overflow-hidden bg-[#1c1c1e] border border-white/10 shadow-inner">
               <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent z-10 opacity-60" />
               <Image 
                src="/dashboard-mockup.png" 
                alt="RSS Flow Dashboard" 
                width={1200}
                height={800}
                className="w-full h-auto object-cover opacity-90"
               />
            </div>
            {/* Floating Badges */}
            <div className="absolute -left-12 top-1/4 glass p-4 rounded-2xl hidden lg:block animate-bounce shadow-2xl border-white/10 z-20">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="text-green-400 w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Post Enviado</div>
                    <div className="text-xs font-bold">Notícia #1243 no Canal</div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Por que o RSS Flow?</h2>
            <p className="text-white/50 text-lg">Criado para blogs, portais de notícia e comunidades que precisam de agilidade.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart3 className="text-[#9b4dff]" />,
                title: "Controle de Volume",
                desc: "Defina exatamente quantos posts deseja por dia ou por hora para não sobrecarregar sua audiência."
              },
              {
                icon: <ShieldCheck className="text-[#00e5ff]" />,
                title: "Zero Duplicidade",
                desc: "Nosso algoritmo inteligente garante que a mesma notícia nunca seja postada duas vezes no mesmo canal."
              },
              {
                icon: <Settings2 className="text-[#ff4d94]" />,
                title: "Filtros Inteligentes",
                desc: "Filtre posts por palavras-chave ou categorias específicas antes de enviar para o WhatsApp."
              }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-8 rounded-3xl border-white/5 hover:border-white/10 transition-colors group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                <p className="text-white/40 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 glass border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <div className="text-4xl font-black mb-2 text-[#9b4dff]">1.2M+</div>
            <div className="text-xs uppercase tracking-widest text-white/40 font-bold">Posts Enviados</div>
          </div>
          <div>
            <div className="text-4xl font-black mb-2 text-[#00e5ff]">500+</div>
            <div className="text-xs uppercase tracking-widest text-white/40 font-bold">Canais Ativos</div>
          </div>
          <div>
            <div className="text-4xl font-black mb-2 text-[#ff4d94]">99.9%</div>
            <div className="text-xs uppercase tracking-widest text-white/40 font-bold">Uptime</div>
          </div>
          <div>
            <div className="text-4xl font-black mb-2 text-white">24/7</div>
            <div className="text-xs uppercase tracking-widest text-white/40 font-bold">Monitoramento</div>
          </div>
        </div>
      </section>

      {/* Pricing - Compact & Premium */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-16">Simples e Flexível</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Basic */}
            <div className="glass p-10 rounded-[2.5rem] border-white/10 flex flex-col text-left hover:scale-[1.02] transition-all">
              <h3 className="text-xl font-bold mb-2">Starter</h3>
              <p className="text-white/40 text-sm mb-6">Para pequenos blogs e comunidades.</p>
              <div className="text-4xl font-black mb-8">R$ 49<span className="text-lg font-normal text-white/40">/mês</span></div>
              <ul className="space-y-4 mb-10 flex-1 text-sm">
                <li className="flex items-center gap-3 text-white/60"><CheckCircle2 className="w-4 h-4 text-green-400" /> Até 3 RSS Feeds</li>
                <li className="flex items-center gap-3 text-white/60"><CheckCircle2 className="w-4 h-4 text-green-400" /> 1 Canal/Grupo WhatsApp</li>
                <li className="flex items-center gap-3 text-white/60"><CheckCircle2 className="w-4 h-4 text-green-400" /> Verificação a cada 30 min</li>
                <li className="flex items-center gap-3 text-white/60"><CheckCircle2 className="w-4 h-4 text-green-400" /> Controle de posts</li>
              </ul>
              <button className="w-full py-4 glass text-white rounded-2xl font-bold hover:bg-white/5">Escolher Plano</button>
            </div>
            
            {/* Pro - Featured */}
            <div className="bg-[#9b4dff] p-10 rounded-[2.5rem] flex flex-col text-left relative overflow-hidden shadow-[0_0_50px_rgba(155,77,255,0.3)] hover:scale-[1.02] transition-all">
              <div className="absolute top-6 right-6 px-3 py-1 bg-white text-[#9b4dff] text-[10px] font-black rounded-full uppercase tracking-widest">Pupular</div>
              <h3 className="text-xl font-bold mb-2 text-white">Professional</h3>
              <p className="text-white/70 text-sm mb-6">Para portais com grande volume.</p>
              <div className="text-4xl font-black mb-8 text-white">R$ 129<span className="text-lg font-normal text-white/70">/mês</span></div>
              <ul className="space-y-4 mb-10 flex-1 text-sm">
                <li className="flex items-center gap-3 text-white"><CheckCircle2 className="w-4 h-4 text-white" /> Ilimitados RSS Feeds</li>
                <li className="flex items-center gap-3 text-white"><CheckCircle2 className="w-4 h-4 text-white" /> 10 Canais/Grupos WhatsApp</li>
                <li className="flex items-center gap-3 text-white"><CheckCircle2 className="w-4 h-4 text-white" /> Verificação em Tempo Real</li>
                <li className="flex items-center gap-3 text-white"><CheckCircle2 className="w-4 h-4 text-white" /> Filtros Avançados via IA</li>
              </ul>
              <button className="w-full py-4 bg-white text-[#9b4dff] rounded-2xl font-bold hover:shadow-xl">Assinar Agora</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-[#9b4dff] to-[#00e5ff] rounded-lg" />
            <span className="font-bold tracking-tight">RSS Flow</span>
          </div>
          <p className="text-white/30 text-sm">© 2026 RSS Flow. Transformando conteúdo em audiência automática.</p>
        </div>
      </footer>
    </main>
  );
}
