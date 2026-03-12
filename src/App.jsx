import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { CandidateProvider } from "./context/CandidateContext";
import Home from "./components/home";
import Dashboard from "./components/dashboard";
import UpdateCandidate from "./components/updatecandidate";
import AddCandidate from "./components/addcandidate";
import ManageCandidates from "./components/managecandidates";
import PreScreen from "./components/prescreen";
import AddInterviewer from "./components/addinterviewer";

function App() {
  return (
    <CandidateProvider>
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
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </Router>
    </CandidateProvider>
  );
}

export default App;
