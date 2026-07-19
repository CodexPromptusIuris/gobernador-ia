import { useAuth } from "../contexts/AuthContext";
import { Shield, LogOut } from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="border-b border-surface-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
        <a href="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="vibecodingchile" className="w-8 h-8 object-contain rounded-md" />
          <span className="font-display text-lg font-semibold tracking-tight">
            BRO PARTNER
            <span className="text-[#6b7280] text-sm font-normal ml-2">| Panel de Auditoría</span>
          </span>
        </a>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[#6b7280]">{user?.username}<span className="ml-1.5 text-[#3a3a4a]">({user?.role})</span></span>
          <button onClick={logout} className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-accent-red transition-colors">
            <LogOut className="w-3.5 h-3.5" />Salir
          </button>
        </div>
      </div>
    </header>
  );
}
