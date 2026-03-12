import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'
import { 
  FiSearch, FiUsers, FiCheckCircle, 
  FiXCircle, FiClock, FiMessageCircle, FiBookOpen, 
  FiUserCheck, FiTarget, FiChevronRight, FiArrowLeft, FiEdit3, FiLayout,
  FiActivity, FiAward, FiRefreshCw, FiDownload, FiCheck, FiX
} from 'react-icons/fi';
import { useCandidates } from '../context/CandidateContext';
import CandidateDrawer from './CandidateDrawer';
import { exportCandidatesToExcel } from '../lib/excelExport';

const KPICard = ({ icon: Icon, label, value, colorClass, accentColor }) => (
  <div className={`bg-[#0d121d] border border-white/5 p-4 sm:p-5 rounded-[22px] flex items-center gap-4 sm:gap-5 group hover:bg-[#111827] transition-all duration-300 relative overflow-hidden h-20 sm:h-24`}>
    <div className={`absolute top-0 left-0 right-0 h-[3px] z-10 ${accentColor} opacity-80`} />
    <div className="p-2 sm:p-3.5 rounded-[12px] sm:rounded-[14px] bg-white/5 shrink-0">
      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClass}`} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 truncate mb-1 sm:mb-1.5">{label}</p>
      <h3 className="text-xl sm:text-2xl font-black text-white leading-none tracking-tight">{value}</h3>
    </div>
  </div>
);

const PositionCard = ({ title, count, breakdown, isActive, onClick }) => (
  <div 
    onClick={onClick}
    className={`p-4 sm:p-6 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all cursor-pointer group relative ${isActive ? 'bg-indigo-500/5' : ''}`}
  >
    {isActive && <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />}
    <div className="flex items-center justify-between mb-4">
      <div className="min-w-0 pr-2">
        <h4 className={`text-xs sm:text-sm font-bold transition-colors truncate ${isActive ? 'text-indigo-400' : 'text-white group-hover:text-indigo-400'}`}>{title}</h4>
        <p className="text-[9px] sm:text-[10px] text-zinc-500 font-bold mt-0.5">{count} Candidates</p>
      </div>
      <FiChevronRight className={`shrink-0 transition-all ${isActive ? 'text-indigo-400 translate-x-1' : 'text-zinc-600 group-hover:text-indigo-400 group-hover:translate-x-1'}`} />
    </div>
    <div className="flex items-center gap-4">
      {breakdown.map((item, i) => (
        <div key={i} className={`flex items-center gap-1.5 transition-all ${isActive ? 'grayscale-0 opacity-100' : 'grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100'}`}>
          <item.icon className={`w-3 h-3 ${item.color}`} />
          <span className="text-[10px] text-zinc-400 font-bold">{item.val}</span>
        </div>
      ))}
    </div>
  </div>
);

const CandidateCard = ({ ID, name, position, isExp, status, currentStage, lastCompletedStage, stages, onClick }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={onClick}
      className="bg-[#0b121d] border border-white/5 rounded-[20px] p-4 hover:bg-[#0d1624] transition-all group cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/80 flex items-center justify-center font-black text-lg text-white shadow-2xl shadow-indigo-500/20 shrink-0">
            {name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h4 className="text-base sm:text-lg font-black text-white tracking-tight leading-none mb-1.5 truncate">{name}</h4>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="bg-blue-500/10 text-blue-400 text-[8px] font-black px-2 py-0.5 rounded-md tracking-widest uppercase border border-blue-500/20 truncate max-w-[120px]">
                {position}
              </span>
              <span className={`text-[8px] font-black px-2 py-0.5 rounded-md tracking-widest uppercase border ${
                isExp 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
              }`}>
                {isExp ? 'EXP' : 'FRESHER'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3">
          <div className="flex flex-col items-start sm:items-end">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 bg-[#050910] border rounded-lg mb-1 ${
              status === 'Selected' ? 'border-emerald-500/30 text-emerald-400' :
              status === 'Rejected' ? 'border-rose-500/30 text-rose-400' :
              'border-amber-500/30 text-amber-400'
            }`}>
              <FiCheckCircle size={10} className={status === 'Selected' ? 'animate-pulse' : ''} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">{status}</span>
            </div>
            {status !== 'Selected' && (
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500">
                {status === 'Rejected' ? (
                  <>REJECTED IN <span className="text-rose-400">{currentStage}</span></>
                ) : !lastCompletedStage ? (
                  <span className="text-amber-400">PENDING</span>
                ) : (
                  <>SHORTL. IN <span className="text-zinc-300">{lastCompletedStage}</span></>
                )}
              </p>
            )}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/update-candidate?id=${ID}`);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 transition-all active:scale-95"
          >
            <FiEdit3 /> Update
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between w-full px-1 sm:px-4 relative mt-1 overflow-x-auto no-scrollbar py-2">
        {stages.map((stage, i) => {
          const colors = {
            violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/50', text: 'text-violet-400', shadow: 'rgba(139, 92, 246, 0.1)', line: 'bg-violet-500', glow: 'rgba(139, 92, 246, 0.4)' },
            cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/50', text: 'text-cyan-400', shadow: 'rgba(6, 182, 212, 0.1)', line: 'bg-cyan-500', glow: 'rgba(6, 182, 212, 0.4)' },
            amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/50', text: 'text-amber-400', shadow: 'rgba(245, 158, 11, 0.1)', line: 'bg-amber-500', glow: 'rgba(245, 158, 11, 0.4)' },
            emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/50', text: 'text-emerald-400', shadow: 'rgba(16, 185, 129, 0.1)', line: 'bg-emerald-500', glow: 'rgba(16, 185, 129, 0.4)' },
          };
          const c = colors[stage.color] || colors.violet;

          return (
            <React.Fragment key={i}>
              <div className="relative z-10 flex flex-col items-center gap-1.5 shrink-0 w-8">
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-500 ${
                  stage.isRejected ? 'bg-rose-500/10 border-rose-500/50 text-rose-500' :
                  stage.isCompleted 
                    ? `${c.bg} ${c.border} ${c.text}` 
                    : 'bg-[#0d1520] border-white/10 text-zinc-800'
                }`} style={stage.isCompleted ? { boxShadow: `0 0 15px ${c.shadow}` } : stage.isRejected ? { boxShadow: `0 0 15px rgba(244, 63, 94, 0.15)` } : {}}>
                  {stage.isRejected ? <FiX size={10} strokeWidth={4} /> : 
                   stage.isCompleted ? <FiCheck size={10} strokeWidth={4} /> : 
                   <stage.icon size={11} className="opacity-30" />}
                </div>
                <span className={`text-[5.5px] font-black uppercase tracking-widest whitespace-nowrap ${stage.isRejected ? 'text-rose-500/50' : stage.isCompleted ? 'text-zinc-400' : 'text-zinc-800'}`}>
                  {stage.label}
                </span>
              </div>

              {i < stages.length - 1 && (
                <div className="flex-1 -mt-1.5 min-w-[10px]">
                  <div className={`h-px w-full transition-all duration-700 ${
                    stage.isCompleted ? c.line : stage.isRejected ? 'bg-rose-500/30' : 'bg-white/5'
                  }`} style={stage.isCompleted ? { boxShadow: `0 0 8px ${c.glow}` } : {}} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { candidates: candidatesRaw, lastSync: lastSynced, isSyncing, refreshCandidates } = useCandidates();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedCandidateForDrawer, setSelectedCandidateForDrawer] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showAllCandidates, setShowAllCandidates] = useState(true);
  const [expFilter, setExpFilter] = useState("all"); // "all", "exp", "fresher"

  const handleManualSync = useCallback(async () => {
    await refreshCandidates();
  }, [refreshCandidates]);

  useEffect(() => {
    handleManualSync();
  }, [handleManualSync]);



  const handleExport = () => {
    exportCandidatesToExcel(candidatesRaw);
  };

  const candidates = useMemo(() => {
    return candidatesRaw.map(cand => {
      const getStatus = (val) => {
        const s = (val || "").trim().toLowerCase();
        if (s === "selected") return "Selected";
        if (s === "rejected") return "Rejected";
        return "Pending";
      };
      const orientStatus = getStatus(cand['Orientation(Agree & Disagree)']);
      const gdStatus = getStatus(cand['GD Status']);
      const aptStatus = getStatus(cand['Aptitude Status']);
      const l1Status = getStatus(cand['L1(selected /Rejected)']);
      const l2Status = getStatus(cand['L2(Selected /Rejected)']);
      const hrStatus = getStatus(cand['HR Round Status']);
      const statuses = [orientStatus, gdStatus, aptStatus, l1Status, l2Status, hrStatus];
      const firstNonSelected = statuses.find(s => s !== 'Selected') || 'Selected';
      const isOffer = hrStatus === 'Selected';
      const isRejected = firstNonSelected === 'Rejected';
      const lastCompletedStage = isOffer ? 'HR' : (
        l2Status === 'Selected' ? 'L2' : 
        l1Status === 'Selected' ? 'L1' : 
        aptStatus === 'Selected' ? 'Aptit.' : 
        gdStatus === 'Selected' ? 'GD' : 
        orientStatus === 'Selected' ? 'Orient.' : null
      );
      return {
        ...cand,
        name: cand.Name || "Unknown",
        position: cand['Role Applied For?'] || "Not Specified",
        isExp: ['yes', 'true', '1'].includes(String(cand['Have a relevent work experience before?'] || "").toLowerCase()),
        status: isOffer ? 'Selected' : (isRejected ? 'Rejected' : 'Pending'),
        currentStage: isOffer ? 'OFFERED' : (
          l2Status === 'Selected' ? 'HR' : 
          l1Status === 'Selected' ? 'L2' : 
          aptStatus === 'Selected' ? 'L1' : 
          gdStatus === 'Selected' ? 'Aptitude' : 
          orientStatus === 'Selected' ? 'GD' : 'Orientation'
        ),
        lastCompletedStage,
        stages: [
          { label: "Orient", icon: FiActivity, color: "violet", isCompleted: orientStatus === 'Selected', isRejected: orientStatus === 'Rejected' },
          { label: "GD", icon: FiMessageCircle, color: "cyan", isCompleted: gdStatus === 'Selected', isRejected: gdStatus === 'Rejected' },
          { label: "Aptit.", icon: FiBookOpen, color: "violet", isCompleted: aptStatus === 'Selected', isRejected: aptStatus === 'Rejected' },
          { label: "L1", icon: FiUserCheck, color: "amber", isCompleted: l1Status === 'Selected', isRejected: l1Status === 'Rejected' },
          { label: "L2", icon: FiTarget, color: "emerald", isCompleted: l2Status === 'Selected', isRejected: l2Status === 'Rejected' },
          { label: "HR", icon: FiAward, color: "emerald", isCompleted: hrStatus === 'Selected', isRejected: hrStatus === 'Rejected' }
        ]
      };
    });
  }, [candidatesRaw]);

  const candidatesFilteredByExp = useMemo(() => {
    if (expFilter === "all") return candidates;
    return candidates.filter(c => expFilter === "exp" ? c.isExp : !c.isExp);
  }, [candidates, expFilter]);

  const stats = useMemo(() => {
    const sourceData = selectedRole ? candidatesFilteredByExp.filter(c => c.position === selectedRole) : candidatesFilteredByExp;
    const total = sourceData.length;
    const selected = sourceData.filter(c => c.status === 'Selected').length;
    const rejected = sourceData.filter(c => c.status === 'Rejected').length;
    const pending = total - selected - rejected;
    const gdSelected = sourceData.filter(c => (c['Orientation(Agree & Disagree)'] === 'Selected' || c['Orientation(Agree & Disagree)'] === 'Agree') && c['GD Status'] === 'Pending' && c.status !== 'Rejected').length;
    const aptSelected = sourceData.filter(c => c['GD Status'] === 'Selected' && c['Aptitude Status'] === 'Pending' && c.status !== 'Rejected').length;
    const l1Selected = sourceData.filter(c => c['Aptitude Status'] === 'Selected' && c['L1(selected /Rejected)'] === 'Pending' && c.status !== 'Rejected').length;
    const l2Selected = sourceData.filter(c => c['L1(selected /Rejected)'] === 'Selected' && c['L2(Selected /Rejected)'] === 'Pending' && c.status !== 'Rejected').length;
    const orientSelected = sourceData.filter(c => (c['Orientation(Agree & Disagree)'] === 'Selected' || c['Orientation(Agree & Disagree)'] === 'Agree')).length;
    const orientPending = sourceData.filter(c => c['Orientation(Agree & Disagree)'] === 'Pending' && c.status !== 'Rejected').length;
    const hrPending = sourceData.filter(c => c['L2(Selected /Rejected)'] === 'Selected' && c['HR Round Status'] === 'Pending' && c.status !== 'Rejected').length;
    return { total, selected, rejected, pending, gdSelected, aptSelected, l1Selected, l2Selected, orientSelected, orientPending, hrPending };
  }, [candidatesFilteredByExp, selectedRole]);

  const positions = useMemo(() => {
    const posMap = {};
    candidatesFilteredByExp.forEach(c => {
      const p = c.position;
      if (!posMap[p]) posMap[p] = { title: p, count: 0, sel: 0, rej: 0, pen: 0 };
      posMap[p].count++;
      if (c.status === 'Selected') posMap[p].sel++;
      else if (c.status === 'Rejected') posMap[p].rej++;
      else posMap[p].pen++;
    });
    return Object.values(posMap).map(p => ({
      ...p,
      breakdown: [
        { icon: FiCheckCircle, color: "text-emerald-500", val: p.sel },
        { icon: FiXCircle, color: "text-rose-500", val: p.rej },
        { icon: FiClock, color: "text-amber-500", val: p.pen }
      ]
    })).sort((a, b) => b.count - a.count);
  }, [candidatesFilteredByExp]);

  const filteredCandidates = candidatesFilteredByExp.filter(c => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = c.name.toLowerCase().includes(s) || 
                         c.position.toLowerCase().includes(s) || 
                         String(c.ID).toLowerCase().includes(s);
    const matchesRole = selectedRole ? c.position === selectedRole : true;
    const matchesPipeline = showAllCandidates ? true : c.lastCompletedStage !== null;
    return matchesSearch && matchesRole && matchesPipeline;
  });

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors mb-6">
          <FiArrowLeft /> Back to Portal
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[20px] flex items-center justify-center shrink-0">
              <img src={logo} className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">Walk-in Management</h1>
              <p className="text-[10px] sm:text-xs text-zinc-500 font-bold tracking-wide mt-1">Real-time candidate tracking & pipeline</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {lastSynced && !isSyncing && (
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 hidden md:inline">Last Sync: {lastSynced}</span>
            )}
            <button onClick={handleManualSync} disabled={isSyncing} className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl bg-[#0d1117] border border-white/10 text-zinc-400 hover:text-white transition-all">
              <FiRefreshCw className={isSyncing ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={handleExport}
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 transition-all"
              title="Export to Excel"
            >
              <FiDownload />
            </button>
            <div className="flex-1 sm:flex-initial flex items-center gap-3">
              <select 
                value={expFilter} 
                onChange={(e) => setExpFilter(e.target.value)}
                className="bg-[#0d1117] border border-white/10 rounded-xl h-10 sm:h-12 px-4 text-[10px] font-black uppercase tracking-widest text-indigo-400 outline-none focus:border-indigo-500/50 appearance-none min-w-[120px]"
              >
                <option value="all">All</option>
                <option value="exp">Experienced </option>
                <option value="fresher">Freshers </option>
              </select>
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input type="text" placeholder="Search ID or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-[#0d1117] border border-white/10 rounded-xl py-2.5 sm:py-3 pl-12 pr-6 text-sm outline-none w-full sm:w-64 focus:border-indigo-500/50" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-4">
          <KPICard icon={FiUsers} label="Total" value={stats.total} colorClass="text-violet-400" accentColor="bg-violet-400" />
          <KPICard icon={FiCheckCircle} label="Selected" value={stats.selected} colorClass="text-emerald-400" accentColor="bg-emerald-400" />
          <KPICard icon={FiXCircle} label="Rejected" value={stats.rejected} colorClass="text-rose-400" accentColor="bg-rose-400" />
          <KPICard icon={FiClock} label="Pending" value={stats.pending} colorClass="text-amber-400" accentColor="bg-amber-400" />
          <KPICard icon={FiActivity} label="Orientation" value={stats.orientPending} colorClass="text-violet-400" accentColor="bg-violet-400" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-8">
          <KPICard icon={FiMessageCircle} label="GD" value={stats.gdSelected} colorClass="text-cyan-400" accentColor="bg-cyan-400" />
          <KPICard icon={FiBookOpen} label="Aptitude" value={stats.aptSelected} colorClass="text-violet-400" accentColor="bg-violet-400" />
          <KPICard icon={FiUserCheck} label="L1" value={stats.l1Selected} colorClass="text-amber-400" accentColor="bg-amber-400" />
          <KPICard icon={FiTarget} label="L2" value={stats.l2Selected} colorClass="text-emerald-400" accentColor="bg-emerald-400" />
          <KPICard icon={FiAward} label="HR" value={stats.hrPending} colorClass="text-indigo-400" accentColor="bg-indigo-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
          <section className="bg-[#0d1117]/50 border border-white/5 rounded-[24px] overflow-hidden flex flex-col h-fit lg:max-h-[700px]">
            <div className="p-6 pb-4 flex items-center justify-between border-b border-white/5">
              <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400">Positions</h3>
              <span className="text-[10px] font-black text-zinc-500">{positions.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {positions.map((pos, i) => (
                <PositionCard key={i} {...pos} isActive={selectedRole === pos.title} onClick={() => setSelectedRole(selectedRole === pos.title ? null : pos.title)} />
              ))}
            </div>
          </section>

          <section className="bg-[#0d1117]/50 border border-white/5 rounded-[24px] overflow-hidden flex flex-col h-[500px] lg:h-[700px]">
            <div className="p-6 pb-4 flex items-center justify-between border-b border-white/5">
              <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 truncate">
                {selectedRole ? `Stream: ${selectedRole}` : "Total Candidates"}
              </h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowAllCandidates(!showAllCandidates)} 
                  className={`text-[9px] font-black uppercase transition-all px-2 py-1 rounded-md border ${
                    showAllCandidates 
                      ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400' 
                      : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white'
                  }`}
                ><span className='mr-2'>FootFall :</span>
                  {showAllCandidates ? `${stats.orientSelected} / ${stats.total}` : "Pipeline Only"}
                </button>
                {selectedRole && <button onClick={() => setSelectedRole(null)} className="text-[9px] font-black uppercase text-zinc-500 hover:text-white">Clear</button>}
                {/* <span className="text-[10px] font-black text-zinc-500">{filteredCandidates.length}</span> */}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
              {filteredCandidates.map((cand, i) => (
                <CandidateCard 
                  key={i} 
                  {...cand} 
                  onClick={() => {
                    setSelectedCandidateForDrawer(cand);
                    setIsDrawerOpen(true);
                  }}
                />
              ))}
              {filteredCandidates.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                  <FiUsers size={40} />
                  <p className="mt-4 text-[10px] font-black uppercase tracking-widest">No Results</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      
      <CandidateDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        candidate={selectedCandidateForDrawer} 
      />
    </div>
  );
};

export default Dashboard;
