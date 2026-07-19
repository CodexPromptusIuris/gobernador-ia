import { Hash, Clock, AlertTriangle } from "lucide-react";

const RISK_STYLES = {
  Critical: "bg-accent-red/10 text-accent-red border-accent-red/20",
  High: "bg-accent-amber/10 text-accent-amber border-accent-amber/20",
  Medium: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  Low: "bg-accent-green/10 text-accent-green border-accent-green/20",
};

export default function PendingCard({ record, onClick }) {
  const riskStyle = RISK_STYLES[record.risk_level] || RISK_STYLES.Low;
  return (
    <button onClick={onClick} className="card w-full text-left flex items-center gap-5 group cursor-pointer hover:border-surface-lighter">
      <div className="flex-shrink-0">
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center border ${riskStyle}`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className="font-display text-lg font-semibold group-hover:text-accent-blue transition-colors">{record.case_id}</span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${riskStyle}`}>{record.risk_level} {record.risk_score}/10</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-[#6b7280]">
          <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{record.trace_id}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{record.created_at}</span>
        </div>
      </div>
      <div className="flex-shrink-0 text-[#2a2a3a] group-hover:text-accent-blue transition-colors">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </div>
    </button>
  );
}
