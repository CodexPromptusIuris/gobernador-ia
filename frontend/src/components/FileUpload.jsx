import { useState, useRef } from 'react';
import { Upload, FileText, Loader2, X } from 'lucide-react';

export default function FileUpload({ onUploadSuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [caseId, setCaseId] = useState('');
  const [riskLevel, setRiskLevel] = useState('High');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      if (!caseId) {
        setCaseId(`CASE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !caseId) {
      setError('Selecciona archivo e ID de caso');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const textContent = await file.text();
      const token = localStorage.getItem('token');

      const res = await fetch('http://localhost:8080/api/documents/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          case_id: caseId,
          document_content: textContent,
          ai_risk_level: riskLevel
        })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      setIsOpen(false);
      setFile(null);
      setCaseId('');
      if (onUploadSuccess) onUploadSuccess();

    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn-primary flex items-center gap-2">
        <Upload className="w-4 h-4" />
        Subir
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12141a] border border-white/5 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-[#6b7280] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-display font-semibold mb-6">Subir Documento</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#9ca3af] mb-1">ID Caso</label>
                <input 
                  type="text" 
                  value={caseId} 
                  onChange={(e) => setCaseId(e.target.value)}
                  className="w-full bg-[#1e2028] border border-white/10 rounded-lg px-4 py-2 text-white"
                  placeholder="CASO-1234"
                />
              </div>

              <div>
                <label className="block text-sm text-[#9ca3af] mb-1">Riesgo (IA)</label>
                <select 
                  value={riskLevel} 
                  onChange={(e) => setRiskLevel(e.target.value)}
                  className="w-full bg-[#1e2028] border border-white/10 rounded-lg px-4 py-2 text-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div 
                className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-accent-blue/50"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  accept=".txt,.md,.csv,.json"
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                
                {file ? (
                  <div className="flex flex-col items-center text-accent-blue">
                    <FileText className="w-10 h-10 mb-2" />
                    <span className="font-medium text-sm">{file.name}</span>
                    <span className="text-xs text-[#6b7280] mt-1">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-[#6b7280]">
                    <Upload className="w-10 h-10 mb-2 opacity-50" />
                    <span className="font-medium text-sm text-white/80">Selecciona archivo</span>
                    <span className="text-xs mt-1">(.txt, .md, .csv)</span>
                  </div>
                )}
              </div>

              {error && <div className="text-accent-red text-sm bg-accent-red/10 p-3 rounded-lg">{error}</div>}

              <button 
                onClick={handleUpload}
                disabled={uploading || !file || !caseId}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                {uploading ? 'Analizando...' : 'Analizar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
