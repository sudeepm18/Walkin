import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiLayers, FiUsers, FiCheckCircle, FiRefreshCw,
  FiClock, FiXCircle, FiSave, FiSearch,
  FiActivity, FiMessageCircle, FiBookOpen, FiChevronRight, FiMenu, FiX
} from 'react-icons/fi';
import { updateCandidateLocally, updateCandidatesLocallyBulk, pushToGoogleSheet, syncCandidates } from '../services/syncService';

const PreScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Orientation');
  const [startRange, setStartRange] = useState(0);
  const [endRange, setEndRange] = useState(0);
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sessionUpdates, setSessionUpdates] = useState(0); 
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showSidebar, setShowSidebar] = useState(false);
  
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [lastBatch, setLastBatch] = useState({ start: 0, end: 0 });

  const toggleSelection = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCandidates.map(c => c.ID)));
    }
  };

  const tabs = [
    { id: 'Orientation', icon: FiActivity, label: 'Orientation' },
    { id: 'Group Discussion', icon: FiMessageCircle, label: 'GD' },
    { id: 'Aptitude', icon: FiBookOpen, label: 'Aptitude' }
  ];

  const loadCandidates = () => {
    const data = localStorage.getItem('walkin_candidates');
    console.log(`[PreScreen] Loading candidates. Found: ${data ? JSON.parse(data).length : 0} items.`);
    if (data) setCandidates(JSON.parse(data));
  };

  useEffect(() => {
    loadCandidates();
    const handleSyncStart = () => {
      console.log("[PreScreen] Sync Start Event Received");
      setIsSaving(true);
    };
    const handleSyncComplete = () => {
      console.log("[PreScreen] Sync Complete Event Received");
      setIsSaving(false);
      loadCandidates();
    };
    window.addEventListener('storage', loadCandidates);
    window.addEventListener('sync-start', handleSyncStart);
    window.addEventListener('sync-complete', handleSyncComplete);
    return () => {
      window.removeEventListener('storage', loadCandidates);
      window.removeEventListener('sync-start', handleSyncStart);
      window.removeEventListener('sync-complete', handleSyncComplete);
    };
  }, []);

  // Proactive sync on mount
  useEffect(() => {
    const autoSync = async () => {
      const url = localStorage.getItem('walkin_sheet_url');
      if (!url) return;
      try {
        setIsSaving(true);
        await syncCandidates(url);
        loadCandidates();
      } catch (err) {
        console.error("PreScreen auto-sync failed:", err);
      } finally {
        setIsSaving(false);
      }
    };
    autoSync();
  }, []);

  const filteredCandidates = useMemo(() => {
    if (!searchTerm) return candidates;
    return candidates.filter(c => 
      c.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ID?.toString().includes(searchTerm)
    );
  }, [candidates, searchTerm]);

  useEffect(() => {
    if (startRange === lastBatch.start && endRange === lastBatch.end) return;
    const newBatch = filteredCandidates.slice(startRange, endRange).map(c => c.ID);
    setSelectedIds(new Set(newBatch));
    setLastBatch({ start: startRange, end: endRange });
  }, [startRange, endRange, filteredCandidates]);

  const displayCandidates = useMemo(() => {
    return filteredCandidates.map((cand) => {
      return { ...cand, isSelected: selectedIds.has(cand.ID) };
    });
  }, [filteredCandidates, selectedIds]);

  const maxTotal = filteredCandidates.length;

  const handleBulkUpdate = (status) => {
    const statusField = activeTab === 'Orientation' ? 'Orientation(Agree & Disagree)' : 
                       activeTab === 'Group Discussion' ? 'GD Status' : 
                       'Aptitude Status';
    handleBulkUpdateField(statusField, status);
  };

  const handleBulkUpdateField = (field, value) => {
    const idsToUpdate = Array.from(selectedIds);
    if (idsToUpdate.length === 0) {
      showMsg('No candidates selected', 'error');
      return;
    }

    // Update local state IMMEDIATELY for 60fps UI feedback
    setCandidates(prev => prev.map(c => 
      selectedIds.has(c.ID) ? { ...c, [field]: value } : c
    ));

    // Handle heavy localStorage/Logic in background
    setTimeout(() => {
      updateCandidatesLocallyBulk(idsToUpdate, { [field]: value });
    }, 0);

    setSessionUpdates(prev => prev + idsToUpdate.length);
    showMsg(`Updated ${idsToUpdate.length} items`, 'success');
    if (window.innerWidth < 1024) setShowSidebar(false);
  };

  const handleSaveToExcel = async () => {
    const scriptUrl = localStorage.getItem('walkin_script_url');
    if (!scriptUrl) {
      showMsg('No Script URL', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const latestData = JSON.parse(localStorage.getItem('walkin_candidates') || '[]');
      await pushToGoogleSheet(scriptUrl, latestData);
      setShowSuccessModal(true);
      setSessionUpdates(0); 
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      showMsg('Sync failed', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col font-sans overflow-hidden">
      <header className="h-20 lg:h-24 border-b border-white/5 bg-[#090b10]/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-8 shrink-0 z-30">
        <div className="flex items-center gap-4 sm:gap-6">
          <button onClick={() => navigate('/')} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/4 border border-white/10 flex items-center justify-center text-zinc-400">
            <FiArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg lg:text-2xl font-[1000] tracking-tight truncate">PRE-SCREENING <span className="text-indigo-500">HUB</span></h1>
            <p className="text-[7px] sm:text-[9px] text-zinc-500 font-black tracking-widest uppercase">Bulk Processor</p>
          </div>
        </div>

        <div className="hidden xl:flex bg-black/40 p-1 rounded-2xl border border-white/5 gap-0.5">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-zinc-500'}`}>
              <tab.icon size={12} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleSaveToExcel} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 sm:px-6 h-10 sm:h-12 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest shrink-0 flex items-center gap-2 sm:gap-3 transition-all">
            {isSaving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
            <span className="hidden sm:inline">{isSaving ? 'Syncing...' : 'Save'}</span>
          </button>
          <button onClick={() => setShowSidebar(!showSidebar)} className="lg:hidden w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400">
            {showSidebar ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        <aside className={`fixed inset-y-0 right-0 w-[320px] sm:w-[400px] bg-[#090b10] border-l lg:border-l-0 lg:border-r border-white/5 p-6 sm:p-8 z-40 transition-transform duration-500 lg:static lg:translate-x-0 ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="space-y-8">
            <div className="xl:hidden flex flex-col gap-2 mb-6">
              <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Workflow Step</label>
              <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center justify-center py-2.5 rounded-lg transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-zinc-600'}`}>
                    <tab.icon size={14} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input type="text" placeholder="ID or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-12 bg-white/2 border border-white/5 rounded-xl pl-11 pr-4 text-xs outline-none focus:border-indigo-500/50" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                <span className="text-zinc-500">Batch Control</span>
                <span className="text-emerald-400">{selectedIds.size} Ready</span>
              </div>
              <div className="bg-[#0d1117] border border-white/5 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex flex-col"><span className="text-[7px] font-black text-zinc-600 uppercase">From</span><span className="text-lg font-black">{startRange === endRange ? 0 : startRange + 1}</span></div>
                  <div className="flex flex-col items-end"><span className="text-[7px] font-black text-zinc-600 uppercase">To</span><span className="text-lg font-black">{endRange}</span></div>
                </div>
                <div className="relative h-6 flex items-center">
                  <div className="absolute inset-x-0 h-1 bg-white/5 rounded-full" />
                  <div className="absolute h-1 bg-indigo-500 rounded-full" style={{ left: `${(startRange / maxTotal) * 100}%`, right: `${100 - (endRange / maxTotal) * 100}%` }} />
                  <input type="range" min="0" max={maxTotal} value={startRange} onChange={(e) => setStartRange(Math.min(parseInt(e.target.value), endRange))} className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full" />
                  <input type="range" min="0" max={maxTotal} value={endRange} onChange={(e) => setEndRange(Math.max(parseInt(e.target.value), startRange))} className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full" />
                </div>
              </div>
            </div>

            {message.text && (
              <div className={`p-4 rounded-xl text-[9px] font-black uppercase text-center border ${message.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                {message.text}
              </div>
            )}
            {message.text && <div className={`p-4 rounded-xl text-[9px] font-black uppercase text-center border ${message.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>{message.text}</div>}
          </div>
        </aside>

        <section className="flex-1 p-4 sm:p-8 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-6">
            <button onClick={handleSelectAll} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-all">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedIds.size === filteredCandidates.length && filteredCandidates.length > 0 ? 'bg-indigo-600 border-indigo-600' : 'border-white/10'}`}>
                {selectedIds.size > 0 && <span className="text-white text-[10px] font-bold">{selectedIds.size === filteredCandidates.length ? '✓' : '-'}</span>}
              </div>
              <div className="text-left"><h3 className="text-sm font-black tracking-tight">Stream Preview</h3><p className="text-[8px] uppercase text-zinc-600">Toggle Selected</p></div>
            </button>
            <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white/2 border border-white/5 p-3 rounded-2xl px-5">
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1">
                  <button onClick={() => handleBulkUpdate('Selected')} className="h-10 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2 transition-all"><FiCheckCircle /> Select</button>
                  <button onClick={() => handleBulkUpdate('Pending')} className="h-10 px-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-2 transition-all"><FiClock /> Hold</button>
                  <button onClick={() => handleBulkUpdate('Rejected')} className="h-10 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-rose-400 flex items-center gap-2 transition-all"><FiXCircle /> Reject</button>
                </div>
              </div>

              {activeTab === 'Aptitude' && (
                <div className="h-8 w-px bg-white/5 hidden md:block" />
              )}

              {activeTab === 'Aptitude' && (
                <div className="relative group flex-1 max-w-[200px]">
                  <FiBookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-fuchsia-400" size={12} />
                  <select 
                    onChange={(e) => e.target.value && handleBulkUpdateField('Aptitude SET', e.target.value)}
                    className="w-full h-10 bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 text-[8px] font-black uppercase text-zinc-400 outline-none focus:border-fuchsia-500/50 cursor-pointer appearance-none"
                  >
                    <option value="">Bulk Set Assign</option>
                    {[1, 2, 3, 4, 5].map(s => <option key={s} value={`SET ${s}`} className="bg-[#090b10]">Set {s}</option>)}
                  </select>
                </div>
              )}
              
              <div className="ml-auto flex items-center gap-4">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{activeTab}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar pr-1">
            {displayCandidates.map((cand) => (
              <div key={cand.ID} onClick={() => toggleSelection(cand.ID)} className={`group flex flex-col sm:flex-row sm:items-center p-4 rounded-2xl border transition-all cursor-pointer ${cand.isSelected ? 'bg-indigo-600/10 border-indigo-500/30' : 'bg-black/40 border-white/5 hover:border-white/10'}`}>
                <div className="flex items-center gap-4 flex-1">
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] ${cand.isSelected ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-500'}`}>{cand.ID}</div>
                  <div className="min-w-0 pr-4">
                    <h4 className="text-xs font-bold text-white truncate">{cand.Name}</h4>
                    <p className="text-[9px] text-zinc-600 font-medium truncate">{cand['Role Applied For?']}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4 sm:mt-0 sm:ml-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-white/5 shrink-0" onClick={e => e.stopPropagation()}>
                  <div className="flex flex-col gap-1">
                    <label className="text-[7px] font-black uppercase text-zinc-600 tracking-tighter">Round Status</label>
                    <select 
                      value={cand[activeTab === 'Orientation' ? 'Orientation(Agree & Disagree)' : activeTab === 'Group Discussion' ? 'GD Status' : 'Aptitude Status'] || "Pending"}
                      onChange={(e) => {
                        updateCandidateLocally(cand.ID, { [activeTab === 'Orientation' ? 'Orientation(Agree & Disagree)' : activeTab === 'Group Discussion' ? 'GD Status' : 'Aptitude Status']: e.target.value });
                        loadCandidates();
                      }}
                      className="bg-[#090b10] border border-white/10 rounded-lg h-8 px-2 text-[9px] font-black text-indigo-400 focus:border-indigo-500 outline-none w-24"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Selected">Selected</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  {activeTab === 'Aptitude' && (
                    <div className="flex items-center gap-2 border-l border-white/5 pl-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[7px] font-black text-zinc-600">Score</label>
                        <select value={cand['Aptitude Marks'] || ""} onChange={e => { updateCandidateLocally(cand.ID, { 'Aptitude Marks': e.target.value }); loadCandidates(); }} className="bg-[#090b10] border border-white/10 rounded-lg h-8 px-1 text-[9px] font-black text-indigo-400 outline-none w-12">
                          <option value="">-</option>
                          {[...Array(10)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[7px] font-black text-zinc-600">SET</label>
                        <select value={cand['Aptitude SET'] || ""} onChange={e => { updateCandidateLocally(cand.ID, { 'Aptitude SET': e.target.value }); loadCandidates(); }} className="bg-[#090b10] border border-white/10 rounded-lg h-8 px-1 text-[9px] font-black text-fuchsia-400 outline-none w-16">
                          <option value="">-</option>
                          {[1, 2, 3, 4, 5].map(set => <option key={set} value={`SET ${set}`}>SET {set}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                  {cand.isSelected && <FiCheckCircle className="text-indigo-400 shrink-0 ml-2 animate-pulse" />}
                </div>
              </div>
            ))}
            {displayCandidates.length === 0 && <div className="py-20 text-center opacity-10"><FiUsers size={64} className="mx-auto mb-4" /><p className="text-xs font-black uppercase tracking-widest">No Stream</p></div>}
          </div>
        </section>
      </main>
      
      {showSidebar && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={() => setShowSidebar(false)} />}
      {showSuccessModal && <div className="fixed bottom-6 right-6 left-6 sm:left-auto bg-[#0d1117] border border-emerald-500/30 rounded-2xl p-4 shadow-3xl z-50 flex items-center justify-center sm:justify-start gap-4 animate-in fade-in slide-in-from-bottom-5"><FiCheckCircle className="text-emerald-500" /><div><h4 className="text-[10px] font-black uppercase text-emerald-500">Sync Complete</h4><p className="text-[8px] text-zinc-500 font-bold uppercase">Excel Refreshed</p></div></div>}
    </div>
  );
};

export default PreScreen;
