import React, { useState, useEffect } from "react";
import { InterviewGeneratorInput, GeneratedQuestionsResult, InterviewQuestion } from "./types";
import Sidebar from "./components/Sidebar";
import QuestionCard from "./components/QuestionCard";
import { 
  Sparkles, 
  Search, 
  HelpCircle, 
  FileJson, 
  FileText, 
  BookOpen, 
  Layers, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle,
  Copy,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Tips rotated during the loading screen
const LOADING_TIPS = [
  "Mapping questions to target experience tier...",
  "Calibrating evaluator guidelines & rubric standards...",
  "Reviewing industry taxonomy for conceptual accuracy...",
  "Formatting ideal keywords & tech concepts...",
  "Optimizing difficulty and duration estimates..."
];

export default function App() {
  // Config state
  const [input, setInput] = useState<InterviewGeneratorInput>({
    role: "Senior React Architect",
    experience_level: "Senior",
    skills: "React 19, TypeScript, SSR, Hydration, State State Management, Core Performance optimization",
    num_questions: 5,
    interview_type: "Technical Screen"
  });

  // Data states
  const [results, setResults] = useState<GeneratedQuestionsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  
  // Local active loading tip index
  const [tipIndex, setTipIndex] = useState(0);

  // Load previous result cache on mount
  useEffect(() => {
    const cached = localStorage.getItem("interview_generator_cached_kit");
    if (cached) {
      try {
        setResults(JSON.parse(cached));
      } catch (err) {
        console.error("Failed to parse cached interview kit", err);
      }
    }
  }, []);

  // Timer for loading feedback tips rotator
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isLoading) {
      setTipIndex(0);
      timer = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
      }, 3500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading]);

  const handleInputChange = (key: keyof InterviewGeneratorInput, value: any) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerateQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "An error occurred calling the question generation backend.");
      }

      const data: GeneratedQuestionsResult = await response.json();
      setResults(data);
      
      // Save cache
      localStorage.setItem("interview_generator_cached_kit", JSON.stringify(data));
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during interview question generation.");
    } finally {
      setIsLoading(false);
    }
  };

  // Export as formatted markdown
  const handleExportMarkdown = () => {
    if (!results) return;
    
    let md = `# Interview Preparation Kit: ${results.role} (${results.experience_level})\n`;
    md += `* **Interview Type:** ${results.interview_type}\n`;
    md += `* **Generated on:** ${new Date().toLocaleDateString()}\n\n`;
    md += `--- \n\n`;

    results.questions.forEach((q, i) => {
      md += `## Question ${i + 1}: ${q.question}\n`;
      md += `* **Recommended Time:** ${q.estimated_time_minutes} minutes\n`;
      md += `* **Evaluation Class:** ${q.type}\n`;
      md += `* **Target Technical Keywords:** ${q.ideal_answer_keywords.join(", ")}\n\n`;
      md += `### Evaluator Guidelines:\n${q.evaluator_guidelines}\n\n`;
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${results.role.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-interview-kit.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy raw JSON scheme to clipboard (perfectly matching requirements)
  const [jsonCopied, setJsonCopied] = useState(false);
  const handleCopyJSON = () => {
    if (!results) return;
    try {
      // Remove any helper react keys if any, formatting cleanly
      const cleanJSON = JSON.stringify(results, null, 2);
      navigator.clipboard.writeText(cleanJSON);
      setJsonCopied(true);
      setTimeout(() => setJsonCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy JSON schema", err);
    }
  };

  // Filters computed
  const filteredQuestions = results?.questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          q.ideal_answer_keywords.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === "All" || q.type === typeFilter;
    return matchesSearch && matchesType;
  }) || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 font-sans antialiased relative">
      
      {/* Header element conforming to Professional Polish design spec */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-6 sm:px-8 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/10">
            <span className="text-white font-black text-lg select-none">Q</span>
          </div>
          <h1 className="font-display text-lg font-semibold text-slate-900 tracking-tight">
            InterviewCore <span className="text-slate-400 font-normal font-sans text-sm select-none">/ Question Engine</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100/90 px-3 py-1.5 rounded-full border border-slate-200/50">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
            API Status: Active
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative space-y-8">

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 bg-rose-500/5 border border-rose-500/15 rounded-xl flex items-start gap-3 text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-zinc-100">Generation Error</span>
              <p className="text-zinc-350 leading-relaxed text-xs">{error}</p>
            </div>
          </div>
        )}

        {/* Main Dashboard Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column Settings Sidebar (takes 4 span on Desktop) */}
          <section className="lg:col-span-4 lg:sticky lg:top-8">
            <Sidebar 
              input={input} 
              onChange={handleInputChange} 
              onSubmit={handleGenerateQuestions} 
              isLoading={isLoading} 
            />
          </section>

          {/* Right Column Results Display (takes 8 span on Desktop) */}
          <section className="lg:col-span-8 space-y-6 min-h-[450px]">
            
            <AnimatePresence mode="wait">
              {isLoading ? (
                /* 1. Dynamic Elegant Loading Slate */
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-white border border-slate-200 rounded-2xl p-10 md:p-14 text-center space-y-8 flex flex-col items-center justify-center min-h-[450px] shadow-sm"
                >
                  {/* Glowing Spinner */}
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-20 h-20 rounded-full border border-blue-500/10 animate-ping" />
                    <div className="w-16 h-16 rounded-full border-2 border-t-blue-600 border-slate-150 animate-spin" />
                  </div>

                  <div className="space-y-3.5 max-w-md">
                    <h3 className="font-display font-semibold text-lg text-slate-800">Generating Question Matrix</h3>
                    
                    {/* Rotating Tip */}
                    <div className="h-10 flex items-center justify-center overflow-hidden">
                      <p className="text-slate-500 text-sm italic animate-fadeIn font-sans px-4">
                        &ldquo;{LOADING_TIPS[tipIndex]}&rdquo;
                      </p>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed font-mono">
                      Querying models/gemini-3.5-flash matching your specifications...
                    </p>
                  </div>
                </motion.div>

              ) : results ? (
                /* 2. Interactive Questions List Block */
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 animate-fadeIn"
                >
                  
                  {/* Control / Filter Bar */}
                  <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
                    
                    {/* Search Field */}
                    <div className="relative w-full md:max-w-xs">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                      </span>
                      <input
                        type="text"
                        placeholder="Search questions or skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 rounded-lg border border-slate-200 focus:border-blue-600 focus:outline-none transition-all"
                      />
                    </div>

                    {/* Class Filter buttons */}
                    <div className="flex items-center gap-1.5 self-start md:self-center">
                      <span className="text-[10px] uppercase font-bold text-slate-450 pr-1 select-none">Class:</span>
                      {["All", "Technical", "Behavioral", "Scenario-based"].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setTypeFilter(f)}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                            typeFilter === f 
                              ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs" 
                              : "bg-slate-50 text-slate-500 border border-slate-200/50 hover:text-slate-800 hover:bg-slate-100/50"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>

                  </div>

                  {/* Role Detail Summary Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-xs font-mono">{results.interview_type} Matrix</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        <span className="text-blue-600 text-xs font-mono font-semibold">{results.questions.length} questions loaded</span>
                      </div>
                      <h2 className="font-display font-bold text-xl text-slate-950">{results.role}</h2>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          Experience level: <span className="font-semibold text-slate-700">{results.experience_level}</span>
                        </span>
                      </div>
                    </div>

                    {/* Action Panel Utilities */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      
                      {/* Markdown Export */}
                      <button
                        onClick={handleExportMarkdown}
                        className="px-3.5 py-2 hover:bg-slate-55 bg-white text-xs text-slate-600 hover:text-slate-950 rounded-lg border border-slate-200 flex items-center gap-2 transition-all cursor-pointer shadow-xs font-medium"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        Export Guide
                      </button>

                      {/* Copy JSON conforming to requirements */}
                      <button
                        onClick={handleCopyJSON}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-950 text-xs text-slate-50 hover:text-white rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-md font-medium"
                      >
                        <FileJson className="w-3.5 h-3.5 text-blue-400" />
                        {jsonCopied ? "Copied!" : "Payload Scheme"}
                      </button>

                    </div>

                  </div>

                  {/* Render filtered items */}
                  {filteredQuestions.length > 0 ? (
                    <div className="space-y-4">
                      {filteredQuestions.map((q, index) => (
                        <QuestionCard 
                          key={q.id || index} 
                          question={q} 
                          index={index + 1} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-12 border border-slate-200 rounded-xl text-center text-slate-400 font-medium">
                      No questions found matching &ldquo;{searchQuery}&rdquo;. Try another filter or search term.
                    </div>
                  )}

                </motion.div>

              ) : (
                /* 3. Sleek Zero-State Welcome Page */
                <motion.div
                  key="zero-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-slate-200 rounded-2xl p-6 md:p-10 space-y-8 flex flex-col justify-center min-h-[450px] relative overflow-hidden shadow-sm"
                >
                  <div className="absolute top-[10%] right-[5%] select-none opacity-5">
                    <Sparkles className="w-48 h-48 text-blue-600 rotate-12" />
                  </div>

                  <div className="space-y-3.5 max-w-xl relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200/50 rounded-full text-blue-700 text-xs font-mono font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Enterprise Calibration Engine
                    </div>
                    <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-900">
                      Tailor Professional Interview Questions
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed font-sans">
                      Select or define a job description template, experience criteria, and focus technologies. Our system evaluates matching technical guidelines, estimated limits, key terminology tags, and provides candidates with mock self-practice modules backed by live AI scoring sheets.
                    </p>
                  </div>

                  {/* Features Highlights Bento Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 max-w-2xl relative z-10">
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-blue-600 shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs text-slate-800 font-bold font-display">Step-by-Step Guideline Sheets</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                          Every generated prompt includes an evaluation cheat-sheet of exact triggers and guidelines to watch out for.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-blue-600 shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs text-slate-800 font-bold font-display">Experience Targeting</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                          Strict level-matching guarantees questions appropriate for Juniors up to veteran Staff or Principal developers.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-blue-600 shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs text-slate-800 font-bold font-display">Smart Practice Grader</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                          Simulate responses directly in the terminal, capture timing metrics, and receive an instant structural gap scorecard out of 100.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-blue-600 shrink-0">
                        <FileJson className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs text-slate-800 font-bold font-display">Compliant Export Tools</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                          Copy raw JSON matching strictly validated corporate schemas or download ready-to-print Markdown guidelines instantly.
                        </p>
                      </div>
                    </div>

                  </div>

                  <div className="pt-2">
                    <p className="inline-flex items-center gap-1.5 text-slate-450 text-xs font-mono">
                      <Info className="w-3.5 h-3.5 text-blue-500/70" />
                      Tip: Prepopulate a config from &ldquo;Pre-defined Roles&rdquo; on your left for quick evaluation.
                    </p>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </section>

        </div>

      </div>

      {/* Corporate Footnote Margin clutter avoidance */}
      <footer className="w-full text-center py-10 text-[10px] text-slate-400 font-mono tracking-wide border-t border-slate-200/60 mt-16">
        PRECISE SYSTEM INTERVIEW COMPONENT • COMPILED WITH GEMINI-3.5-FLASH • PORT 3000 DEV SANDBOX
      </footer>

    </div>
  );
}
