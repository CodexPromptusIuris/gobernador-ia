import { useState, useEffect, useRef } from "react";
import axios from "axios";

/**
 * 🔒 ENHANCED LEGAL AGENT DASHBOARD
 * Contract Analysis + Data Protection + Traceability + Compliance Reporting
 */

const LEGAL_MODULES = [
  { id: "contracts", icon: "📄", label: "Contract Analysis", color: "#4FC1FF" },
  { id: "compliance", icon: "✓", label: "Compliance Check", color: "#C3E88D" },
  { id: "traceability", icon: "📡", label: "Data Traceability", color: "#F78C6C" },
  { id: "subjects", icon: "✦", label: "Subject Rights", color: "#C792EA" },
  { id: "audit", icon: "📋", label: "Audit Log", color: "#FFCB6B" },
  { id: "reports", icon: "📊", label: "Reports", color: "#89DDFF" },
];

const LEGAL_FRAMEWORKS = {
  LEY_21719: {
    name: "Ley 21.719 (Chile)",
    articles: 55,
    principles: ["Licitud", "Finalidad", "Proporcionalidad", "Transparencia", "Seguridad"],
    rights: ["Acceso", "Rectificación", "Supresión", "Oposición", "Portabilidad"],
  },
  GDPR: {
    name: "GDPR (EU)",
    articles: 99,
    principles: ["Lawfulness", "Purpose limitation", "Data minimization", "Accuracy"],
    rights: ["Access", "Rectification", "Erasure", "Portability", "Object"],
  },
  CCPA: {
    name: "CCPA (California)",
    articles: 12,
    principles: ["Consumer rights", "Transparency", "Non-discrimination"],
    rights: ["Know", "Delete", "Opt-out"],
  },
};

function TerminalLine({ text, delay = 0, type = "info" }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  const colors = { info: "#4FC1FF", success: "#C3E88D", warn: "#F78C6C", error: "#FF5370", dim: "#546E7A" };
  return visible ? (
    <div style={{ color: colors[type] || "#cdd3de", fontFamily: "'Courier New', monospace", fontSize: 12, lineHeight: 1.6, padding: "1px 0" }}>
      {text}
    </div>
  ) : null;
}

function ComplianceScore({ score }) {
  const getColor = (s) => {
    if (s >= 80) return "#C3E88D";
    if (s >= 50) return "#F78C6C";
    return "#FF5370";
  };

  return (
    <div style={{ textAlign: "center", padding: 20, background: "#161b22", borderRadius: 8, border: "1px solid #21262d" }}>
      <div style={{ fontSize: 48, fontWeight: "bold", color: getColor(score) }}>{score}%</div>
      <div style={{ fontSize: 12, color: "#8b949e", marginTop: 8 }}>
        {score >= 80 ? "✅ COMPLIANT" : score >= 50 ? "⚠️  PARTIAL COMPLIANCE" : "❌ NON-COMPLIANT"}
      </div>
      <div style={{ width: "100%", background: "#0d1117", height: 6, borderRadius: 3, marginTop: 12, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: getColor(score), borderRadius: 3, transition: "width 1s" }} />
      </div>
    </div>
  );
}

function ContractAnalysisModule() {
  const [contractText, setContractText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [framework, setFramework] = useState("LEY_21719");

  const analyzeContract = async () => {
    if (!contractText.trim()) return;
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3001/llm/generate", {
        prompt: `Analiza este contrato legal según ${LEGAL_FRAMEWORKS[framework].name}:

${contractText}

Identifica:
1. Cláusulas de protección de datos
2. Riesgos legales
3. Incumplimientos de privacidad
4. Recomendaciones de cambios
5. Puntuación de cumplimiento (0-100)

Formato de respuesta JSON:
{
  "compliance_score": 0-100,
  "issues": [{"severity": "CRITICAL|HIGH|MEDIUM", "issue": "...", "recommendation": "..."}],
  "clauses_found": [...],
  "missing_clauses": [...]
}`,
        task: "contract-analysis",
      });

      try {
        const parsed = JSON.parse(response.data.response.replace(/```json\n?|\n?```/g, ""));
        setAnalysis(parsed);
      } catch {
        setAnalysis({ raw: response.data.response });
      }
    } catch (error) {
      console.error("Analysis error:", error);
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "#546E7A", marginBottom: 8 }}>LEGAL FRAMEWORK</div>
        <select
          value={framework}
          onChange={(e) => setFramework(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 4,
            color: "#cdd3de",
            fontFamily: "'Courier New', monospace",
            fontSize: 12,
          }}
        >
          {Object.entries(LEGAL_FRAMEWORKS).map(([key, value]) => (
            <option key={key} value={key}>{value.name}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "#546E7A", marginBottom: 8 }}>CONTRACT TEXT</div>
        <textarea
          value={contractText}
          onChange={(e) => setContractText(e.target.value)}
          placeholder="Paste contract or legal document here..."
          style={{
            width: "100%",
            height: 200,
            padding: 12,
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 4,
            color: "#cdd3de",
            fontFamily: "'Courier New', monospace",
            fontSize: 11,
            resize: "vertical",
          }}
        />
      </div>

      <button
        onClick={analyzeContract}
        disabled={loading || !contractText.trim()}
        style={{
          width: "100%",
          padding: 10,
          background: loading ? "#21262d" : "#2d4a7a",
          border: "1px solid #4FC1FF",
          borderRadius: 4,
          color: "#4FC1FF",
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "'Courier New', monospace",
          fontSize: 12,
          marginBottom: 16,
        }}
      >
        {loading ? "Analyzing..." : "ANALYZE CONTRACT"}
      </button>

      {analysis && (
        <div>
          {analysis.compliance_score !== undefined && (
            <ComplianceScore score={analysis.compliance_score} />
          )}

          {analysis.issues && analysis.issues.length > 0 && (
            <div style={{ marginTop: 16, background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 10, color: "#546E7A", marginBottom: 10 }}>ISSUES FOUND ({analysis.issues.length})</div>
              {analysis.issues.map((issue, i) => (
                <div
                  key={i}
                  style={{
                    padding: 10,
                    marginBottom: 8,
                    background: issue.severity === "CRITICAL" ? "#FF537022" : "#F78C6C22",
                    borderLeft: `3px solid ${issue.severity === "CRITICAL" ? "#FF5370" : "#F78C6C"}`,
                    borderRadius: 4,
                  }}
                >
                  <div style={{ fontSize: 11, color: issue.severity === "CRITICAL" ? "#FF5370" : "#F78C6C", fontWeight: "bold" }}>
                    {issue.severity}
                  </div>
                  <div style={{ fontSize: 11, color: "#cdd3de", marginTop: 4 }}>{issue.issue}</div>
                  <div style={{ fontSize: 10, color: "#8b949e", marginTop: 4 }}>💡 {issue.recommendation}</div>
                </div>
              ))}
            </div>
          )}

          {analysis.raw && (
            <div style={{ marginTop: 16, background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 14 }}>
              <pre
                style={{
                  fontSize: 10,
                  color: "#cdd3de",
                  overflow: "auto",
                  maxHeight: 300,
                  fontFamily: "'Courier New', monospace",
                  lineHeight: 1.4,
                }}
              >
                {analysis.raw}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TraceabilityModule() {
  const [logs, setLogs] = useState([
    { id: 1, user: "admin@company.com", action: "READ", data_type: "personal_data", timestamp: "2024-01-15 14:30", records: 245 },
    { id: 2, user: "analyst@company.com", action: "EXPORT", data_type: "customer_info", timestamp: "2024-01-15 13:15", records: 1200 },
    { id: 3, user: "system", action: "PROCESS", data_type: "analytics", timestamp: "2024-01-15 12:00", records: 50000 },
  ]);

  const [filter, setFilter] = useState("ALL");

  return (
    <div>
      <div style={{ fontSize: 10, color: "#546E7A", marginBottom: 12 }}>// DATA TRACEABILITY AUDIT LOG</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["ALL", "READ", "WRITE", "DELETE", "EXPORT"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 12px",
              background: filter === f ? "#2d4a7a" : "#161b22",
              border: `1px solid ${filter === f ? "#4FC1FF" : "#30363d"}`,
              borderRadius: 4,
              color: filter === f ? "#4FC1FF" : "#8b949e",
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "'Courier New', monospace",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "150px 150px 120px 150px 80px 80px",
            gap: 12,
            padding: 12,
            borderBottom: "1px solid #21262d",
            background: "#0d1117",
            fontSize: 10,
            color: "#546E7A",
            fontWeight: "bold",
          }}
        >
          <div>User</div>
          <div>Action</div>
          <div>Data Type</div>
          <div>Timestamp</div>
          <div>Records</div>
          <div>Status</div>
        </div>

        {logs
          .filter((log) => filter === "ALL" || log.action === filter)
          .map((log) => (
            <div
              key={log.id}
              style={{
                display: "grid",
                gridTemplateColumns: "150px 150px 120px 150px 80px 80px",
                gap: 12,
                padding: 12,
                borderBottom: "1px solid #21262d",
                fontSize: 11,
                alignItems: "center",
              }}
            >
              <div style={{ color: "#4FC1FF" }}>{log.user}</div>
              <div style={{ color: log.action === "DELETE" ? "#FF5370" : log.action === "EXPORT" ? "#F78C6C" : "#C3E88D" }}>
                {log.action}
              </div>
              <div style={{ color: "#8b949e" }}>{log.data_type}</div>
              <div style={{ color: "#8b949e" }}>{log.timestamp}</div>
              <div style={{ color: "#FFCB6B" }}>{log.records.toLocaleString()}</div>
              <div style={{ color: "#C3E88D" }}>✓ LOGGED</div>
            </div>
          ))}
      </div>

      <div style={{ marginTop: 16, fontSize: 10, color: "#546E7A" }}>
        Showing {logs.filter((l) => filter === "ALL" || l.action === filter).length} entries
      </div>
    </div>
  );
}

function DataSubjectRightsModule() {
  const [requests, setRequests] = useState([
    { id: "ACC-001", subject: "john@example.com", type: "ACCESS", status: "PENDING", requested: "2024-01-10", deadline: "2024-02-09" },
    { id: "REC-001", subject: "jane@example.com", type: "RECTIFICATION", status: "COMPLETED", requested: "2024-01-05", completed: "2024-01-20" },
    { id: "DEL-001", subject: "bob@example.com", type: "DELETION", status: "PENDING", requested: "2024-01-12", deadline: "2024-02-11" },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "#F78C6C";
      case "COMPLETED":
        return "#C3E88D";
      case "DENIED":
        return "#FF5370";
      default:
        return "#8b949e";
    }
  };

  return (
    <div>
      <div style={{ fontSize: 10, color: "#546E7A", marginBottom: 12 }}>// DATA SUBJECT RIGHTS REQUESTS</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Total Requests", value: requests.length, color: "#4FC1FF" },
          { label: "Pending", value: requests.filter((r) => r.status === "PENDING").length, color: "#F78C6C" },
          { label: "Completed", value: requests.filter((r) => r.status === "COMPLETED").length, color: "#C3E88D" },
          { label: "Avg Response", value: "8 days", color: "#FFCB6B" },
        ].map((stat) => (
          <div key={stat.label} style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: "bold", color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 10, color: "#8b949e", marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "100px 150px 120px 100px 100px 100px",
            gap: 12,
            padding: 12,
            borderBottom: "1px solid #21262d",
            background: "#0d1117",
            fontSize: 10,
            color: "#546E7A",
            fontWeight: "bold",
          }}
        >
          <div>Request ID</div>
          <div>Subject</div>
          <div>Type</div>
          <div>Status</div>
          <div>Requested</div>
          <div>Deadline</div>
        </div>

        {requests.map((req) => (
          <div
            key={req.id}
            style={{
              display: "grid",
              gridTemplateColumns: "100px 150px 120px 100px 100px 100px",
              gap: 12,
              padding: 12,
              borderBottom: "1px solid #21262d",
              fontSize: 11,
              alignItems: "center",
            }}
          >
            <div style={{ color: "#4FC1FF" }}>{req.id}</div>
            <div style={{ color: "#8b949e" }}>{req.subject}</div>
            <div style={{ color: "#FFCB6B" }}>{req.type}</div>
            <div style={{ color: getStatusColor(req.status) }}>{req.status}</div>
            <div style={{ color: "#8b949e" }}>{req.requested}</div>
            <div style={{ color: req.deadline ? "#F78C6C" : "#C3E88D" }}>{req.deadline || req.completed}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EnhancedLegalDashboard() {
  const [activeModule, setActiveModule] = useState("contracts");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderModule = () => {
    switch (activeModule) {
      case "contracts":
        return <ContractAnalysisModule />;
      case "traceability":
        return <TraceabilityModule />;
      case "subjects":
        return <DataSubjectRightsModule />;
      default:
        return <div style={{ color: "#8b949e" }}>Module: {activeModule}</div>;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0d1117", fontFamily: "'Courier New', monospace", color: "#cdd3de", overflow: "hidden" }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        ::-webkit-scrollbar{width:6px} 
        ::-webkit-scrollbar-track{background:#0d1117} 
        ::-webkit-scrollbar-thumb{background:#30363d;border-radius:3px}
      `}</style>

      {/* SIDEBAR */}
      <div style={{ width: sidebarOpen ? 220 : 48, background: "#161b22", borderRight: "1px solid #21262d", display: "flex", flexDirection: "column", transition: "width 0.2s", flexShrink: 0 }}>
        <div style={{ padding: "12px 10px", borderBottom: "1px solid #21262d", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "linear-gradient(135deg,#4FC1FF,#C792EA)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
            🔒
          </div>
          {sidebarOpen && <span style={{ fontSize: 11, fontWeight: "bold", color: "#4FC1FF", letterSpacing: 1 }}>LEGAL AI</span>}
        </div>

        <div style={{ flex: 1, padding: "8px 4px" }}>
          {LEGAL_MODULES.map((module) => (
            <div
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 6,
                marginBottom: 2,
                cursor: "pointer",
                background: activeModule === module.id ? "#1e2530" : "transparent",
                color: activeModule === module.id ? module.color : "#8b949e",
                fontSize: 13,
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 16 }}>{module.icon}</span>
              {sidebarOpen && <span style={{ fontSize: 12 }}>{module.label}</span>}
            </div>
          ))}
        </div>

        <div style={{ padding: "8px 4px", borderTop: "1px solid #21262d" }}>
          <div
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 6,
              cursor: "pointer",
              color: "#546E7A",
              fontSize: 13,
            }}
          >
            <span style={{ fontSize: 16 }}>{sidebarOpen ? "◀" : "▶"}</span>
            {sidebarOpen && <span style={{ fontSize: 11 }}>Collapse</span>}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ height: 40, background: "#161b22", borderBottom: "1px solid #21262d", display: "flex", alignItems: "center", padding: "0 16px", gap: 8, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {["#FF5370", "#F78C6C", "#C3E88D"].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <span style={{ color: "#546E7A", fontSize: 11, marginLeft: 8 }}>legal-compliance-engine</span>
          <span style={{ color: "#30363d" }}>—</span>
          <span style={{ color: "#4FC1FF", fontSize: 11 }}>
            {LEGAL_MODULES.find((m) => m.id === activeModule)?.label}
          </span>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
          {renderModule()}
        </div>
      </div>
    </div>
  );
}
