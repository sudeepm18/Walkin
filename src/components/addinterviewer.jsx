import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiUserPlus, FiPhone, 
  FiZap, FiMapPin, FiCheckCircle, FiTrash2,
  FiCpu, FiRefreshCw, FiAlertCircle, FiClock, FiEdit2
} from 'react-icons/fi';
import logo from '../assets/logo.png';
import { syncInterviewers, pushToGoogleSheet } from '../services/syncService';

const AddInterviewer = () => {
  const navigate = useNavigate();
  const [selectedInterviewer, setSelectedInterviewer] = useState({
    name: '',
    phone: '',
    skill: '',
    branch: '',
    round: 'L1'
  });
  const [interviewers, setInterviewers] = useState([]);
  const [interviewerSheetUrl, setInterviewerSheetUrl] = useState(localStorage.getItem('walkin_interviewer_sheet_url') || '');
  const [scriptUrl, setScriptUrl] = useState(localStorage.getItem('walkin_interviewer_script_url') || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const existing = localStorage.getItem('walkin_interviewers');
    if (existing) setInterviewers(JSON.parse(existing));
  }, []);

  const handleSaveInterviewer = async () => {
    if (!selectedInterviewer.name || !selectedInterviewer.phone || !selectedInterviewer.skill || !selectedInterviewer.branch) {
      showMsg('Please fill all fields', 'error');
      return;
    }
    
    setIsSyncing(true);
    try {
      let updated;
      if (isEditing) {
        updated = interviewers.map(i => i.id === selectedInterviewer.id ? selectedInterviewer : i);
      } else {
        updated = [...interviewers, { ...selectedInterviewer, id: Date.now() }];
      }
      
      // Push to Google Sheet if script URL exists
      if (scriptUrl) {
        await pushToGoogleSheet(scriptUrl, selectedInterviewer);
        localStorage.setItem('walkin_interviewer_script_url', scriptUrl);
      }
      
      setInterviewers(updated);
      localStorage.setItem('walkin_interviewers', JSON.stringify(updated));
      setSelectedInterviewer({ name: '', phone: '', skill: '', branch: '', round: 'L1' });
      setIsEditing(false);
      showMsg(isEditing ? 'Interviewer Updated & Synced' : 'Interviewer Saved & Synced', 'success');
    } catch (err) {
      console.error("Save failed:", err);
      showMsg('Saved locally, but Sync failed', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEditInterviewer = (interviewer) => {
    setSelectedInterviewer(interviewer);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSyncExcel = async () => {
    if (!interviewerSheetUrl) {
      showMsg('Provide Interviewer Sheet URL', 'error');
      return;
    }
    setIsSyncing(true);
    try {
      const data = await syncInterviewers(interviewerSheetUrl);
      setInterviewers(data);
      localStorage.setItem('walkin_interviewer_sheet_url', interviewerSheetUrl);
      showMsg(`Loaded ${data.length} Interviewers`, 'success');
    } catch (err) {
      showMsg('Failed to sync. Ensure sheet is public.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteInterviewer = (id) => {
    const updated = interviewers.filter(i => i.id !== id);
    setInterviewers(updated);
    localStorage.setItem('walkin_interviewers', JSON.stringify(updated));
  };

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-4 sm:p-6 lg:p-10 font-sans relative overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto relative z-10">
        <header className="flex items-center justify-between mb-10 sm:mb-16">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all">
            <FiArrowLeft /> <span className="hidden sm:inline">Portal</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
              <FiCpu className="text-violet-400" />
            </div>
            <h1 className="text-xs sm:text-sm font-black uppercase tracking-[0.4em] text-zinc-400">Panel Manager</h1>
          </div>
          <button onClick={handleSyncExcel} disabled={isSyncing} className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 h-10 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all">
            {isSyncing ? <FiRefreshCw className="animate-spin text-violet-400" /> : <FiRefreshCw className="text-violet-400" />}
            <span className="hidden sm:inline">Sync from Excel</span>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20">
          <div className="lg:col-span-5 xl:col-span-4">
            <h2 className="text-3xl sm:text-4xl font-[1000] tracking-tighter mb-4 leading-tight">{isEditing ? 'Edit' : 'Onboard'} <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-indigo-400">Panel Member</span></h2>
            <p className="text-zinc-500 text-sm font-medium mb-10 max-w-sm">{isEditing ? 'Modify existing interviewer details. Changes will sync to your spreadsheet.' : 'Register new interviewers or sync your entire team from the linked Google Sheet.'}</p>

            <div className="mb-10 space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">1. Interviewer Spreadsheet Link (with GID)</label>
                <div className="relative group">
                  <FiRefreshCw className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-violet-400" />
                  <input 
                    type="text" 
                    placeholder="https://docs.google.com/spreadsheets/d/...#gid=..." 
                    value={interviewerSheetUrl} 
                    onChange={e => setInterviewerSheetUrl(e.target.value)} 
                    onBlur={() => localStorage.setItem('walkin_interviewer_sheet_url', interviewerSheetUrl)}
                    className="w-full h-12 bg-white/2 border border-white/10 rounded-xl pl-11 pr-4 text-[10px] font-medium text-zinc-400 outline-none focus:border-violet-500/50" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">2. Apps Script Deployment URL</label>
                <div className="relative group">
                  <FiZap className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-violet-400" />
                  <input 
                    type="text" 
                    placeholder="https://script.google.com/macros/s/.../exec" 
                    value={scriptUrl} 
                    onChange={e => setScriptUrl(e.target.value)} 
                    onBlur={() => localStorage.setItem('walkin_interviewer_script_url', scriptUrl)}
                    className="w-full h-12 bg-white/2 border border-white/10 rounded-xl pl-11 pr-4 text-[10px] font-medium text-zinc-400 outline-none focus:border-violet-500/50" 
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#0d1117] border border-white/5 rounded-[32px] p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Full Name</label>
                <div className="relative group">
                  <FiUserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-violet-400 transition-colors" />
                  <input type="text" placeholder="Full name..." value={selectedInterviewer.name} onChange={e => setSelectedInterviewer({...selectedInterviewer, name: e.target.value})} className="w-full h-14 bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 text-sm outline-none focus:border-violet-500/50 transition-all font-medium" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Mobile Number</label>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 focus-within:text-violet-400" />
                    <input type="tel" placeholder="+91..." value={selectedInterviewer.phone} onChange={e => setSelectedInterviewer({...selectedInterviewer, phone: e.target.value})} className="w-full h-14 bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 text-xs font-medium outline-none focus:border-violet-500/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Interview Round</label>
                  <select value={selectedInterviewer.round} onChange={e => setSelectedInterviewer({...selectedInterviewer, round: e.target.value})} className="w-full h-14 bg-black/40 border border-white/10 rounded-xl px-4 text-xs font-black uppercase tracking-widest outline-none focus:border-violet-500/50 appearance-none">
                    <option value="L1">L1 Round</option>
                    <option value="L2">L2 Round</option>
                    <option value="HR">HR Round</option>
                    <option value="All">All Rounds</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-zinc-600">Primary Skill</label>
                  <input type="text" placeholder="e.g. React" value={selectedInterviewer.skill} onChange={e => setSelectedInterviewer({...selectedInterviewer, skill: e.target.value})} className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-xs outline-none focus:border-violet-500/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-zinc-600">Branch</label>
                  <input type="text" placeholder="Location" value={selectedInterviewer.branch} onChange={e => setSelectedInterviewer({...selectedInterviewer, branch: e.target.value})} className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-xs outline-none focus:border-violet-500/50" />
                </div>
              </div>

              <button 
                onClick={handleSaveInterviewer} 
                disabled={isSyncing}
                className="w-full bg-violet-600 hover:bg-violet-700 h-16 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-violet-500/20 disabled:opacity-50"
              >
                {isSyncing ? <FiRefreshCw className="animate-spin" /> : null}
                {isSyncing ? 'Syncing...' : isEditing ? 'Update Member' : 'Add to Panel'}
              </button>
              {isEditing && (
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedInterviewer({ name: '', phone: '', skill: '', branch: '', round: 'L1' });
                  }}
                  className="w-full bg-white/5 border border-white/10 hover:bg-white/10 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Cancel Edit
                </button>
              )}
              {message.text && (
                <div className={`p-4 rounded-xl text-[9px] font-black uppercase text-center flex items-center justify-center gap-2 border ${message.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                  {message.type === 'error' ? <FiAlertCircle /> : <FiCheckCircle />} {message.text}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 xl:col-span-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black">Active Panel</h3>
              <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-[10px] font-black text-zinc-500 uppercase">{interviewers.length} Members</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interviewers.length === 0 ? (
                <div className="md:col-span-2 h-[400px] border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center bg-white/1 opacity-20">
                  <FiUserPlus className="text-4xl mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">Panel is currently empty</p>
                </div>
              ) : (
                interviewers.map(int => (
                  <div key={int.id} className="bg-[#0d1117] border border-white/5 rounded-[24px] p-5 flex items-center justify-between group hover:border-violet-500/30 transition-all">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center font-black text-violet-400 shrink-0 uppercase">{int.name.charAt(0)}</div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                           <h4 className="text-white font-bold text-sm truncate">{int.name}</h4>
                           <span className="bg-white/5 text-[7px] font-black uppercase px-1.5 py-0.5 rounded border border-white/10 text-zinc-500">{int.round}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 mt-1 overflow-hidden">
                          <span className="text-[10px] text-zinc-600 font-bold truncate">{int.phone}</span>
                          <div className="flex items-center gap-3 mt-1 min-w-0">
                            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1 truncate min-w-0">
                              <FiZap size={8} className="text-violet-400 shrink-0" /> 
                              <span className="truncate">{int.skill}</span>
                            </span>
                            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1 shrink-0">
                              <FiMapPin size={8} className="shrink-0" /> {int.branch}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4 mb-2 shrink-0">
                      <button onClick={() => handleEditInterviewer(int)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-600 hover:text-violet-400 transition-all"><FiEdit2 size={12} /></button>
                      <button onClick={() => handleDeleteInterviewer(int.id)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-600 hover:text-rose-400 transition-all"><FiTrash2 size={12} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.05]">
        <img src={logo} className="w-[80%] max-w-[600px] scale-110" />
      </div>
    </div>
  );
};

export default AddInterviewer;
