import { useMemo, useState } from "react";
import { analyzePaper } from "./api";
import { downloadPDF, downloadCSV, downloadJSON, saveToHistory, getHistory, clearHistory } from "./utils";

// Confidence Level Indicator
const confidenceLevel = (aiScore) => {
  const threshold = 45;
  const confidenceRange = 15;

  if (aiScore > threshold + confidenceRange) {
    return {
      level: "Likely AI-assisted",
      color: "text-red-700",
      bg: "bg-red-50",
      badgeColor: "bg-red-100 text-red-800",
    };
  }
  if (aiScore < threshold - confidenceRange) {
    return {
      level: "Likely human-written",
      color: "text-green-700",
      bg: "bg-green-50",
      badgeColor: "bg-green-100 text-green-800",
    };
  }
  return {
    level: "Mixed signal",
    color: "text-amber-700",
    bg: "bg-amber-50",
    badgeColor: "bg-amber-100 text-amber-800",
  };
};

const getVerdict = (score) => {
  if (score >= 80) {
    return {
      title: "High Credibility",
      statement: "This paper appears structurally reliable and is suitable for standard peer review.",
      badgeType: "success",
    };
  }
  if (score >= 60) {
    return {
      title: "Moderate Credibility",
      statement: "This paper shows promise but requires focused manual validation before acceptance.",
      badgeType: "warning",
    };
  }
  return {
    title: "Low Credibility",
    statement: "This paper exhibits elevated integrity risks and requires prioritized investigation.",
    badgeType: "error",
  };
};

const buildActionItems = (result) => {
  const items = [];

  if (result.ai_probability >= 60) {
    items.push("Request draft history or writing process notes to verify authorship.");
  }
  if (result.plagiarism_score >= 20) {
    items.push("Run external plagiarism checks on highlighted overlapping sections.");
  }
  if (result.citation_validity_score < 70) {
    items.push("Manually review flagged references with invalid or missing DOI patterns.");
  }
  if (result.statistical_risk_score >= 30) {
    items.push("Audit reported p-values and independently verify key statistical claims.");
  }

  if (items.length === 0) {
    items.push("No critical risk triggers detected; proceed with standard peer review.");
  }

  return items.slice(0, 4);
};

const summarizeMetric = (type, rawScore, aiConfidence) => {
  if (type === "plagiarism") {
    const originality = 100 - rawScore;
    if (originality >= 85) {
      return {
        label: "Originality",
        signal: "Strong",
        status: "safe",
        detail: "Low overlap detected across sections.",
        score: originality,
      };
    }
    if (originality >= 65) {
      return {
        label: "Originality",
        signal: "Moderate",
        status: "warning",
        detail: "Some overlapping patterns require source comparison.",
        score: originality,
      };
    }
    return {
      label: "Originality",
      signal: "Weak",
      status: "error",
      detail: "Substantial similarity signals suggest elevated reuse risk.",
      score: originality,
    };
  }

  if (type === "ai") {
    const humanLikelihood = 100 - rawScore;
    if (humanLikelihood >= 70) {
      return {
        label: "Authorship",
        signal: "Human",
        status: "safe",
        detail: `Low AI-likelihood patterns (${aiConfidence.toLowerCase()} confidence).`,
        score: humanLikelihood,
      };
    }
    if (humanLikelihood >= 50) {
      return {
        label: "Authorship",
        signal: "Mixed",
        status: "warning",
        detail: "Indicators suggest possible AI assistance.",
        score: humanLikelihood,
      };
    }
    return {
      label: "Authorship",
      signal: "AI-Likely",
      status: "error",
      detail: `High AI-likelihood patterns (${aiConfidence.toLowerCase()} confidence).`,
      score: humanLikelihood,
    };
  }

  if (type === "citation") {
    if (rawScore >= 80) {
      return {
        label: "Citations",
        signal: "Strong",
        status: "safe",
        detail: "References follow expected formatting standards.",
        score: rawScore,
      };
    }
    if (rawScore >= 60) {
      return {
        label: "Citations",
        signal: "Mixed",
        status: "warning",
        detail: "Citation consistency is moderate, manual review recommended.",
        score: rawScore,
      };
    }
    return {
      label: "Citations",
      signal: "Weak",
      status: "error",
      detail: "Multiple citation anomalies detected.",
      score: rawScore,
    };
  }

  const integrity = 100 - rawScore;
  if (integrity >= 80) {
    return {
      label: "Statistics",
      signal: "Stable",
      status: "safe",
      detail: "No major anomalies in statistical reporting patterns.",
      score: integrity,
    };
  }
  if (integrity >= 60) {
    return {
      label: "Statistics",
      signal: "Mixed",
      status: "warning",
      detail: "Some patterns merit focused methodology review.",
      score: integrity,
    };
  }
  return {
    label: "Statistics",
    signal: "Risk",
    status: "error",
    detail: "Detected patterns indicate elevated statistical integrity risk.",
    score: integrity,
  };
};

// Modern Score Card Component
function ScoreMetricCard({ metric, result, type }) {
  const data = summarizeMetric(type, metric.score, result.ai_confidence);
  
  const statusColors = {
    safe: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", dot: "bg-green-500" },
    warning: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
    error: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", dot: "bg-red-500" },
  };

  const colors = statusColors[data.status];

  return (
    <div className={`card ${colors.bg} ${colors.border}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
            {data.label}
          </p>
          <p className={`text-2xl font-bold ${colors.text}`}>{Math.round(data.score)}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} border ${colors.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></span>
          {data.signal}
        </span>
      </div>
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colors.dot.replace('bg-', 'bg-').replace('500', '400')}`}
          style={{ width: `${Math.min(100, data.score)}%`, background: colors.dot.replace('bg-', '') }}
        />
      </div>
      <p className="text-xs text-slate-600 mt-3">{data.detail}</p>
    </div>
  );
}

// Export default App
export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [history, setHistory] = useState(getHistory());
  const [showHistory, setShowHistory] = useState(false);

  const verdict = useMemo(
    () => (result ? getVerdict(result.overall_research_credibility) : null),
    [result]
  );

  const actionItems = useMemo(() => (result ? buildActionItems(result) : []), [result]);

  const metrics = useMemo(() => {
    if (!result) return [];
    return [
      { score: result.plagiarism_score, type: "plagiarism" },
      { score: result.ai_probability, type: "ai" },
      { score: result.citation_validity_score, type: "citation" },
      { score: result.statistical_risk_score, type: "statistical" },
    ];
  }, [result]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a file to analyze.");
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

  const handleClearHistory = () => {
    if (confirm("Clear all analysis history?")) {
      clearHistory();
      setHistory([]);
    }
  };

  const handleSubscribe = (event) => {
    event.preventDefault();
    if (!subscriberEmail.trim()) return;
    alert(`Subscription confirmed for ${subscriberEmail}`);
    setSubscriberEmail("");
  };

  const handleContactSubmit = (event) => {
    event.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;
    alert("Thank you for reaching out. Our team will respond within 24 hours.");
    setContactName("");
    setContactEmail("");
    setContactMessage("");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
              V
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">VeriPaper</h1>
              <p className="text-xs text-slate-500">Research Integrity Platform</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 text-sm">
            {["Overview", "Analysis", "About", "Premium", "Docs", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="btn-secondary text-xs sm:text-sm"
              >
                History {history.length > 0 && `(${history.length})`}
              </button>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section id="overview" className="section-container bg-gradient-to-br from-slate-50 via-white to-blue-50">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] items-center">
            <div className="animate-fade-in">
              <div className="inline-block mb-4">
                <span className="badge badge-info">✨ Welcome to VeriPaper</span>
              </div>
              <h2 className="section-title text-gradient">
                Research integrity, automated.
              </h2>
              <p className="section-subtitle mt-3">
                Detect plagiarism, AI-generated content, and statistical anomalies in academic papers with production-grade accuracy.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#analysis" className="btn-primary inline-flex items-center gap-2">
                  Start Analysis →
                </a>
                <a href="#docs" className="btn-secondary inline-flex items-center gap-2">
                  View Documentation
                </a>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6">
                <div>
                  <p className="text-2xl font-bold text-slate-900">4</p>
                  <p className="text-sm text-slate-600">Detection Methods</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">86%</p>
                  <p className="text-sm text-slate-600">Accuracy Rate</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">&lt;2s</p>
                  <p className="text-sm text-slate-600">Analysis Time</p>
                </div>
              </div>
            </div>

            <div className="animate-slide-up">
              <div className="card-gradient p-8 sm:p-12">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span>📄</span>
                    </div>
                    <div>
                      <p className="font-semibold">Smart Detection</p>
                      <p className="text-sm opacity-90 mt-1">Machine learning models trained on millions of research papers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span>⚡</span>
                    </div>
                    <div>
                      <p className="font-semibold">Lightning Fast</p>
                      <p className="text-sm opacity-90 mt-1">Get comprehensive results in seconds, not hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span>🔒</span>
                    </div>
                    <div>
                      <p className="font-semibold">Secure & Private</p>
                      <p className="text-sm opacity-90 mt-1">Your papers are never stored or shared</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Analysis Section */}
        <section id="analysis" className="section-container">
          <h2 className="section-title mb-2">Integrity Analysis Workspace</h2>
          <p className="section-subtitle mb-12">Upload your research paper and get instant integrity assessment results</p>

          <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
            {/* Upload Sidebar */}
            <aside className="space-y-6">
              <div className="card-elevated">
                <h3 className="font-bold text-slate-900 mb-6">Upload Paper</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative group cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all duration-200">
                      <p className="text-xl">📁</p>
                      <p className="font-medium text-slate-900 mt-2 text-sm break-all">
                        {file ? file.name : "Choose file"}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        PDF, DOCX, or TXT (max 15 MB)
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                      ⚠️ {error}
                    </div>
                  )}

                  {loading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Analyzing...</span>
                        <span>60%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill progress-warning" style={{ width: "60%" }} />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !file}
                    className="btn-primary w-full"
                  >
                    {loading ? "Analyzing..." : "Run Analysis"}
                  </button>
                </form>
              </div>

              {/* Detection Methods Info Card */}
              <div className="card bg-blue-50 border-blue-200">
                <p className="text-xs font-bold text-blue-900 mb-4 uppercase tracking-wider">Detection Methods</p>
                <ul className="space-y-3 text-sm text-blue-800">
                  {[
                    ["Plagiarism Check", "Similarity detection"],
                    ["AI Detection", "Authorship analysis"],
                    ["Citation Validation", "Reference quality"],
                    ["Statistical Risk", "Anomaly detection"],
                  ].map(([method, desc], i) => (
                    <li key={i} className="flex gap-3">
                      <span className="status-dot status-safe mt-1.5"></span>
                      <div>
                        <p className="font-medium">{method}</p>
                        <p className="text-xs opacity-80">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Results Panel */}
            <section className="space-y-8">
              {!result ? (
                <div className="card-elevated text-center py-16">
                  <div className="text-5xl mb-4">📊</div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Awaiting Analysis</h3>
                  <p className="text-slate-600">Upload a research paper to get started with integrity assessment</p>
                </div>
              ) : (
                <>
                  {/* Credibility Score Banner */}
                  <div className={`card-gradient relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-40 -mt-40" />
                    <div className="relative z-10">
                      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                        <div>
                          <p className="text-sm font-medium opacity-90 uppercase tracking-wider mb-2">
                            Research Credibility
                          </p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-black">
                              {result.overall_research_credibility}
                            </span>
                            <span className="text-2xl font-semibold opacity-90">%</span>
                          </div>
                          <p className="mt-6 text-lg opacity-95 max-w-lg">{verdict?.statement}</p>
                        </div>
                        <div className={`px-5 py-2 rounded-lg font-semibold text-sm uppercase tracking-wider ${
                          verdict?.badgeType === "success" ? "bg-green-500" : 
                          verdict?.badgeType === "warning" ? "bg-amber-500" : 
                          "bg-red-500"
                        } text-white opacity-90`}>
                          {verdict?.title}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {metrics.map((metric, i) => (
                      <ScoreMetricCard
                        key={i}
                        metric={metric}
                        result={result}
                        type={metric.type}
                      />
                    ))}
                  </div>

                  {/* Main Analysis Content */}
                  <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                    <div className="space-y-6">
                      {/* Authorship Signal */}
                      <div className="card">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-slate-900">Authorship Signal</h3>
                          <span className={`badge ${confidenceLevel(result.ai_probability).badgeColor}`}>
                            {confidenceLevel(result.ai_probability).level}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm">
                          {result.ai_probability >= 60
                            ? "This paper shows characteristics consistent with AI-assisted writing. Manual verification of methodology and originality is recommended."
                            : result.ai_probability < 40
                            ? "This paper demonstrates natural human writing patterns across all analyzed sections."
                            : "Authorship signals are balanced. Contextual review recommended."}
                        </p>
                      </div>

                      {/* Key Recommendations */}
                      <div className="card">
                        <h3 className="font-bold text-slate-900 mb-4">Recommended Actions</h3>
                        <ol className="space-y-3">
                          {actionItems.map((item, i) => (
                            <li key={i} className="flex gap-3 text-sm">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold flex-shrink-0 text-xs">
                                {i + 1}
                              </span>
                              <span className="text-slate-700 pt-0.5">{item}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Key Findings */}
                      {result.plagiarism_matches && result.plagiarism_matches.length > 0 && (
                        <div className="card">
                          <h3 className="font-bold text-slate-900 mb-4">Similarity Evidence</h3>
                          <div className="space-y-3">
                            {result.plagiarism_matches.slice(0, 3).map((match, i) => (
                              <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <p className="font-medium text-slate-900 text-sm">{match.title}</p>
                                <p className="text-xs text-slate-500 mt-2">
                                  {match.similarity}% similarity • {match.source}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Export Sidebar */}
                    <div className="space-y-6">
                      <div className="card sticky top-24">
                        <h3 className="font-bold text-slate-900 mb-4">Export Report</h3>
                        <div className="space-y-3">
                          {[
                            ["Download PDF", downloadPDF, result.report_path],
                            ["Export CSV", downloadCSV, result],
                            ["Export JSON", downloadJSON, result],
                          ].map(([label, handler, data], i) => (
                            <button
                              key={i}
                              onClick={() => handler(data)}
                              className={i === 0 ? "btn-primary w-full" : "btn-secondary w-full"}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="section-container bg-slate-50">
          <div className="max-w-3xl">
            <h2 className="section-title">About VeriPaper</h2>
            <p className="section-subtitle mt-2">
              We're building the future of research integrity with AI-powered analysis tools trusted by universities, journals, and research organizations worldwide.
            </p>

            <div className="grid grid-cols-3 gap-6 mt-12">
              <div className="card">
                <p className="text-lg font-bold text-blue-600">🎯</p>
                <p className="font-bold text-slate-900 mt-3">Our Mission</p>
                <p className="text-sm text-slate-600 mt-2">
                  Improve scientific publishing trust through practical AI-assisted review workflows.
                </p>
              </div>
              <div className="card">
                <p className="text-lg font-bold text-blue-600">👥</p>
                <p className="font-bold text-slate-900 mt-3">Who We Serve</p>
                <p className="text-sm text-slate-600 mt-2">
                  Editors, reviewers, universities, and research organizations globally.
                </p>
              </div>
              <div className="card">
                <p className="text-lg font-bold text-blue-600">✨</p>
                <p className="font-bold text-slate-900 mt-3">Our Promise</p>
                <p className="text-sm text-slate-600 mt-2">
                  Clear, actionable insights with transparent, explainable results.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="premium" className="section-container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="section-title">Simple, Flexible Pricing</h2>
            <p className="section-subtitle mt-2">
              Choose a plan that scales with your research integrity needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "$29",
                features: [
                  "Up to 50 analyses/month",
                  "PDF & CSV exports",
                  "Email support",
                  "Basic API access",
                ],
                highlight: false,
              },
              {
                name: "Professional",
                price: "$99",
                features: [
                  "Up to 300 analyses/month",
                  "All Starter features",
                  "API key access",
                  "Priority support",
                  "Team dashboard",
                  "Advanced reporting",
                ],
                highlight: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                features: [
                  "Unlimited analyses",
                  "Custom risk thresholds",
                  "Dedicated support",
                  "SLA guarantee",
                  "Onboarding workshops",
                  "Integration support",
                ],
                highlight: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`card ${plan.highlight ? "ring-2 ring-blue-500 shadow-lg" : ""}`}
              >
                {plan.highlight && (
                  <div className="mb-4">
                    <span className="badge badge-info">Most Popular</span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="mt-2">
                  <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-slate-600">/month</span>}
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex gap-3 text-sm text-slate-700">
                      <span className="status-dot status-safe mt-0.5"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full mt-8 ${plan.highlight ? "btn-primary" : "btn-secondary"}`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Docs Section */}
        <section id="docs" className="section-container bg-slate-50">
          <h2 className="section-title mb-12">API Documentation</h2>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="card-elevated">
              <h3 className="font-bold text-slate-900 mb-4">Upload & Analyze</h3>
              <p className="text-sm text-slate-600 mb-4">
                Send research papers to our API and receive comprehensive integrity analysis results.
              </p>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
                <code>{`POST /api/analyze
Content-Type: multipart/form-data
Authorization: Bearer YOUR_API_KEY

file=<paper.pdf>`}</code>
              </pre>
              <p className="text-xs text-slate-600 mt-4">
                Response includes: plagiarism score, AI probability, citation validity, statistical risk, detailed explanations, and PDF report path.
              </p>
            </div>

            <div className="card-elevated">
              <h3 className="font-bold text-slate-900 mb-4">Getting API Keys</h3>
              <ol className="space-y-4 text-sm text-slate-700">
                {[
                  "Subscribe to Professional or Enterprise plan",
                  "Retrieve API key from account dashboard",
                  "Include key in Authorization header",
                  "Monitor usage quota and rotate keys monthly",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold flex-shrink-0 text-xs">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <p className="font-medium mb-1">Need help?</p>
                <p>Contact support@veripaper.ai for integration assistance</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact & Newsletter Section */}
        <section id="contact" className="section-container">
          <h2 className="section-title mb-12 text-center">Let's Connect</h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Contact Form */}
            <div className="card-elevated">
              <h3 className="font-bold text-slate-900 mb-4">Get in Touch</h3>
              <form className="space-y-4" onSubmit={handleContactSubmit}>
                <input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Your name"
                  className="input"
                />
                <input
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Email address"
                  type="email"
                  className="input"
                />
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Tell us about your needs..."
                  rows={4}
                  className="input"
                />
                <button type="submit" className="btn-primary w-full">
                  Send Message
                </button>
              </form>
            </div>

            {/* Newsletter Signup */}
            <div className="card-gradient">
              <h3 className="font-bold text-white mb-4">Stay Updated</h3>
              <p className="text-white/90 text-sm mb-6">
                Get the latest updates on features, research insights, and API improvements.
              </p>
              <form className="space-y-4" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  value={subscriberEmail}
                  onChange={(e) => setSubscriberEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 text-sm rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button type="submit" className="w-full bg-white text-blue-600 font-semibold py-3 rounded-lg hover:bg-blue-50 transition-all duration-200">
                  Subscribe
                </button>
              </form>
              <p className="text-xs text-white/80 mt-4">
                support@veripaper.ai • partnerships@veripaper.ai
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-slate-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-slate-600">
            <p>© 2026 VeriPaper. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#docs" className="hover:text-slate-900 transition-colors">Docs</a>
              <a href="#premium" className="hover:text-slate-900 transition-colors">Pricing</a>
              <a href="#contact" className="hover:text-slate-900 transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </main>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-xl border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
              <h3 className="text-lg font-bold">Analysis History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-3">
              {history.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setResult(item);
                    setShowHistory(false);
                  }}
                  className="w-full text-left p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        Credibility: {item.overall_research_credibility}%
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-slate-400">→</span>
                  </div>
                </button>
              ))}
            </div>
            {history.length > 0 && (
              <div className="p-6 border-t border-slate-200">
                <button
                  onClick={handleClearHistory}
                  className="w-full btn-secondary"
                >
                  Clear History
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
