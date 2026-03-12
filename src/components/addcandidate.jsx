import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiPlus, FiDatabase, FiLink, FiCheckCircle, 
  FiRefreshCw, FiTrash2, FiSettings, FiExternalLink, FiFileText, FiAlertCircle
} from 'react-icons/fi';
import { useCandidates } from '../context/CandidateContext';

const SourceCard = ({ url, isSyncing, onRemove, onSync, lastSynced, syncError }) => (
  <div className="bg-[#0d1117] border border-white/5 rounded-[24px] p-6 flex flex-col gap-5 group hover:border-white/10 transition-all">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
          <FiFileText className="text-emerald-400 text-lg sm:text-xl" />
        </div>
        <div className="min-w-0">
          <h4 className="text-xs sm:text-sm font-bold text-white truncate">Google Spreadsheet</h4>
          <p className="text-[9px] sm:text-[10px] text-zinc-500 font-bold tracking-wide mt-0.5 truncate">Primary Data Source</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={onSync} disabled={isSyncing} className={`p-2 sm:p-2.5 rounded-lg bg-white/5 text-zinc-400 hover:text-emerald-400 transition-all ${isSyncing ? 'animate-spin text-emerald-400' : ''}`}><FiRefreshCw size={14} /></button>
        <button onClick={onRemove} className="p-2 sm:p-2.5 rounded-lg bg-white/5 text-zinc-400 hover:text-rose-400 transition-all"><FiTrash2 size={14} /></button>
      </div>
    </div>
    
    <div className="bg-black/20 rounded-xl p-3 sm:p-4 flex items-center justify-between border border-white/5">
      <div className="flex items-center gap-3 min-w-0 mr-4">
        <FiLink className="text-zinc-600 shrink-0" />
        <span className="text-[9px] sm:text-[10px] text-zinc-500 truncate font-medium">{url || "No link"}</span>
      </div>
      <a href={url} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-indigo-400 shrink-0"><FiExternalLink size={14} /></a>
    </div>

    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/5">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-400">Connected</span>
      </div>
      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-600">Last Synced: {lastSynced}</span>
    </div>
    {syncError && <div className="flex items-center gap-2 text-rose-400 bg-rose-400/5 p-3 rounded-lg border border-rose-400/10"><FiAlertCircle size={14} className="shrink-0" /><span className="font-bold uppercase tracking-tight text-[9px]">{syncError}</span></div>}
  </div>
);

const AddCandidate = () => {
  const navigate = useNavigate();
  const { refreshCandidates, lastSync: contextLastSync } = useCandidates();
  const [sheetUrl, setSheetUrl] = useState(localStorage.getItem('walkin_sheet_url') || "");
  const [scriptUrl, setScriptUrl] = useState(localStorage.getItem('walkin_script_url') || "");
  const [sources, setSources] = useState(localStorage.getItem('walkin_sheet_url') ? [{ id: Date.now(), url: localStorage.getItem('walkin_sheet_url') }] : []);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [lastSynced, setLastSynced] = useState(localStorage.getItem('walkin_last_sync') || "Never");

  const handleAddSource = async () => {
    if (sheetUrl && sheetUrl.includes('google.com/spreadsheets')) {
      setSyncError("");
      setIsSyncing(true);
      try {
        localStorage.setItem('walkin_sheet_url', sheetUrl);
        if (scriptUrl) localStorage.setItem('walkin_script_url', scriptUrl);
        
        await refreshCandidates();
        setSources([{ id: Date.now(), url: sheetUrl }]);
        setLastSynced(new Date().toLocaleTimeString());
      } catch (error) {
        setSyncError("Fetch Failed. Ensure sheet is Public.");
      } finally {
        setIsSyncing(false);
      }
    } else {
      setSyncError("Invalid URL.");
    }
  };

  const handleSyncCurrent = async (url) => {
    setIsSyncing(true);
    setSyncError("");
    try {
      await refreshCandidates();
      setLastSynced(new Date().toLocaleTimeString());
    } catch (error) {
      setSyncError("Sync failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRemove = () => {
    localStorage.removeItem('walkin_sheet_url');
    localStorage.removeItem('walkin_script_url');
    localStorage.removeItem('walkin_candidates');
    localStorage.removeItem('walkin_last_sync');
    setSources([]);
    setSheetUrl("");
    setScriptUrl("");
    setLastSynced("Never");
    setSyncError("");
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-4 sm:p-8 font-sans overflow-x-hidden">
      <div className="max-w-[1200px] mx-auto">
        <header className="flex items-center justify-between mb-10 sm:mb-16">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all">
            <FiArrowLeft /> <span className="hidden sm:inline">Portal</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
              <FiSettings className="text-indigo-400" />
            </div>
            <h1 className="text-xs sm:text-sm font-black uppercase tracking-[0.4em] text-zinc-400">System Integration</h1>
          </div>
          <div className="w-8 sm:w-[100px]" />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 className="text-3xl sm:text-4xl font-[1000] tracking-tighter mb-4 leading-tight">Data <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-fuchsia-400">Matrix</span></h2>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-10">Configure bi-directional sync with Google Sheets to track real-time recruitment progress.</p>

            <div className="bg-[#0d1117] border border-white/5 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-6">
              <div>
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-3">Sheet URL (Read)</label>
                <div className="relative group">
                  <FiLink className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 focus-within:text-indigo-400" />
                  <input type="text" placeholder="https://..." value={sheetUrl} onChange={e => setSheetUrl(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl h-14 pl-14 pr-4 text-xs font-medium outline-none focus:border-indigo-500/50" />
                </div>
              </div>

              <div>
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-3">Script URL (Write)</label>
                <div className="relative">
                  <FiRefreshCw className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input type="text" placeholder="https://..." value={scriptUrl} onChange={e => { setScriptUrl(e.target.value); if (e.target.value) localStorage.setItem('walkin_script_url', e.target.value); }} className="w-full bg-black/40 border border-white/10 rounded-xl h-14 pl-14 pr-4 text-xs font-medium outline-none focus:border-fuchsia-500/50" />
                </div>
              </div>

              <button onClick={handleAddSource} disabled={!sheetUrl} className="w-full bg-indigo-600 hover:bg-indigo-700 h-16 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 active:scale-95">Update Integration</button>
            </div>

            <div className="mt-12 p-6 sm:p-8 bg-black/20 border border-white/5 rounded-[32px]">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-3"><FiDatabase className="text-indigo-400" /> Key Mapping</h3>
              <div className="grid grid-cols-2 gap-y-3">
                {["ID", "Name", "Email", "Phone", "Town", "Gender", "Role", "Exp"].map((col, i) => (
                  <div key={i} className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-indigo-500" /><span className="text-[9px] text-zinc-500 font-bold uppercase">{col}</span></div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <h3 className="text-lg font-black tracking-tight mb-8">Active Pipeline</h3>
            {sources.length === 0 ? (
              <div className="h-[300px] sm:h-[400px] border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center bg-white/1 opacity-20">
                <FiDatabase className="text-3xl mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">No Active Connections</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sources.map(s => <SourceCard key={s.id} url={s.url} isSyncing={isSyncing} onRemove={handleRemove} onSync={() => handleSyncCurrent(s.url)} lastSynced={lastSynced} syncError={syncError} />)}
                <div className="p-6 sm:p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[32px] flex items-start gap-4 sm:gap-6">
                   <FiCheckCircle className="text-emerald-500 text-xl shrink-0" />
                   <p className="text-emerald-500/60 text-[11px] font-bold leading-relaxed">Bidirectional sync active. All updates to candidate metadata (GD, Aptitude, L1/L2) will be pushed to the linked spreadsheet using ID as unique identifier.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCandidate;
