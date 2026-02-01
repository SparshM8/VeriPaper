/**
 * Download PDF report from the backend
 */
export function downloadPDF(reportPath) {
  if (!reportPath) {
    alert("No PDF report available.");
    return;
  }
  const filename = `VeriPaper_Report_${new Date().toISOString().split("T")[0]}.pdf`;
  const link = document.createElement("a");
  link.href = reportPath;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export analysis results as CSV
 */
export function downloadCSV(result) {
  const headers = ["Metric", "Score", "Details"];
  
  const rows = [
    ["Overall Research Credibility", `${result.overall_research_credibility}%`, ""],
    ["Plagiarism Score", `${result.plagiarism_score}%`, result.plagiarism_summary],
    ["AI-Generated Probability", `${result.ai_probability}%`, `Confidence: ${result.ai_confidence}`],
    ["Citation Validity", `${result.citation_validity_score}%`, result.citation_summary],
    ["Statistical Risk", `${result.statistical_risk_score}%`, result.statistical_summary],
    ["", "", ""],
    ["Invalid DOIs Found", result.citation_invalid_dois?.length || 0, result.citation_invalid_dois?.join("; ") || ""],
    ["Missing DOIs", result.citation_missing_dois?.length || 0, ""],
    ["Year Mismatches", result.citation_year_mismatches?.length || 0, result.citation_year_mismatches?.join("; ") || ""],
    ["Top Plagiarism Match", result.plagiarism_matches?.[0]?.similarity + "%" || "N/A", result.plagiarism_matches?.[0]?.title || ""],
  ];

  const csv = [
    headers.join(","),
    ...rows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
  ].join("\n");

  const filename = `VeriPaper_Analysis_${new Date().toISOString().split("T")[0]}.csv`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Export analysis results as JSON
 */
export function downloadJSON(result) {
  const filename = `VeriPaper_Analysis_${new Date().toISOString().split("T")[0]}.json`;
  const json = JSON.stringify(result, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Save analysis result to localStorage history
 */
export function saveToHistory(result) {
  try {
    const history = getHistory();
    const entry = {
      ...result,
      timestamp: new Date().toISOString(),
      id: `analysis_${Date.now()}`
    };
    const updated = [entry, ...history].slice(0, 10);
    localStorage.setItem("veripaper_history", JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save history:", e);
  }
}

/**
 * Get all history entries from localStorage
 */
export function getHistory() {
  try {
    const stored = localStorage.getItem("veripaper_history");
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse history:", e);
    return [];
  }
}

/**
 * Clear entire history from localStorage
 */
export function clearHistory() {
  try {
    localStorage.removeItem("veripaper_history");
  } catch (e) {
    console.error("Failed to clear history:", e);
  }
}

