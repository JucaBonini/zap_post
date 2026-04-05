"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Rss, 
  MessageSquare, 
  BarChart3, 
  Zap,
  Settings, 
  LogOut 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SidebarItem = ({ icon, label, href, active }: { icon: any, label: string, href: string, active: boolean }) => (
  <Link href={href}>
    <div className={`flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-all ${
      active ? "bg-[#9b4dff] text-white shadow-[0_0_20px_rgba(155,77,255,0.3)]" : "text-white/40 hover:text-white hover:bg-white/5"
    }`}>
      {icon}
      <span className="font-bold text-sm">{label}</span>
    </div>
  </Link>
);

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-[#0a0a0c] border-r border-white/5 p-8 flex flex-col fixed h-screen z-40">
      <div className="flex items-center gap-3 mb-16">
        <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#9b4dff] to-[#00e5ff] rounded-xl flex items-center justify-center">
                <Rss className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-glow">RSS Flow</span>
        </Link>
      </div>

      <div className="space-y-2 flex-1">
        <SidebarItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Dashboard" 
            href="/dashboard" 
            active={pathname === "/dashboard"} 
        />
        <SidebarItem 
            icon={<MessageSquare className="w-5 h-5" />} 
            label="WhatsApp" 
            href="/dashboard/whatsapp" 
            active={pathname === "/dashboard/whatsapp"} 
        />
        <SidebarItem 
            icon={<Rss className="w-5 h-5" />} 
            label="Meus Feeds" 
            href="/dashboard/feeds" 
            active={pathname === "/dashboard/feeds"} 
        />
        <SidebarItem 
            icon={<BarChart3 className="w-5 h-5" />} 
            label="Estatísticas" 
            href="/dashboard/stats" 
            active={pathname === "/dashboard/stats"} 
        />
        <SidebarItem 
            icon={<Zap className="w-5 h-5" />} 
            label="Histórico de Logs" 
            href="/dashboard/logs" 
            active={pathname === "/dashboard/logs"} 
        />
        <SidebarItem 
            icon={<Settings className="w-5 h-5" />} 
            label="Configuração" 
            href="/dashboard/settings" 
            active={pathname === "/dashboard/settings"} 
        />
      </div>

      <div className="mt-auto border-t border-white/5 pt-8">
        <SidebarItem 
            icon={<LogOut className="w-5 h-5" />} 
            label="Sair" 
            href="/" 
            active={false} 
        />
      </div>
    </aside>
  );
}
