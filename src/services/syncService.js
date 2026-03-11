import Papa from 'papaparse';

/**
 * Converts a Google Sheets URL to a CSV export URL.
 */
const getCsvUrl = (url) => {
  if (!url) return '';
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    const gidMatch = url.match(/[#&]gid=([0-9]+)/);
    const base = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
    return gidMatch ? `${base}&gid=${gidMatch[1]}` : base;
  }
  return url;
};

/**
 * Fetches and parses data from a Google Spreadsheet.
 */
export const fetchSpreadsheetData = async (url) => {
  const csvUrl = getCsvUrl(url);
  
  return new Promise((resolve, reject) => {
    Papa.parse(csvUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error('PapaParse Errors:', results.errors);
        }
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

/**
 * Synchronizes spreadsheet data with local storage.
 */
export const syncCandidates = async (url) => {
  try {
    const freshData = await fetchSpreadsheetData(url);
    
    const existingCandidatesStr = localStorage.getItem('walkin_candidates');
    const existingCandidates = existingCandidatesStr ? JSON.parse(existingCandidatesStr) : [];
    
    const statusFields = [
      'Orientation(Agree & Disagree)', 'GD Status', 'Aptitude Status', 
      'L1(selected /Rejected)', 'L2(Selected /Rejected)', 'HR Round Status'
    ];

    const mergedData = freshData.map(newCand => {
      const existingCand = existingCandidates.find(c => String(c.ID) === String(newCand.ID));
      
      let merged = existingCand ? { ...existingCand, ...newCand } : { ...newCand };

      // Ensure all status fields default to 'Pending' if currently empty/missing
      statusFields.forEach(field => {
        if (!merged[field] || merged[field].trim() === "") {
          merged[field] = 'Pending';
        }
      });

      if (existingCand) {
        // Carry over existing values if newCand field is empty (to avoid overwriting progress if sync is partial)
        statusFields.forEach(field => {
          if (!newCand[field] && existingCand[field]) {
            merged[field] = existingCand[field];
          }
        });
        
        // Ensure specific metadata also carries over if missing in sync
        const metaFields = [
          'Aptitude SET', 'Aptitude Marks', 'L1 Interviewer Name', 
          'L1 Comments', 'L2 Interviewer Name', 'L2Comments', 
          'Final Role', 'HR Interviewer Name'
        ];
        metaFields.forEach(field => {
          if (!newCand[field] && existingCand[field]) {
            merged[field] = existingCand[field];
          }
        });
      }
      
      return merged;
    });

    localStorage.setItem('walkin_candidates', JSON.stringify(mergedData));
    localStorage.setItem('walkin_sheet_url', url);
    return mergedData;
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
};

/**
 * Synchronizes interviewer data with local storage.
 */
export const syncInterviewers = async (url) => {
  try {
    const freshData = await fetchSpreadsheetData(url);
    
    // Strict verification - Interviewers must have 'Round' or 'Skill' columns to distinguish from candidates
    const validData = freshData.filter(i => {
      const hasIdentity = i.Name || i.name;
      const hasInterviewerMeta = i.Round || i.round || i.Skill || i.skill || i.Branch || i.branch;
      return hasIdentity && hasInterviewerMeta && !i.ID; // Candidates have ID, Interviewers don't in the provided spec
    });
    
    const formattedData = validData.map(i => ({
      id: Date.now() + Math.random(), 
      name: i.Name || i.name || "Unknown",
      phone: i.Phone || i.phone || i['Phone Number'] || "",
      skill: i.Skill || i.skill || i['Role Applied For?'] || "General",
      branch: i.Branch || i.branch || i['Home Town'] || "N/A",
      round: i.Round || i.round || "L1"
    }));

    localStorage.setItem('walkin_interviewers', JSON.stringify(formattedData));
    return formattedData;
  } catch (error) {
    console.error('Interviewer Sync failed:', error);
    throw error;
  }
};

/**
 * Pushes candidate updates to Google Spreadsheet via Apps Script Web App.
 * 
 * Uses navigator.sendBeacon as PRIMARY method because:
 * - It works at the browser's network level (bypasses CORS entirely)
 * - It correctly handles Google's 302 redirect
 * - The POST body is preserved through the redirect
 * - It's designed for sending analytics/data to servers
 * 
 * Falls back to fetch with no-cors if sendBeacon is unavailable.
 */
export const pushToGoogleSheet = async (scriptUrl, data) => {
  if (!scriptUrl) throw new Error("No Script URL provided");
  
  const payload = Array.isArray(data) ? data : [data];
  const jsonStr = JSON.stringify(payload);
  
  console.log("[SyncEngine] === PUSH START ===");
  console.log("[SyncEngine] URL:", scriptUrl);
  console.log("[SyncEngine] Candidates:", payload.length);
  console.log("[SyncEngine] Payload size:", jsonStr.length, "bytes");
  console.log("[SyncEngine] First ID:", payload[0]?.ID);
  console.log("[SyncEngine] GD Status:", payload[0]?.['GD Status']);
  console.log("[SyncEngine] Fields:", Object.keys(payload[0] || {}).slice(0, 15));
  console.log("[SyncEngine] Applied For:", payload[0]?.['Role Applied For?']);
  console.log("[SyncEngine] Final Role:", payload[0]?.['Final Role']);
  
  // Strategy 1: navigator.sendBeacon (most reliable for Google Apps Script)
  if (navigator.sendBeacon) {
    const blob = new Blob([jsonStr], { type: 'text/plain;charset=utf-8' });
    const sent = navigator.sendBeacon(scriptUrl, blob);
    console.log("[SyncEngine] sendBeacon:", sent ? "QUEUED OK" : "REJECTED");
    if (sent) {
      console.log("[SyncEngine] === PUSH COMPLETE (sendBeacon) ===");
      return { status: "success", msg: "Data sent via sendBeacon" };
    }
  }
  
  // Strategy 2: fetch with no-cors (fallback)
  try {
    await fetch(scriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: jsonStr,
    });
    console.log("[SyncEngine] === PUSH COMPLETE (fetch) ===");
    return { status: "success", msg: "Data pushed via fetch" };
  } catch (err) {
    console.error("[SyncEngine] === PUSH FAILED ===", err);
    throw err;
  }
};

/**
 * Updates a specific candidate in the local store.
 */
export const updateCandidateLocally = (id, updates) => {
  const existingCandidatesStr = localStorage.getItem('walkin_candidates');
  if (!existingCandidatesStr) return;
  
  const candidates = JSON.parse(existingCandidatesStr);
  const updatedCandidates = candidates.map(c => {
    if (String(c.ID) === String(id)) {
      return { ...c, ...updates };
    }
    return c;
  });
  
  localStorage.setItem('walkin_candidates', JSON.stringify(updatedCandidates));
  return updatedCandidates;
};

/**
 * Updates multiple candidates in the local store in a single operation.
 */
export const updateCandidatesLocallyBulk = (ids, updates) => {
  const existingCandidatesStr = localStorage.getItem('walkin_candidates');
  if (!existingCandidatesStr) return;
  
  const idSet = new Set(ids.map(id => String(id)));
  const candidates = JSON.parse(existingCandidatesStr);
  
  const updatedCandidates = candidates.map(c => {
    if (idSet.has(String(c.ID))) {
      return { ...c, ...updates };
    }
    return c;
  });
  
  localStorage.setItem('walkin_candidates', JSON.stringify(updatedCandidates));
  return updatedCandidates;
};
