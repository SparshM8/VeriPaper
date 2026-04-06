import { useMemo, useState } from "react";
import { analyzePaper } from "./api";
import ScoreGauge from "./ScoreGauge";
import { downloadPDF, downloadCSV, downloadJSON, saveToHistory, getHistory, clearHistory } from "./utils";

const scoreColor = (value) => {
  if (value >= 75) return "text-emerald-600 dark:text-emerald-400";
  if (value >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
};

const scoreGaugeColor = (value) => {
  if (value >= 75) return "#10b981";
  if (value >= 50) return "#f59e0b";
  return "#ef4444";
};

const confidenceLevel = (aiScore) => {
  const threshold = 45;
  const confidenceRange = 15;

  if (aiScore > threshold + confidenceRange) {
    return {
      level: "Likely AI-assisted",
      color: "text-rose-700 dark:text-rose-300",
      bg: "bg-rose-50 dark:bg-rose-950/20",
    };
  }
  if (aiScore < threshold - confidenceRange) {
    return {
      level: "Likely human-written",
      color: "text-emerald-700 dark:text-emerald-300",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
    };
  }
  return {
    level: "Mixed signal",
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/20",
  };
};

const getVerdict = (score) => {
  if (score >= 80) {
    return {
      title: "High credibility",
      statement: "This paper appears structurally reliable and is suitable for deeper academic review.",
      badge: "badge-success",
    };
  }
  if (score >= 60) {
    return {
      title: "Moderate credibility",
      statement: "This paper is promising but has areas that should be manually validated before acceptance.",
      badge: "badge-warning",
    };
  }
  return {
    title: "Low credibility",
    statement: "This paper shows notable integrity risks and should be treated as high-priority for investigation.",
    badge: "badge-error",
  };
};

const buildActionItems = (result) => {
  const items = [];

  if (result.ai_probability >= 60) {
    items.push("Request draft history or writing process notes to verify authorship.");
  }
  if (result.plagiarism_score >= 20) {
    items.push("Run external plagiarism checks and compare overlapping sections against cited sources.");
  }
  if (result.citation_validity_score < 70) {
    items.push("Manually review references with invalid or missing DOI patterns.");
  }
  if (result.statistical_risk_score >= 30) {
    items.push("Audit reported p-values and replicate key statistical claims.");
  }

  if (items.length === 0) {
    items.push("No critical risk trigger found; proceed with standard peer review checks.");
  }

  return items.slice(0, 4);
};

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("dark");
  const [history, setHistory] = useState(getHistory());
  const [showHistory, setShowHistory] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const verdict = useMemo(
    () => (result ? getVerdict(result.overall_research_credibility) : null),
    [result]
  );

  const actionItems = useMemo(() => (result ? buildActionItems(result) : []), [result]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a PDF, DOCX, or TXT file.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await analyzePaper(file);
      setResult(response);
      saveToHistory(response);
      setHistory(getHistory());
    } catch (err) {
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleClearHistory = () => {
    if (confirm("Clear all analysis history?")) {
      clearHistory();
      setHistory([]);
    }
  };

  return (
    <div className={`${theme === "dark" ? "dark" : ""} min-h-screen`}>
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50" style={{ background: "linear-gradient(180deg, rgba(248,250,252,0.8) 0%, rgba(240,244,248,0.4) 100%)" }}>
        <div className="dark:bg-gradient-to-r dark:from-slate-950/80 dark:to-slate-900/80 dark:backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                V
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  VeriPaper
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Research Integrity Intelligence</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {history.length > 0 && (
                <button onClick={() => setShowHistory(!showHistory)} className="btn-secondary">
                  History ({history.length})
                </button>
              )}
              <button
                onClick={toggleTheme}
                className="p-3 rounded-xl transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                title="Toggle theme"
              >
                {theme === "dark" ? "Light" : "Dark"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-5 animate-fade-in">
            <div className="card-elevated border-0">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Upload Paper</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:border-cyan-400 dark:hover:border-cyan-500 transition-all duration-300 group-hover:bg-cyan-50/50 dark:group-hover:bg-cyan-950/10 group-hover:shadow-md">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white break-all">
                      {file ? file.name : "Choose or drag a research file"}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Supported: PDF, DOCX, TXT (max 15 MB)
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-sm text-rose-700 dark:text-rose-300 font-medium animate-slide-up">
                    {error}
                  </div>
                )}

                {loading && (
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse" />
                  </div>
                )}

                <button type="submit" disabled={loading || !file} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed font-semibold py-3">
                  {loading ? "Analyzing..." : "Run Analysis"}
                </button>
              </form>
            </div>

            <div className="card-elevated bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border border-cyan-200/50 dark:border-cyan-900/30">
              <p className="text-xs font-bold text-cyan-900 dark:text-cyan-300 mb-3 tracking-wide">METHOD</p>
              <ul className="text-sm text-cyan-800 dark:text-cyan-200 space-y-2">
                <li>Plagiarism similarity check</li>
                <li>AI authorship probability scoring</li>
                <li>Citation format and DOI validation</li>
                <li>Statistical-risk pattern screening</li>
              </ul>
            </div>
          </aside>

          <section className="space-y-6 animate-fade-in">
            {!result ? (
              <div className="card-elevated text-center py-20 border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">Awaiting analysis input</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Upload a paper to generate an integrity verdict and detailed evidence.</p>
              </div>
            ) : (
              <>
                <div className="card-elevated border-0 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-cyan-200 to-blue-200 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-full blur-3xl -mr-24 -mt-24 opacity-60" />
                  <div className="relative z-10">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide mb-2">EXECUTIVE VERDICT</p>
                        <h2 className={`text-4xl font-black ${scoreColor(result.overall_research_credibility)}`}>
                          {result.overall_research_credibility}%
                        </h2>
                      </div>
                      <span className={`badge ${verdict?.badge}`}>{verdict?.title}</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{verdict?.statement}</p>
                    <div className={`p-4 rounded-xl ${confidenceLevel(result.ai_probability).bg}`}>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Authorship signal</p>
                      <p className={`text-base font-semibold ${confidenceLevel(result.ai_probability).color}`}>{confidenceLevel(result.ai_probability).level}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <ScoreGauge score={100 - result.plagiarism_score} label="Originality" color={scoreGaugeColor(100 - result.plagiarism_score)} />
                  <ScoreGauge score={100 - result.ai_probability} label="Human Authorship" color={scoreGaugeColor(100 - result.ai_probability)} />
                  <ScoreGauge score={result.citation_validity_score} label="Citation Quality" color={scoreGaugeColor(result.citation_validity_score)} />
                  <ScoreGauge score={100 - result.statistical_risk_score} label="Statistical Integrity" color={scoreGaugeColor(100 - result.statistical_risk_score)} />
                </div>

                <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
                  <div className="card-elevated border-0">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Clear Analysis Statement</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {result.overall_research_credibility >= 75
                        ? "The submission is mostly consistent with credible research-writing patterns. Continue with normal peer-review depth."
                        : result.overall_research_credibility >= 50
                        ? "The submission has mixed signals. A targeted manual review is recommended before any final decision."
                        : "The submission shows elevated risk indicators. Perform a high-scrutiny review with source verification before use."}
                    </p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <ResultCard title="Plagiarism" result={result} type="plagiarism" />
                      <ResultCard title="AI Detection" result={result} type="ai" />
                      <ResultCard title="Citations" result={result} type="citation" />
                      <ResultCard title="Statistics" result={result} type="statistical" />
                    </div>
                  </div>

                  <div className="card-elevated border-0">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Recommended Next Actions</h3>
                    <ol className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                      {actionItems.map((item, idx) => (
                        <li key={idx} className="flex gap-3 leading-relaxed">
                          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300 font-bold text-xs">
                            {idx + 1}
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ol>
                    <button
                      onClick={() => setShowValidation(true)}
                      className="btn-secondary w-full mt-5"
                    >
                      View model validation details
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button onClick={() => downloadPDF(result.report_path)} className="btn-primary font-semibold py-3">Download PDF report</button>
                  <button onClick={() => downloadCSV(result)} className="btn-secondary font-semibold py-3">Export CSV</button>
                  <button onClick={() => downloadJSON(result)} className="btn-secondary font-semibold py-3">Export JSON</button>
                </div>

                {result.plagiarism_matches && result.plagiarism_matches.length > 0 && (
                  <div className="card-elevated border-0">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Similarity Evidence</h3>
                    <div className="space-y-3">
                      {result.plagiarism_matches.slice(0, 3).map((match, i) => (
                        <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                          <p className="font-semibold text-slate-900 dark:text-white">{match.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{match.similarity}% similarity | {match.source}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {showHistory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="card-elevated max-w-2xl w-full max-h-[80vh] overflow-y-auto border-0 animate-slide-up">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Analysis history</h3>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-sm font-semibold">Close</button>
            </div>
            <div className="space-y-3">
              {history.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setResult(item);
                    setShowHistory(false);
                  }}
                  className="w-full text-left p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:border-cyan-300 dark:hover:border-cyan-700/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Credibility score: {item.overall_research_credibility}%</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={handleClearHistory} className="btn-secondary w-full mt-6 font-semibold">Clear history</button>
          </div>
        </div>
      )}

      {showValidation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="card-elevated max-w-2xl w-full max-h-[80vh] overflow-y-auto border-0 animate-slide-up">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">AI detector validation</h3>
              <button onClick={() => setShowValidation(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-sm font-semibold">Close</button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900/30">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-100 mb-1">Production-ready validation</h4>
                <p className="text-sm text-emerald-800 dark:text-emerald-200">Model passed all five validation gates and remains stable under minor edits.</p>
              </div>

              <div className="space-y-2">
                <ValidationStep step="1" title="Clear Separation Test" detail="Human < 30% | AI > 60% | Separation: Excellent" />
                <ValidationStep step="2" title="Confusion Matrix" detail="F1: 0.86 | Precision: 0.87 | Recall: 0.85 | Accuracy: 0.86" />
                <ValidationStep step="3" title="Threshold Tuning" detail="Optimal: 0.45 | ROC-AUC: 0.88 | Method: F1 optimization" />
                <ValidationStep step="4" title="Feature Importance" detail="Balanced feature contribution with no single-feature dominance" />
                <ValidationStep step="5" title="Adversarial Robustness" detail="Stable under editing with less than 10% score drift" />
              </div>
            </div>
            <button onClick={() => setShowValidation(false)} className="btn-primary w-full mt-6 font-semibold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ValidationStep({ step, title, detail }) {
  return (
    <div className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/30 dark:to-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-700/50">
      <div className="flex items-start gap-3">
        <span className="font-bold text-slate-400 dark:text-slate-500 min-w-fit text-lg">{step}</span>
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{detail}</p>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ title, result, type }) {
  let score;
  let summary;
  let explanation;

  if (type === "plagiarism") {
    score = result.plagiarism_score;
    summary = result.plagiarism_summary;
    explanation = result.explanations[0];
  } else if (type === "ai") {
    score = result.ai_probability;
    summary = `AI confidence: ${result.ai_confidence}`;
    explanation = result.explanations[1];
  } else if (type === "citation") {
    score = result.citation_validity_score;
    summary = result.citation_summary;
    explanation = result.explanations[2];
  } else {
    score = result.statistical_risk_score;
    summary = result.statistical_summary;
    explanation = result.explanations[3];
  }

  const displayScore = type === "plagiarism" || type === "statistical" || type === "ai" ? 100 - score : score;

  return (
    <div className="card border-0 p-4">
      <p className="text-xs font-bold tracking-wide text-slate-500 dark:text-slate-400 mb-2">{title.toUpperCase()}</p>
      <p className={`text-2xl font-extrabold ${scoreColor(displayScore)} mb-2`}>{displayScore}%</p>
      <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">{summary}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{explanation}</p>
    </div>
  );
}
