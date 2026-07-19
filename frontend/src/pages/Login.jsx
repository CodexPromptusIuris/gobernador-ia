import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Shield, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await login(password); navigate("/"); }
    catch (err) { setError(err.message || "Credenciales inválidas"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-amber/10 border border-accent-amber/20 mb-5">
            <Shield className="w-7 h-7 text-accent-amber" />
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight mb-2">BRO PARTNER</h1>
          <p className="text-sm text-[#6b7280]">Panel de auditoría y revisión humana</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[#6b7280] mb-1.5 uppercase tracking-widest">Contraseña de acceso</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input pr-10" autoFocus required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a4a5a] hover:text-[#7a7570]">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <div className="text-sm text-accent-red bg-accent-red/5 border border-accent-red/20 rounded-md px-3 py-2">{error}</div>}
          <button type="submit" disabled={loading || !password} className="btn-primary w-full">{loading ? "Verificando…" : "Ingresar"}</button>
        </form>
        <p className="text-center text-xs text-[#3a3a4a] mt-8">ISO 42001 · EU AI Act · Auditoría inmutable</p>
      </div>
    </div>
  );
}
