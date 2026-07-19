import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, Hash, FileText, Clock, AlertTriangle } from "lucide-react";

const RISK_COLORS = {
  Critical: "text-accent-red bg-accent-red/10 border-accent-red/30",
  High: "text-accent-amber bg-accent-amber/10 border-accent-amber/30",
  Medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  Low: "text-accent-green bg-accent-green/10 border-accent-green/30",
};

export default function Review() {
  const { traceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.getAuditRecord(traceId).then(setRecord).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [traceId]);

  const handleReview = async (action) => {
    if (action === "reject" && !notes.trim()) { setError("Las notas son obligatorias al rechazar."); return; }
    setSubmitting(true); setError("");
    try { setResult(await api.submitReview(traceId, action, notes)); }
    catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" /></div>;
  if (error && !record) return <div className="min-h-screen flex items-center justify-center"><div className="card text-accent-red">{error}</div></div>;

  const riskClass = RISK_COLORS[record?.risk_level] || RISK_COLORS.Low;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#e8e6e3] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al dashboard
        </button>

        {result && (
          <div className="card border-accent-green/30 text-center py-10 mb-6">
            <CheckCircle2 className="w-12 h-12 mx-auto text-accent-green mb-4" />
            <h2 className="font-display text-2xl font-semibold mb-2">Revisión registrada</h2>
            <p className="text-sm text-[#6b7280]">Caso <span className="text-accent-blue">{result.trace_id}</span> — Estado: <span className="font-semibold">{result.new_status}</span></p>
            <button onClick={() => navigate("/")} className="btn-primary mt-6">Volver al dashboard</button>
          </div>
        )}

        {!result && record && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-display text-3xl font-semibold mb-1">{record.case_id}</h1>
                <p className="text-sm text-[#6b7280]">Requiere revisión humana (HITL)</p>
              </div>
              <span className={`text-xs font-mono px-3 py-1.5 rounded-md border ${riskClass}`}>{record.risk_level} — {record.risk_score}/10</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card space-y-3">
                <div className="flex items-center gap-2 text-xs text-[#6b7280] uppercase tracking-wider"><Hash className="w-3.5 h-3.5" />Identificadores</div>
                <div><div className="text-xs text-[#6b7280]">Trace ID</div><div className="font-mono text-sm text-accent-blue break-all">{record.trace_id}</div></div>
                <div><div className="text-xs text-[#6b7280]">Hash del documento</div><div className="font-mono text-xs text-[#7a7570] break-all">{record.document_hash}</div></div>
              </div>
              <div className="card space-y-3">
                <div className="flex items-center gap-2 text-xs text-[#6b7280] uppercase tracking-wider"><Clock className="w-3.5 h-3.5" />Temporal</div>
                <div><div className="text-xs text-[#6b7280]">Creado</div><div className="text-sm">{record.created_at}</div></div>
                <div><div className="text-xs text-[#6b7280]">Estado actual</div><div className="text-sm font-semibold capitalize">{record.status.replace(/_/g, " ")}</div></div>
              </div>
            </div>

            {record.risk_factors?.length > 0 && (
              <div className="card">
                <div className="flex items-center gap-2 text-xs text-[#6b7280] uppercase tracking-wider mb-3"><AlertTriangle className="w-3.5 h-3.5" />Factores de riesgo detectados</div>
                <ul className="space-y-1.5">
                  {record.risk_factors.map((f, i) => (<li key={i} className="flex items-start gap-2 text-sm text-[#b0ada8]"><span className="text-accent-amber mt-0.5">▸</span>{f}</li>))}
                </ul>
              </div>
            )}

            <div className="card border-surface-lighter">
              <div className="flex items-center gap-2 text-xs text-[#6b7280] uppercase tracking-wider mb-4"><FileText className="w-3.5 h-3.5" />Decisión del revisor</div>
              <div className="mb-2 text-xs text-[#6b7280]">Revisor: <span className="text-[#e8e6e3]">{user?.username}</span></div>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas de revisión (obligatorio al rechazar)..." rows={4} className="input resize-none mb-4" />
              {error && <div className="text-sm text-accent-red bg-accent-red/5 border border-accent-red/20 rounded-md px-3 py-2 mb-4">{error}</div>}
              <div className="flex flex-wrap gap-3">
                <button onClick={() => handleReview("approve")} disabled={submitting} className="btn flex-1 min-w-[140px] bg-accent-green/10 text-accent-green border border-accent-green/30 hover:bg-accent-green/20">
                  <CheckCircle2 className="w-4 h-4 inline mr-2" />{submitting ? "Enviando…" : "Aprobar"}
                </button>
                <button onClick={() => handleReview("request_changes")} disabled={submitting} className="btn-warning flex-1 min-w-[140px]">
                  <RotateCcw className="w-4 h-4 inline mr-2" />Solicitar cambios
                </button>
                <button onClick={() => handleReview("reject")} disabled={submitting} className="btn-danger flex-1 min-w-[140px]">
                  <XCircle className="w-4 h-4 inline mr-2" />Rechazar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
