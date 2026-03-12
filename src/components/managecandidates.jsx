import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCandidates } from '../context/CandidateContext';
import { 
  FiSearch, FiCalendar, FiMapPin, FiUsers, FiFilter, 
  FiChevronRight, FiArrowLeft, FiEdit3, FiGrid, FiList,
  FiMessageCircle, FiBookOpen, FiUserCheck, FiTarget, FiMoreVertical,
  FiActivity, FiAward
} from 'react-icons/fi';

const CandidateCard = ({ ID, name, position, isExp, status, currentStage, branch, date, stages }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#090b10] border border-white/5 rounded-2xl p-5 hover:border-indigo-500/30 transition-all group relative overflow-hidden">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center font-black text-white shadow-lg">
            {name.charAt(0)}
          </div>
          <div>
            <h4 className="text-base font-bold text-white leading-tight group-hover:text-indigo-400 transition-colors">{name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{position}</span>
              {isExp && <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase">EXP</span>}
            </div>
          </div>
        </div>
        <button 
          onClick={() => navigate(`/update-candidate?id=${ID}`)}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-all"
        >
          <FiEdit3 size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/2 rounded-xl p-3 border border-white/5">
          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-1">Branch</p>
          <div className="flex items-center gap-2">
            <FiMapPin className="text-zinc-500" size={10} />
            <span className="text-[10px] font-bold text-zinc-300">{branch || "Remote"}</span>
          </div>
        </div>
        <div className="bg-white/2 rounded-xl p-3 border border-white/5">
          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-1">Applied Date</p>
          <div className="flex items-center gap-2">
            <FiCalendar className="text-zinc-500" size={10} />
            <span className="text-[10px] font-bold text-zinc-300">{date || "N/A"}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Interview Progress</span>
        <span className="text-[9px] font-black uppercase tracking-widest text-orange-500">{status}</span>
      </div>

      <div className="flex items-center justify-between px-1 relative">
        <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-px bg-white/5 z-0" />
        {stages.map((stage, i) => (
          <div key={i} className="relative z-10">
            <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
              stage.active ? `bg-${stage.color}-500/20 border-${stage.color}-500/50 text-${stage.color}-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]` : 'bg-[#0d1117] border-white/5 text-zinc-700'
            }`}>
              <stage.icon size={10} />
            </div>
            <p className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[6px] font-black uppercase text-zinc-700 tracking-tighter whitespace-nowrap">{stage.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ManageCandidates = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [selectedDate, setSelectedDate] = useState("All Dates");
  const [viewMode, setViewMode] = useState("grid");

  const { candidates: candidatesRaw } = useCandidates();

  const candidates = useMemo(() => {
    return candidatesRaw.map(cand => {
      const timestamp = cand.Timestamp || "";
      const datePart = timestamp.split(' ')[0] || "No Date";
      
      return {
        ...cand,
        name: cand.Name || "Unknown",
        position: cand['Role Applied For?'] || "Not Specified",
        isExp: ['yes', 'true', '1'].includes(String(cand['Have a relevent work experience before?'] || "").toLowerCase()),
        status: cand['HR Round Status'] || "PENDING",
        branch: cand['Home Town'] || cand['Branch'] || "Main Branch", // Fallback to Home Town if branch is missing
        date: datePart,
        stages: [
          { label: "Orient", icon: FiActivity, color: "emerald", active: cand['Orientation(Agree & Disagree)'] === 'Selected' },
          { label: "GD", icon: FiMessageCircle, color: "blue", active: cand['GD Status'] === 'Selected' },
          { label: "Aptitude", icon: FiBookOpen, color: "indigo", active: cand['Aptitude Status'] === 'Selected' },
          { label: "L1", icon: FiUserCheck, color: "amber", active: cand['L1(selected /Rejected)'] === 'Selected' },
          { label: "L2", icon: FiTarget, color: "violet", active: cand['L2(Selected /Rejected)'] === 'Selected' },
          { label: "HR", icon: FiAward, color: "rose", active: cand['HR Round Status'] === 'Selected' }
        ]
      };
    });
  }, [candidatesRaw]);

  const branches = useMemo(() => ["All Branches", ...new Set(candidates.map(c => c.branch))], [candidates]);
  const dates = useMemo(() => ["All Dates", ...new Set(candidates.map(c => c.date))], [candidates]);

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranch === "All Branches" || c.branch === selectedBranch;
    const matchesDate = selectedDate === "All Dates" || c.date === selectedDate;
    return matchesSearch && matchesBranch && matchesDate;
  });

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-4 md:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-10">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors"
          >
            <FiArrowLeft /> Back to Portal
          </button>
          
          <div className="flex items-center gap-3">
            <FiUsers className="text-zinc-600" />
            <h1 className="text-sm font-black uppercase tracking-[0.4em] text-zinc-400">Candidate Directory</h1>
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <FiGrid size={16} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <FiList size={16} />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#0d1117] border border-white/5 rounded-[32px] p-8 mb-10 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="relative flex-1 group w-full">
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by candidate name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm outline-none focus:border-indigo-500/50 transition-all font-medium text-zinc-300 placeholder:text-zinc-700"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              <div className="relative min-w-[180px]">
                <FiMapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" />
                <select 
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-10 text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-500/50 transition-all appearance-none text-zinc-400 cursor-pointer"
                >
                  {branches.map(b => <option key={b} value={b} className="bg-[#0d1117]">{b}</option>)}
                </select>
              </div>

              <div className="relative min-w-[180px]">
                <FiCalendar className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" />
                <select 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-10 text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-500/50 transition-all appearance-none text-zinc-400 cursor-pointer"
                >
                  {dates.map(d => <option key={d} value={d} className="bg-[#0d1117]">{d}</option>)}
                </select>
              </div>

              <button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedBranch("All Branches");
                  setSelectedDate("All Dates");
                }}
                className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all border border-white/5"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-8 px-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 whitespace-nowrap">
            Showing <span className="text-indigo-400">{filteredCandidates.length}</span> candidates found in records
          </p>
          <div className="h-px bg-white/5 flex-1 mx-8" />
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live Data
            </span>
          </div>
        </div>

        {/* Candidates Grid */}
        <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredCandidates.map((cand) => (
            <CandidateCard key={cand.ID} {...cand} />
          ))}
          
          {filteredCandidates.length === 0 && (
            <div className="col-span-full h-[400px] flex flex-col items-center justify-center bg-[#0d1117]/50 rounded-[40px] border-2 border-dashed border-white/5">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 text-zinc-700">
                <FiUsers size={40} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-widest text-zinc-500">No candidates match filters</h3>
              <p className="text-sm text-zinc-700 mt-2 font-bold uppercase tracking-tight">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCandidates;
