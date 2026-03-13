import React from 'react';
import { 
  FiX, FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, 
  FiCalendar, FiClock, FiCheckCircle, FiXCircle, 
  FiActivity, FiMessageCircle, FiBookOpen, FiUserCheck, FiTarget, FiAward,
  FiExternalLink, FiEdit3
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useCandidates } from '../context/CandidateContext';

const CandidateDrawer = ({ candidate, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { sheetUrl } = useCandidates();

  if (!candidate) return null;

  const stages = [
    { label: "Orientation", icon: FiActivity, field: 'Orientation(Agree & Disagree)', color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: "GD", icon: FiMessageCircle, field: 'GD Status', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: "Aptitude", icon: FiBookOpen, field: 'Aptitude Status', color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: "L1 Interview", icon: FiUserCheck, field: 'L1(selected /Rejected)', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: "L2 Interview", icon: FiTarget, field: 'L2(Selected /Rejected)', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: "HR Round", icon: FiAward, field: 'HR Round Status', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-[#090b10] border-l border-white/10 z-50 shadow-2xl transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col font-sans`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#0d1117]/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl font-black shadow-lg shadow-indigo-500/20">
              {candidate.name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">{candidate.name}</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Candidate ID: {candidate.ID}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate(`/update-candidate?id=${candidate.ID}`)}
              className="flex items-center justify-center gap-2 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <FiEdit3 size={14} /> Update Info
            </button>
            <button 
              onClick={() => window.open(sheetUrl, '_blank')}
              className="flex items-center justify-center gap-2 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
            >
              <FiExternalLink size={14} /> View in Sheet
            </button>
          </div>

          {/* Personal Info */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Personal Details</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                <FiMail className="text-indigo-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase text-zinc-600">Email Address</p>
                  <p className="text-sm font-medium text-zinc-300 truncate">{candidate['Email Address'] || 'Not provided'}</p>
                </div>
              </div>
              <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                <FiPhone className="text-indigo-400 shrink-0" />
                <div>
                  <p className="text-[9px] font-black uppercase text-zinc-600">Phone Number</p>
                  <p className="text-sm font-medium text-zinc-300">{candidate['Phone Number'] || 'Not provided'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                  <FiMapPin className="text-indigo-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase text-zinc-600">Home Town</p>
                    <p className="text-sm font-medium text-zinc-300 truncate">{candidate['Home Town'] || 'N/A'}</p>
                  </div>
                </div>
                <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                  <FiBriefcase className="text-indigo-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase text-zinc-600">Experience</p>
                    <p className="text-sm font-medium text-zinc-300 truncate">
                      {candidate.isExp ? 'Experienced' : 'Fresher'}
                      {candidate.isExp && candidate['Experience duartion (in months)'] && ` • ${candidate['Experience duartion (in months)']} Months`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pipeline Progress */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Recruitment Pipeline</h3>
              <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                candidate.status === 'Selected' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                candidate.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {candidate.status}
              </div>
            </div>
            
            <div className="space-y-2">
              {stages.map((stage, idx) => {
                const statusRaw = (candidate[stage.field] || "").toString().toLowerCase();
                const isSelected = statusRaw === 'selected';
                const isRejected = statusRaw === 'rejected';
                const isPending = !isSelected && !isRejected;
                const displayStatus = isSelected ? "Selected" : (isRejected ? "Rejected" : "Pending");

                return (
                  <div 
                    key={idx}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      isSelected ? 'bg-emerald-500/5 border-emerald-500/10' :
                      isRejected ? 'bg-rose-500/5 border-rose-500/10' :
                      'bg-white/2 border-white/5'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stage.bg} ${stage.color}`}>
                      <stage.icon size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">{stage.label}</p>
                      <h4 className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : isRejected ? 'text-rose-400' : 'text-zinc-400'}`}>
                        {displayStatus}
                      </h4>
                    </div>
                    {isSelected && <FiCheckCircle className="text-emerald-500" />}
                    {isRejected && <FiXCircle className="text-rose-500" />}
                    {isPending && <FiClock className="text-amber-500" />}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Additional Metadata */}
          <section className="space-y-4 pb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Interview Context</h3>
            <div className="bg-[#0d1117] border border-white/5 rounded-3xl p-6 space-y-4">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase text-zinc-600 mb-1">Role Applied For</p>
                  <p className="text-xs font-bold text-white">{candidate['Role Applied For?']}</p>
                </div>
                {candidate['Final Role'] && (
                  <div>
                    <p className="text-[9px] font-black uppercase text-zinc-600 mb-1">Final Allotted Role</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                      <FiAward className="text-indigo-400" size={12} />
                      <p className="text-xs font-black text-indigo-400 uppercase tracking-wider">{candidate['Final Role']}</p>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-zinc-600 mb-1">Interviewer Comments</p>
                <p className="text-xs font-medium text-zinc-400 leading-relaxed italic">
                  "{candidate['L1 Comments'] || candidate['L2Comments'] || candidate['Comments'] || 'No internal notes recorded yet for this candidate.'}"
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default CandidateDrawer;
