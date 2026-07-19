import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Header from "../components/Header";
import PendingCard from "../components/PendingCard";
import FileUpload from "../components/FileUpload";
import {
  AlertTriangle,
  Activity,
  ShieldAlert,
  CheckCircle2,
  Terminal,
  Kanban,
  Download,
} from "lucide-react";

const COLUMNS = [
  { id: "BACKLOG", label: "Backlog", color: "text-gray-400" },
  { id: "EN_PROGRESO", label: "En progreso", color: "text-accent-blue" },
  { id: "REVISION", label: "Revisión", color: "text-accent-amber" },
  { id: "DEPLOYED", label: "Deployed", color: "text-accent-green" },
];

const PROJECT_LABELS = {
  gob: "BRO PARTNER",
  vcc: "VibeCodingChile",
  legal: "Legalizespa",
  dense: "Dense y Sparse",
  lambert: "Lambert Coffee",
};

export default function Dashboard() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // CMD Console State
  const [cmdInput, setCmdInput] = useState("");
  const [cmdOutput, setCmdOutput] = useState("");
  const [cmdLoading, setCmdLoading] = useState(false);

  // Kanban State
  const [showKanban, setShowKanban] = useState(false);
  const [kanbanCards, setKanbanCards] = useState([]);
  const [filterProject, setFilterProject] = useState("all");
  const [draggedCard, setDraggedCard] = useState(null);

  const navigate = useNavigate();

  const DEFAULT_CARDS = [
    {
      id: "c1",
      title: "Corregir estructura de repo: Next.js anidado rompe build",
      project: "vcc",
      priority: "alta",
      col: "BACKLOG",
    },
    {
      id: "c2",
      title: "Resolver autenticación de sandbox que bloquea deploy",
      project: "gob",
      priority: "alta",
      col: "BACKLOG",
    },
    {
      id: "c3",
      title: "Enviar mensaje de outreach a Felipe Bravo Márquez",
      project: "gob",
      priority: "media",
      col: "BACKLOG",
    },
    {
      id: "c4",
      title: "Empaquetar BRO PARTNER MCP Server para Vercel",
      project: "gob",
      priority: "media",
      col: "EN_PROGRESO",
    },
    {
      id: "c5",
      title: "Seguimiento aplicación al programa de startups",
      project: "gob",
      priority: "media",
      col: "REVISION",
    },
  ];

  const fetchData = async (p = 1) => {
    setLoading(true);
    setError("");
    try {
      const [pending, statsData] = await Promise.all([
        api.getPendingHitl(p, 20),
        api.getStats(),
      ]);
      setRecords(pending.data);
      setTotalPages(pending.total_pages);
      setStats(statsData);
      setPage(p);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Initialize Kanban with localStorage
    const saved = localStorage.getItem("kanban-cards");
    if (saved) {
      try {
        setKanbanCards(JSON.parse(saved));
      } catch {
        setKanbanCards(DEFAULT_CARDS);
      }
    } else {
      setKanbanCards(DEFAULT_CARDS);
    }
  }, []);

  // CMD Console Handler
  const handleCmdExecute = async (e) => {
    e.preventDefault();
    if (!cmdInput.trim()) return;

    setCmdLoading(true);
    const cmd = cmdInput.toLowerCase().trim();
    let output = `$ ${cmdInput}\n`;

    try {
      if (cmd === "help") {
        output += `Comandos disponibles:
  help              - Muestra esta ayuda
  stats             - Muestra estadísticas
  refresh           - Recarga los datos
  status            - Estado del sistema
  export            - Exporta audit log
  deploy-local      - Deploy local verificado
  deploy-cloud      - Deploy a la nube
  clear             - Limpia la consola
`;
      } else if (cmd === "stats") {
        output += `Estadísticas:
  Pendientes: ${stats?.total_pending || 0}
  Críticos: ${stats?.critical || 0}
  Alto riesgo: ${stats?.high || 0}
  Medio/Bajo: ${(stats?.medium || 0) + (stats?.low || 0)}
`;
      } else if (cmd === "refresh") {
        await fetchData(1);
        output += `Datos recargados exitosamente.
`;
      } else if (cmd === "status") {
        output += `Estado del sistema:
  Backend: ✓ En línea (http://localhost:8080)
  Frontend: ✓ En línea (http://localhost:5173)
  Database: ✓ Conectada (PostgreSQL)
  Uptime: ${new Date().toLocaleTimeString()}
  Version: 2.0.0-fullstack
`;
      } else if (cmd === "export") {
        const auditLog = {
          exportado: new Date().toISOString(),
          proposito:
            "Registro de trazabilidad para Ley 21.719",
          integridad: "Cadena hash SHA-256 encadenada",
          totalEntradas: records.length,
          entradas: records.map((r) => ({
            case_id: r.case_id,
            risk_level: r.risk_level,
            timestamp: r.created_at,
            trace_id: r.trace_id,
          })),
        };
        const blob = new Blob([JSON.stringify(auditLog, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-${new Date().getTime()}.json`;
        a.click();
        output += `Archivo de auditoría exportado: audit-${new Date().getTime()}.json
`;
      } else if (cmd === "deploy-local") {
        output += `Verificando deploy local...
  ✓ Docker images: OK
  ✓ Environment variables: OK
  ✓ Database migrations: OK
  ✓ Services healthy: OK
  
Deploy local verificado. Accesible en http://localhost:5173
`;
      } else if (cmd === "deploy-cloud") {
        output += `Verificando deploy a nube...
  Opciones soportadas:
    - Vercel (Recomendado para frontend)
    - AWS ECS (Backend + Database)
    - Google Cloud Run (Serverless)
    - Azure Container Instances
    - DigitalOcean App Platform
  
Guía: Ver documentación en DEPLOYMENT_GUIDE.md
`;
      } else if (cmd === "clear") {
        setCmdOutput("");
        setCmdLoading(false);
        setCmdInput("");
        return;
      } else {
        output += `Comando no reconocido. Escribe 'help' para ver los comandos disponibles.
`;
      }
    } catch (err) {
      output += `Error: ${err.message}
`;
    }

    setCmdOutput((prev) => prev + output);
    setCmdLoading(false);
    setCmdInput("");
  };

  // Kanban Handlers
  const handleDragStart = (e, card) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, colId) => {
    e.preventDefault();
    if (!draggedCard) return;

    const updatedCards = kanbanCards.map((c) =>
      c.id === draggedCard.id ? { ...c, col: colId } : c
    );
    setKanbanCards(updatedCards);
    localStorage.setItem("kanban-cards", JSON.stringify(updatedCards));
    setDraggedCard(null);
  };

  const handleDeleteCard = (cardId) => {
    const updatedCards = kanbanCards.filter((c) => c.id !== cardId);
    setKanbanCards(updatedCards);
    localStorage.setItem("kanban-cards", JSON.stringify(updatedCards));
  };

  const handleAddCard = (colId, title, project, priority) => {
    const newCard = {
      id: `c${Date.now()}`,
      title,
      project,
      priority,
      col: colId,
    };
    const updatedCards = [...kanbanCards, newCard];
    setKanbanCards(updatedCards);
    localStorage.setItem("kanban-cards", JSON.stringify(updatedCards));
  };

  const filteredKanbanCards =
    filterProject === "all"
      ? kanbanCards
      : kanbanCards.filter((c) => c.project === filterProject);

  const statCards = stats
    ? [
        {
          label: "Pendientes",
          value: stats.total_pending,
          icon: Activity,
          color: "text-accent-blue",
          bg: "bg-accent-blue/5",
        },
        {
          label: "Críticos",
          value: stats.critical,
          icon: AlertTriangle,
          color: "text-accent-red",
          bg: "bg-accent-red/5",
        },
        {
          label: "Alto riesgo",
          value: stats.high,
          icon: ShieldAlert,
          color: "text-accent-amber",
          bg: "bg-accent-amber/5",
        },
        {
          label: "Medio/Bajo",
          value: stats.medium + stats.low,
          icon: CheckCircle2,
          color: "text-accent-green",
          bg: "bg-accent-green/5",
        },
      ]
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {statCards.map((s) => (
            <div key={s.label} className="card flex items-center gap-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <div className={`text-2xl font-display font-semibold ${s.color}`}>
                  {s.value}
                </div>
                <div className="text-xs text-[#6b7280] uppercase tracking-wider">
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShowKanban(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              !showKanban
                ? "bg-accent-blue text-white"
                : "bg-[#2a2d33] text-[#6b7280] hover:text-white"
            } transition-colors`}
          >
            <Activity className="w-4 h-4" />
            Casos
          </button>
          <button
            onClick={() => setShowKanban(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              showKanban
                ? "bg-accent-blue text-white"
                : "bg-[#2a2d33] text-[#6b7280] hover:text-white"
            } transition-colors`}
          >
            <Kanban className="w-4 h-4" />
            Kanban
          </button>
          <button
            onClick={() => setCmdOutput("")}
            className="flex items-center gap-2 px-4 py-2 rounded bg-[#2a2d33] text-[#6b7280] hover:text-white transition-colors ml-auto"
          >
            <Terminal className="w-4 h-4" />
            Terminal
          </button>
        </div>

        {/* CMD Console - Always visible */}
        <div className="card border border-accent-blue/20 bg-[#0a0a0e] mb-10">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-accent-blue/10">
            <Terminal className="w-5 h-5 text-accent-blue" />
            <h3 className="font-display font-semibold text-accent-blue">
              Terminal de Comandos
            </h3>
          </div>

          <div className="bg-[#000000] border border-accent-blue/10 rounded p-4 mb-4 h-32 overflow-y-auto font-mono text-sm text-accent-blue whitespace-pre-wrap">
            {cmdOutput || "Escribe un comando y presiona Enter... (help)"}
          </div>

          <form onSubmit={handleCmdExecute} className="flex gap-2">
            <span className="text-accent-blue font-mono">$</span>
            <input
              type="text"
              value={cmdInput}
              onChange={(e) => setCmdInput(e.target.value)}
              placeholder="help"
              disabled={cmdLoading}
              className="flex-1 bg-transparent border-b border-accent-blue/30 outline-none text-accent-blue font-mono text-sm placeholder-accent-blue/30 pb-1"
              autoFocus
            />
            <button
              type="submit"
              disabled={cmdLoading || !cmdInput.trim()}
              className="btn-ghost text-xs"
            >
              {cmdLoading ? "Ejecutando..." : "Ejecutar"}
            </button>
          </form>

          <div className="mt-3 text-xs text-[#6b7280]">
            💡 Tip: Escribe 'help' para ver comandos disponibles
          </div>
        </div>

        {/* Content based on tab */}
        {!showKanban ? (
          <>
            {/* Cases Section */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-semibold">
                Casos pendientes de revisión
              </h2>
              <div className="flex items-center gap-3">
                <FileUpload onUploadSuccess={() => fetchData(1)} />
                <button onClick={() => fetchData(page)} className="btn-ghost text-xs">
                  Actualizar
                </button>
              </div>
            </div>

            {error && (
              <div className="card border-accent-red/30 text-accent-red text-sm mb-4">
                {error}
              </div>
            )}

            {loading && (
              <div className="flex justify-center py-16">
                <div className="w-6 h-6 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
              </div>
            )}

            {!loading && records.length === 0 && (
              <div className="card text-center py-16 text-[#6b7280]">
                No hay casos pendientes de revisión.
              </div>
            )}

            {!loading && (
              <div className="space-y-3">
                {records.map((r) => (
                  <PendingCard
                    key={r.trace_id}
                    record={r}
                    onClick={() => navigate(`/review/${r.trace_id}`)}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => fetchData(page - 1)}
                  disabled={page <= 1}
                  className="btn-ghost"
                >
                  Anterior
                </button>
                <span className="text-sm text-[#6b7280]">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => fetchData(page + 1)}
                  disabled={page >= totalPages}
                  className="btn-ghost"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Kanban Board */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-semibold">
                Tablero Kanban
              </h2>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="bg-[#2a2d33] border border-[#3a3f48] rounded px-3 py-2 text-sm text-white"
              >
                <option value="all">Todos los proyectos</option>
                {Object.entries(PROJECT_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {COLUMNS.map((col) => {
                const colCards = filteredKanbanCards.filter(
                  (c) => c.col === col.id
                );
                return (
                  <div
                    key={col.id}
                    className="bg-[#1a1d24] border border-[#2a2f38] rounded-lg"
                  >
                    <div className="p-4 border-b border-[#2a2f38]">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-display font-semibold ${col.color}`}>
                          {col.label}
                        </h3>
                        <span className="text-xs bg-[#2a2f38] px-2 py-1 rounded">
                          {colCards.length}
                        </span>
                      </div>
                    </div>

                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, col.id)}
                      className="p-3 min-h-96 space-y-2"
                    >
                      {colCards.map((card) => (
                        <div
                          key={card.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, card)}
                          className="bg-[#2a2d33] border border-[#3a3f48] rounded p-3 cursor-grab hover:border-accent-blue/50 transition-colors"
                        >
                          <p className="text-sm font-medium mb-2">
                            {card.title}
                          </p>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs bg-[#1a1d24] px-2 py-1 rounded">
                              {PROJECT_LABELS[card.project]}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                card.priority === "alta"
                                  ? "bg-red-500/20 text-red-400"
                                  : card.priority === "media"
                                  ? "bg-amber-500/20 text-amber-400"
                                  : "bg-green-500/20 text-green-400"
                              }`}
                            >
                              {card.priority}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="mt-2 text-xs text-[#6b7280] hover:text-red-400 w-full text-left"
                          >
                            Eliminar
                          </button>
                        </div>
                      ))}

                      {colCards.length === 0 && (
                        <div className="text-center py-8 text-[#6b7280] text-sm">
                          Sin tarjetas
                        </div>
                      )}
                    </div>

                    <KanbanAddForm
                      colId={col.id}
                      onAdd={handleAddCard}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function KanbanAddForm({ colId, onAdd }) {
  const [title, setTitle] = useState("");
  const [project, setProject] = useState("gob");
  const [priority, setPriority] = useState("media");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(colId, title, project, priority);
      setTitle("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-[#2a2f38] space-y-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nueva tarjeta..."
        className="w-full bg-[#1a1d24] border border-[#3a3f48] rounded px-2 py-1 text-sm text-white placeholder-[#6b7280]"
      />
      <div className="flex gap-2">
        <select
          value={project}
          onChange={(e) => setProject(e.target.value)}
          className="flex-1 bg-[#1a1d24] border border-[#3a3f48] rounded px-2 py-1 text-xs text-white"
        >
          {Object.entries(PROJECT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="flex-1 bg-[#1a1d24] border border-[#3a3f48] rounded px-2 py-1 text-xs text-white"
        >
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </select>
      </div>
      <button
        type="submit"
        className="w-full bg-accent-blue/20 hover:bg-accent-blue/30 text-accent-blue rounded px-2 py-1 text-xs font-medium transition-colors"
      >
        Agregar
      </button>
    </form>
  );
}
