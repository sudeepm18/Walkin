import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { syncCandidates } from '../services/syncService';

const CandidateContext = createContext();

export const useCandidates = () => {
  const context = useContext(CandidateContext);
  if (!context) throw new Error('useCandidates must be used within a CandidateProvider');
  return context;
};

export const CandidateProvider = ({ children }) => {
  const [candidates, setCandidates] = useState([]);
  const [lastSync, setLastSync] = useState(localStorage.getItem('walkin_last_sync') || '');
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshCandidates = useCallback(async () => {
    const url = localStorage.getItem('walkin_sheet_url');
    if (!url) return;
    
    setIsSyncing(true);
    try {
      const data = await syncCandidates(url);
      setCandidates(data);
      const time = new Date().toLocaleTimeString();
      setLastSync(time);
      localStorage.setItem('walkin_last_sync', time);
      return data;
    } catch (err) {
      console.error("[Context] Sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    // Try to bootstrap from a temporary session cache if available, 
    // but the Source of Truth remains the refresh function.
    const cached = localStorage.getItem('walkin_candidates');
    if (cached) setCandidates(JSON.parse(cached));
    
    refreshCandidates();
  }, [refreshCandidates]);

  // Sync to localStorage as cache
  useEffect(() => {
    if (candidates.length > 0) {
      localStorage.setItem('walkin_candidates', JSON.stringify(candidates));
    }
  }, [candidates]);

  const sheetUrl = localStorage.getItem('walkin_sheet_url') || '';

  return (
    <CandidateContext.Provider value={{ 
      candidates, 
      setCandidates, 
      lastSync, 
      isSyncing, 
      refreshCandidates,
      sheetUrl
    }}>
      {children}
    </CandidateContext.Provider>
  );
};
