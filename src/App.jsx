import { useEffect } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { syncCandidates } from "./services/syncService";
import Home from "./components/home";
import Dashboard from "./components/dashboard";
import UpdateCandidate from "./components/updatecandidate";
import AddCandidate from "./components/addcandidate";
import ManageCandidates from "./components/managecandidates";
import PreScreen from "./components/prescreen";
import AddInterviewer from "./components/addinterviewer";

function App() {
  // Automatic background sync management
  useEffect(() => {
    const performSync = async () => {
      const sheetUrl = localStorage.getItem('walkin_sheet_url');
      if (!sheetUrl) return;

      console.log("[App] Background sync starting...");
      window.dispatchEvent(new Event('sync-start')); 
      try {
        await syncCandidates(sheetUrl);
        // Dispatch event so Dashboard/PreScreen components refresh their UI
        window.dispatchEvent(new Event('sync-complete'));
        console.log("[App] Background sync completed.");
      } catch (error) {
        console.error("[App] Background sync failed:", error);
        window.dispatchEvent(new Event('sync-complete')); // Clear loading state even on error
      }
    };
    
    // Initial sync on app load
    performSync();

    // Periodic sync every 1 minute (60000ms) for tighter updates
    const interval = setInterval(performSync, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#05070a]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/update-candidate" element={<UpdateCandidate />} />
          <Route path="/add-candidate" element={<AddCandidate />} />
          <Route path="/manage" element={<ManageCandidates />} />
          <Route path="/pre-screen" element={<PreScreen />} />
          <Route path="/add-interviewer" element={<AddInterviewer />} />
          {/* Add other routes as they get implemented */}
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
