import { useState, useEffect, useContext } from 'react';
import { FiLayout, FiGlobe, FiCpu, FiEdit3, FiShare2, FiLayers, FiCheckCircle, FiAlertTriangle, FiClock, FiChevronRight } from 'react-icons/fi';
import FeatureCard from './FeatureCard';
import logo from '../assets/logo.png';
import { UserContext } from '../API/UserContext';
import DomoApi from '../API/domoAPI';

const Home = () => {
  const { email, currentUser } = useContext(UserContext);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const adminEmails = ["sudip.shankar@gwcdata.ai", "pugal.manivelan@gwcteq.com"];

  useEffect(() => {
    const checkAccess = async () => {
      console.log("Identity Check:", { email, currentUser, adminEmails });
      // Grant full access ONLY if email matches one of the hardcoded admins
      if (adminEmails.includes(email)) {
        setIsAuthorized(true);
        return;
      }

      try {
        const authDocs = await DomoApi.ListDocuments('Authorised_users');
        const authorized = authDocs?.some(doc => doc.content.email === email);
        setIsAuthorized(authorized);
      } catch (error) {
        console.error("Error checking access:", error);
      }
    };

    if (email) {
      checkAccess();
    }
  }, [email]);

  const allFeatures = [
    {
      title: "Add Candidate",
      description: "Connect external data sources (Google Form / Sheet) to automate candidate ingestion and synchronize walk-in data.",
      icon: FiGlobe,
      iconBg: "bg-emerald-600",
      dotColor: "bg-emerald-400",
      link: "/add-candidate"
    },
    {
      title: "Add Interviewer",
      description: "Onboard new technical panel members and map their expertise for efficient interview scheduling.",
      icon: FiCpu,
      iconBg: "bg-orange-600",
      dotColor: "bg-orange-400",
      link: "/add-interviewer"
    },
    {
      title: "Pre Screen",
      description: "Bulk manage orientation, GD, and aptitude stages for walk-in candidates.",
      icon: FiLayers,
      iconBg: "bg-indigo-600",
      dotColor: "bg-indigo-400",
      link: "/pre-screen"
    },
    {
      title: "Dashboard",
      description: "Monitor live walk-in metrics, track candidate pipeline, and manage interview rounds in real-time.",
      icon: FiLayout,
      iconBg: "bg-blue-600",
      dotColor: "bg-blue-400",
      link: "/dashboard"
    }
  ];

  const features = allFeatures.map(f => ({
    ...f,
    disabled: !isAuthorized && (f.title === "Add Candidate" || f.title === "Add Interviewer")
  }));

  const guidelines = [
    {
      icon: FiCheckCircle,
      color: "text-emerald-400",
      borderColor: "border-emerald-500/20",
      bgColor: "bg-emerald-500/5",
      title: "Registration",
      points: [
        "Capture data via connected Google forms.",
        "Verify sync status after each batch.",
        "Remove duplicates regularly."
      ]
    },
    {
      icon: FiAlertTriangle,
      color: "text-amber-400",
      borderColor: "border-amber-500/20",
      bgColor: "bg-amber-500/5",
      title: "Process",
      points: [
        "Assign interviewers before L1/L2.",
        "Update status promptly after rounds.",
        "Use Pre-Screen for bulk processing."
      ]
    },
    {
      icon: FiClock,
      color: "text-indigo-400",
      borderColor: "border-indigo-500/20",
      bgColor: "bg-indigo-500/5",
      title: "Data & Sync",
      points: [
        "Data syncs to sheet in real-time.",
        "Check Dashboard for retry options.",
        "All timestamps recorded in IST."
      ]
    }
  ];

  return (
    <div className="min-h-screen w-full bg-transparent text-white flex flex-col items-center px-4 sm:px-6 py-10 sm:py-16 relative overflow-x-hidden font-sans">
      {/* Background Logo Overlay */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
        <img
          src={logo}
          alt="Centric Background Logo"
          className="w-[90%] sm:w-[70%] max-w-[550px] object-contain opacity-[0.1] scale-110"
        />
      </div>

      {/* Enhanced Badge */}
      <div className="z-10 bg-white/5 border border-white/10 px-6 sm:px-8 py-3 rounded-full mb-6 flex items-center gap-3 sm:gap-4 backdrop-blur-2xl">
        <div className="relative flex items-center justify-center shrink-0">
          <img src={logo} className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
          <div className="absolute inset-0 blur-md bg-indigo-500/20" />
        </div>
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-white/90">
          GWC DATA.AI <span className="text-indigo-400 hidden xs:inline">PORTAL</span>
        </span>
      </div>

      {/* Hero Section */}
      <div className="z-10 text-center max-w-4xl mb-12 px-4 relative">
        <h1 className="text-xl sm:text-3xl md:text-5xl font-[1000] mb-5 text-white tracking-tight leading-[1.1] whitespace-nowrap">
          Seamless <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">Recruitment</span> Management
        </h1>
        <p className="text-zinc-500 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-medium">
          Empower your HR team with a high-performance tool built for high-volume walk-in drives. Track everything from GD to Offer.
        </p>
      </div>

      {/* Features Grid */}
      <div className="z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-[1400px] mx-auto mb-20 px-2 lg:px-4">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>

      {/* Operational Guidelines Section */}
      <div className="z-10 w-full max-w-[1200px] mx-auto px-2 pb-20">
        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 mb-8 px-4">
          Guidelines
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {guidelines.map((guide, index) => (
            <div key={index} className={`bg-white/1 backdrop-blur-xs border ${guide.borderColor} rounded-[24px] p-6 transition-all hover:bg-white/2`}>
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-xl ${guide.bgColor} flex items-center justify-center shrink-0`}>
                  <guide.icon className={`w-5 h-5 ${guide.color}`} />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">{guide.title}</h3>
              </div>
              <ul className="space-y-4">
                {guide.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <FiChevronRight className={`w-3 h-3 ${guide.color} mt-1 shrink-0`} />
                    <span className="text-zinc-400 text-[12px] leading-snug font-medium">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <footer className="z-10 mt-auto py-8 text-center border-t border-white/5 w-full">
        <p className="text-zinc-500 text-[9px] font-black tracking-[0.4em] uppercase ">
          Powered by <span className="text-white">GWC DATA.AI</span>
        </p>
      </footer>
    </div>
  );
};

export default Home;
