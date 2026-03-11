import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiArrowLeft, FiSave, FiUser, FiMail, FiPhone, FiRefreshCw,
  FiMessageCircle, FiBookOpen, FiUserCheck, FiTarget, FiActivity, FiAward,
  FiLock, FiCheck, FiClock, FiX, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import { updateCandidateLocally, pushToGoogleSheet } from '../services/syncService';

const StageStep = ({ icon: Icon, label, isActive, isCompleted, isRejected, themeColor }) => {
  const themes = {
    violet: { bg: 'bg-violet-500/20', border: 'border-violet-500', text: 'text-violet-400' },
    cyan: { bg: 'bg-cyan-500/20', border: 'border-cyan-500', text: 'text-cyan-400' },
    amber: { bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-400' },
    emerald: { bg: 'bg-emerald-500/20', border: 'border-emerald-500', text: 'text-emerald-400' },
  };
  const theme = themes[themeColor] || themes.violet;

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[50px] sm:min-w-[70px]">
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-all ${
        isRejected ? 'bg-rose-500/20 border-rose-500 text-rose-500' : 
        (isCompleted || isActive) ? `${theme.bg} ${theme.border} ${theme.text}` : 
        'bg-[#0d1117] border-white/10 text-zinc-700'
      }`}>
        {isRejected ? <FiX size={14} /> : isCompleted ? <FiCheck size={14} /> : <Icon size={isActive ? 16 : 14} />}
      </div>
      <span className={`text-[6px] sm:text-[8px] font-black uppercase tracking-widest text-center whitespace-nowrap ${isActive ? 'text-white' : isRejected ? 'text-rose-500' : isCompleted ? theme.text : 'text-zinc-600'}`}>
        {label}
      </span>
    </div>
  );
};

const UpdateCandidate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const candidateId = queryParams.get('id');

  const [activeStage, setActiveStage] = useState('L1');
  const [candidate, setCandidate] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const stages = useMemo(() => [
    { id: 'Orientation', label: 'Orient', icon: FiActivity, field: 'Orientation(Agree & Disagree)', prev: null, readOnly: true, color: 'violet' },
    { id: 'GD', label: 'GD', icon: FiMessageCircle, field: 'GD Status', prev: 'Orientation(Agree & Disagree)', readOnly: true, color: 'cyan' },
    { id: 'Aptitude', label: 'Aptit', icon: FiBookOpen, field: 'Aptitude Status', prev: 'GD Status', readOnly: true, color: 'violet' },
    { id: 'L1', label: 'L1', icon: FiUserCheck, field: 'L1(selected /Rejected)', prev: 'Aptitude Status', color: 'amber' },
    { id: 'L2', label: 'L2', icon: FiTarget, field: 'L2(Selected /Rejected)', prev: 'L1(selected /Rejected)', color: 'emerald' },
    { id: 'HR', label: 'HR', icon: FiAward, field: 'HR Round Status', prev: 'L2(Selected /Rejected)', color: 'emerald' },
  ], []);

  const isStageLocked = (cand, stage) => {
    if (!cand || !stage || !stage.prev) return false;
    const prevValue = cand[stage.prev];
    return !['Selected', 'Agree', 'selected', 'agree', 'Completed', 'Done', 'Pass'].includes(prevValue);
  };

  const [availableRoles, setAvailableRoles] = useState([]);
  const [availableInterviewers, setAvailableInterviewers] = useState([]);

  useEffect(() => {
    const intData = localStorage.getItem('walkin_interviewers');
    if (intData) setAvailableInterviewers(JSON.parse(intData));

    const data = localStorage.getItem('walkin_candidates');
    if (data) {
      const candidates = JSON.parse(data);
      const roles = [...new Set(candidates.map(c => c['Role Applied For?']).filter(Boolean))].sort();
      setAvailableRoles(roles);

      const found = candidates.find(c => String(c.ID) === candidateId);
      if (found) {
        const withDefaults = { ...found };
        stages.forEach(s => { if (!withDefaults[s.field]) withDefaults[s.field] = 'Pending'; });
        if (!withDefaults['Final Role']) withDefaults['Final Role'] = "";
        setCandidate(withDefaults);
      }
    }
  }, [candidateId, stages]);

  const handleUpdateField = (field, value) => {
    setCandidate(prev => {
      let updated = { ...prev, [field]: value };
      if (value === 'Rejected') {
        const idx = stages.findIndex(s => s.field === field);
        if (idx !== -1) { for (let i = idx + 1; i < stages.length; i++) updated[stages[i].field] = 'Rejected'; }
      }
      return updated;
    });
  };

  const handleSave = async () => {
    if (!candidate) return;
    setIsSyncing(true);
    setSaveStatus("Syncing...");
    try {
      updateCandidateLocally(candidate.ID, candidate);
      const scriptUrl = localStorage.getItem('walkin_script_url');
      if (scriptUrl) await pushToGoogleSheet(scriptUrl, candidate);
      setSaveStatus("Synced!");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (err) {
      setSaveStatus("Failed");
    } finally {
      setIsSyncing(false);
    }
  };

  if (!candidate) return <div className="min-h-screen bg-[#05070a] flex items-center justify-center"><FiAlertCircle className="text-rose-500 animate-pulse" /></div>;

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-4 sm:p-8 font-sans overflow-x-hidden">
      <div className="max-w-[1200px] mx-auto">
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all self-start">
            <FiArrowLeft /> Back
          </button>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {saveStatus && <span className="text-[9px] font-black uppercase text-indigo-400 animate-fade-in">{saveStatus}</span>}
            <button onClick={handleSave} disabled={isSyncing} className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-700 h-10 px-6 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95">
              {isSyncing ? <FiRefreshCw className="animate-spin" /> : <FiSave />} Sync
            </button>
          </div>
        </header>

        <div className="bg-[#0d1117] border border-white/5 rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl font-black shrink-0">{candidate.Name?.charAt(0)}</div>
          <div className="text-center md:text-left min-w-0 flex-1">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-2">
              <h2 className="text-2xl font-black truncate">{candidate.Name}</h2>
              <span className="text-[10px] font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded uppercase text-zinc-500">#{candidate.ID}</span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-2 text-zinc-500 text-xs font-medium">
              <span className="flex items-center gap-1.5"><FiUser className="text-indigo-400" /> {candidate['Role Applied For?']}</span>
              <span className="flex items-center gap-1.5"><FiMail className="text-indigo-400" /> {candidate['Email Address']?.split('@')[0]}...</span>
              <span className="flex items-center gap-1.5"><FiPhone className="text-indigo-400" /> {candidate['Phone Number']}</span>
            </div>
          </div>
        </div>

        <div className="mb-10 overflow-x-auto no-scrollbar pb-4">
          <div className="flex items-center justify-between min-w-[500px] px-2">
            {stages.map((stage, i) => {
              const locked = isStageLocked(candidate, stage);
              const status = candidate[stage.field];
              const isCompleted = ['Selected', 'Agree', 'Pass'].includes(status);
              const isRejected = status === 'Rejected';
              return (
                <div key={stage.id} className="flex flex-1 items-center last:flex-none">
                  <button onClick={() => !locked && setActiveStage(stage.id)} disabled={locked} className={`transition-all ${locked ? 'opacity-20 translate-y-1' : 'hover:scale-105'}`}>
                    <StageStep icon={locked ? FiLock : stage.icon} label={stage.label} isActive={stage.id === activeStage} isCompleted={isCompleted} isRejected={isRejected} themeColor={stage.color} />
                  </button>
                  {i < stages.length - 1 && <div className={`h-px flex-1 mx-2 ${isCompleted ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : isRejected ? 'bg-rose-500' : 'bg-white/5'}`} />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          {stages.filter(s => !s.readOnly).map((stage, idx) => {
            const locked = isStageLocked(candidate, stage);
            if (locked && stage.id !== activeStage) return null;
            const currentStatus = candidate[stage.field];
            
            return (
              <div 
                key={stage.id} 
                onClick={() => !locked && setActiveStage(stage.id)}
                className={`bg-[#0d1117]/80 border-2 rounded-[32px] p-6 sm:p-8 transition-all duration-500 cursor-pointer ${stage.id === activeStage ? 'border-indigo-500/30 scale-[1.01] opacity-100 ring-1 ring-indigo-500/20' : 'border-white/5 opacity-40 hover:opacity-70'}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 ${stage.id === activeStage ? 'text-indigo-400 shadow-xl' : 'text-zinc-700'}`}>
                      <stage.icon size={24} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-500/50 mb-1">STAGE {idx+4}</p>
                      <h3 className="text-xl font-black">{stage.id} Details</h3>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-1.5 border rounded-xl text-[10px] font-black uppercase tracking-widest ${currentStatus === 'Selected' ? 'text-emerald-400 border-emerald-500/20' : currentStatus === 'Rejected' ? 'text-rose-400 border-rose-500/20' : 'text-amber-400 border-amber-500/20'}`}>
                    <FiCheckCircle size={10} /> {currentStatus}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                  {stage.id !== 'HR' && (
                    <div className="md:col-span-3">
                      <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-2">Round Score</label>
                      <input 
                        type="text" 
                        placeholder="--" 
                        value={candidate[stage.id === 'GD' ? 'GD Score' : (stage.id === 'L1' ? 'L1 Score' : (stage.id === 'L2' ? 'L2 Score' : 'Score'))] || ""} 
                        onChange={e => handleUpdateField(stage.id === 'GD' ? 'GD Score' : (stage.id === 'L1' ? 'L1 Score' : (stage.id === 'L2' ? 'L2 Score' : 'Score')), e.target.value)} 
                        className="w-full bg-black/40 border border-white/5 rounded-xl h-14 text-center text-xl font-black outline-none focus:border-indigo-400/30 transition-all" 
                      />
                    </div>
                  )}
                  <div className={stage.id === 'HR' ? 'md:col-span-5' : 'md:col-span-9'}>
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-2">{stage.id === 'HR' ? 'Final Assigned Role' : 'Assigned Interviewer'}</label>
                    <select value={candidate[stage.id === 'HR' ? 'Final Role' : (stage.id === 'L1' ? 'L1 Interviewer Name' : (stage.id === 'L2' ? 'L2 Interviewer Name' : 'Interviewer Name'))] || ""} onChange={e => handleUpdateField(stage.id === 'HR' ? 'Final Role' : (stage.id === 'L1' ? 'L1 Interviewer Name' : (stage.id === 'L2' ? 'L2 Interviewer Name' : 'Interviewer Name')), e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl h-14 px-6 text-xs font-bold outline-none focus:border-indigo-400/30 appearance-none">
                      <option value="">-- Choose --</option>
                      {stage.id === 'HR' ? availableRoles.map(r => <option key={r} value={r} className="bg-[#0d1117]">{r}</option>) : availableInterviewers.map(i => <option key={i.id} value={i.name} className="bg-[#0d1117]">{i.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  <button onClick={() => handleUpdateField(stage.field, 'Selected')} className={`h-12 rounded-xl border flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all ${currentStatus === 'Selected' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10' : 'border-white/5 text-zinc-600'}`}><FiCheck /> Selected</button>
                  <button onClick={() => handleUpdateField(stage.field, 'Pending')} className={`h-12 rounded-xl border flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all ${currentStatus === 'Pending' ? 'bg-amber-500/10 border-amber-500 text-amber-400' : 'border-white/5 text-zinc-600'}`}><FiClock /> Pending</button>
                  <button onClick={() => handleUpdateField(stage.field, 'Rejected')} className={`h-12 rounded-xl border flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all ${currentStatus === 'Rejected' ? 'bg-rose-500/10 border-rose-500 text-rose-400' : 'border-white/5 text-zinc-600'}`}><FiX /> Rejected</button>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Interviewer Notes</label>
                  <textarea placeholder="Candidate show good potential in..." value={candidate[stage.id === 'L1' ? 'L1 Comments' : (stage.id === 'L2' ? 'L2Comments' : 'Comments')] || ""} onChange={e => handleUpdateField(stage.id === 'L1' ? 'L1 Comments' : (stage.id === 'L2' ? 'L2Comments' : 'Comments'), e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl h-24 p-5 text-sm outline-none focus:border-indigo-400/30 resize-none transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UpdateCandidate;
