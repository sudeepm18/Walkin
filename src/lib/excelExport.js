import * as XLSX from 'xlsx';

/**
 * Exports candidate data to an Excel file (.xlsx)
 * @param {Array} candidates - Array of candidate objects
 */
export const exportCandidatesToExcel = (candidates) => {
  if (!candidates || candidates.length === 0) {
    console.warn("No candidates to export");
    return;
  }

  // Comprehensive list of headers as used in the data objects
  const headers = [
    "ID",
    "Name",
    "Email Address",
    "Phone Number",
    "Home Town",
    "Gender",
    "Role Applied For?",
    "Have a relevent work experience before?",
    "Orientation(Agree & Disagree)",
    "GD Status",
    "GD Score",
    "Aptitude Status",
    "Aptitude SET",
    "Aptitude Marks",
    "L1(selected /Rejected)",
    "L1 Interviewer Name",
    "L1 Score",
    "L1 Comments",
    "L2(Selected /Rejected)",
    "L2 Interviewer Name",
    "L2 Score",
    "L2Comments",
    "HR Round Status",
    "HR Interviewer Name",
    "Final Role"
  ];

  // Map candidates to rows based on headers
  const data = candidates.map(cand => {
    const row = {};
    headers.forEach(header => {
      // Ensure we use the exact key mapping as used in the app
      row[header] = cand[header] || "";
    });
    return row;
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
  
  // Create workbook and append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");

  // Generate filename with current date
  const date = new Date().toISOString().split('T')[0];
  const filename = `Walkin_Candidates_${date}.xlsx`;

  // Write and download the file
  XLSX.writeFile(workbook, filename);
};
