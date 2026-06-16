import React, { useState, useEffect, useRef } from "react";
import { InterviewQuestion, AnswerGrade } from "../types";
import { 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Timer, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Copy, 
  Check,
  Award,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface QuestionCardProps {
  key?: React.Key | number | string;
  question: InterviewQuestion;
  index: number;
}

export default function QuestionCard({ question, index }: QuestionCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Practice states
  const [isPracticing, setIsPracticing] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  
  // Timer states
  const [timeRemaining, setTimeRemaining] = useState(question.estimated_time_minutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  // Evaluation states
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<AnswerGrade | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeRemaining]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(question.question);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy question", err);
    }
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeRemaining(question.estimated_time_minutes * 60);
  };

  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;
    setIsEvaluating(true);
    setError(null);
    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.question,
          ideal_answer_keywords: question.ideal_answer_keywords,
          evaluator_guidelines: question.evaluator_guidelines,
          user_answer: userAnswer,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate answer. Ensure GEMINI_API_KEY is configured.");
      }

      const data: AnswerGrade = await response.json();
      setEvaluation(data);
    } catch (err: any) {
      setError(err?.message || "An exception occurred during grading.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-700 border-emerald-200 bg-emerald-50";
    if (score >= 65) return "text-amber-700 border-amber-200 bg-amber-50";
    return "text-rose-700 border-rose-200 bg-rose-50";
  };

  const getScoreBadgeText = (score: number) => {
    if (score >= 85) return "Strong Outperform";
    if (score >= 65) return "Mid-Tier Proficient";
    return "Needs Revision";
  };

  return (
    <div className="relative border border-slate-200 bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-all">
      {/* Top indicator bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-600/15" />
      
      {/* Primary Row */}
      <div className="p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors select-none" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 shadow-2xs">
              Q{index}
            </span>
            <span className={`text-[11px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${
              question.type === "Technical" ? "bg-blue-50 text-blue-700 border-blue-200/60" :
              question.type === "Behavioral" ? "bg-amber-50 text-amber-700 border-amber-200/60" :
              "bg-purple-50 text-purple-700 border-purple-200/60"
            }`}>
              {question.type}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100/85 px-2.5 py-0.5 rounded-full border border-slate-200">
              <Timer className="w-3.5 h-3.5 text-slate-400" />
              {question.estimated_time_minutes} min
            </span>
          </div>
          
          <h3 className="font-display text-base md:text-lg text-slate-900 font-bold leading-relaxed tracking-tight pr-4">
            {question.question}
          </h3>
        </div>

        {/* Buttons drawer controls */}
        <div className="flex items-center gap-3 self-end md:self-center" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={handleCopy}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 bg-white transition-colors cursor-pointer"
            title="Copy question text"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
          
          <button 
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 bg-slate-50 transition-colors flex items-center justify-center cursor-pointer"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Interactive Sheet */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="border-t border-slate-150 bg-slate-50/50"
          >
            <div className="p-5 md:p-6 space-y-6">
              
              {/* Core Guide Block */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Guidelines conforming to strict Professional Polish rules */}
                <div className="lg:col-span-7 space-y-2">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>Evaluator Guidelines</span>
                  </div>
                  <p className="text-slate-650 text-sm leading-relaxed bg-white p-4 rounded-lg border-l-4 border-slate-350 border-r border-t border-b border-slate-200 shadow-2xs font-sans">
                    {question.evaluator_guidelines}
                  </p>
                </div>

                {/* Target Keywords */}
                <div className="lg:col-span-5 space-y-2">
                  <div className="text-slate-800 font-bold text-xs uppercase tracking-wider">
                    Target Tech Keywords & Concepts
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-wrap gap-1.5 h-full align-top shadow-2xs">
                    {question.ideal_answer_keywords && question.ideal_answer_keywords.length > 0 ? (
                      question.ideal_answer_keywords.map((kw, idx) => (
                        <span 
                          key={idx}
                          className="font-mono text-xs px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200/60 hover:bg-blue-100 transition-all cursor-default font-medium"
                        >
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs italic">No specific target keywords defined.</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Practice Area Toggle */}
              <div className="pt-2 border-t border-slate-200/60">
                {!isPracticing ? (
                  <button
                    onClick={() => {
                      setIsPracticing(true);
                      resetTimer();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-blue-200 sky-shadow-xs bg-blue-50/50 text-blue-700 hover:bg-blue-50 hover:border-blue-300 font-bold text-sm transition-all shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Self-Practice & Get Smart Grading
                  </button>
                ) : (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-700 text-sm font-bold">Practice Simulation Mode</span>
                        <div className="h-4 w-[1px] bg-slate-200" />
                        <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-blue-700 bg-white px-2.5 py-1 rounded border border-slate-200 shadow-2xs">
                          <Timer className={`w-4 h-4 ${isTimerRunning ? "text-red-500 animate-pulse" : "text-slate-400"}`} />
                          <span>{formatTime(timeRemaining)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleTimer}
                          className="px-3 py-1.5 bg-slate-200/85 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          {isTimerRunning ? "Pause" : "Start Clock"}
                        </button>
                        <button
                          onClick={resetTimer}
                          className="p-1.5 bg-slate-200/85 hover:bg-slate-200 text-slate-600 rounded transition-all cursor-pointer"
                          title="Reset Timer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setIsPracticing(false);
                            setIsTimerRunning(false);
                          }}
                          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all rounded ml-1 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Answer Text Box */}
                    <div className="space-y-1">
                      <label className="text-xs text-slate-550 block font-bold">Draft your answer below:</label>
                      <textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type standard STAR format (Situation, Task, Action, Result) response or bulleted core points. Write as though you were responding directly in the interview."
                        className="w-full min-h-[140px] px-4 py-3 bg-white text-slate-800 placeholder-slate-400 text-sm rounded-lg border border-slate-200 focus:border-blue-600 focus:outline-none transition-all font-sans leading-relaxed resize-y shadow-2xs outline-none"
                      />
                    </div>

                    {/* Submit Bar */}
                    <div className="flex justify-between items-center gap-3">
                      <p className="text-[11px] text-slate-400 font-semibold italic max-w-md">
                        *Responses are formatted and validated secure server-side via the Gemini-3.5-flash grader block in Real-Time.
                      </p>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsPracticing(false)}
                          className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSubmitAnswer}
                          disabled={isEvaluating || !userAnswer.trim()}
                          className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-450 text-xs font-bold rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-sm shadow-blue-500/10"
                        >
                          {isEvaluating ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Grading Answer...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 fill-current text-white/90" />
                              Submit & AI Grade
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Errors from engine */}
                    {error && (
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-rose-600 text-xs mt-2 font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Interactive Evaluation Result Display */}
                    {evaluation && (
                      <div className="bg-slate-50/70 rounded-xl p-5 border border-slate-200 space-y-5 animate-fadeIn shadow-2xs">
                        
                        {/* Summary Score Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200/60 shadow-3xs">
                              <Award className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">Gemini Performance Score</div>
                              <div className="font-display text-lg text-slate-850 font-bold flex items-center gap-2">
                                <span>Evaluating Assessment</span>
                                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${getScoreColor(evaluation.score)} shadow-3xs`}>
                                  {getScoreBadgeText(evaluation.score)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Interactive Score Value Gauge */}
                          <div className="flex items-center gap-3 bg-white p-2 px-3.5 rounded-lg border border-slate-200 shadow-2xs">
                            <span className="text-slate-500 text-xs font-bold font-sans">AI Grade:</span>
                            <span className={`text-2xl font-mono font-extrabold ${
                              evaluation.score >= 85 ? "text-emerald-600" :
                              evaluation.score >= 65 ? "text-amber-600" : "text-rose-600"
                            }`}>{evaluation.score}</span>
                            <span className="text-slate-400 text-xs font-bold font-sans">/ 100</span>
                          </div>
                        </div>

                        {/* Mentorship feedback text */}
                        <div className="text-sm text-slate-650 font-medium leading-relaxed italic bg-white p-4 rounded-lg border border-slate-200 shadow-3xs w-full">
                          &ldquo; {evaluation.feedback} &rdquo;
                        </div>

                        {/* Detail Categories Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Strengths */}
                          <div className="space-y-2.5 bg-white p-4 rounded-lg border border-slate-200 shadow-3xs">
                            <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Strengths & Valid Concepts
                            </span>
                            <ul className="space-y-1.5">
                              {evaluation.strengths && evaluation.strengths.length > 0 ? (
                                evaluation.strengths.map((str, i) => (
                                  <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed font-medium">
                                    <span className="text-blue-500 select-none mt-0.5">•</span>
                                    <span>{str}</span>
                                  </li>
                                ))
                              ) : (
                                <span className="text-slate-450 text-xs italic">None observed. Try to elaborate on technical specifications.</span>
                              )}
                            </ul>
                          </div>

                          {/* Concepts Missing / Gaps */}
                          <div className="space-y-2.5 bg-white p-4 rounded-lg border border-slate-200 shadow-3xs">
                            <span className="text-xs text-rose-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5" /> Critical Technical Gaps
                            </span>
                            <ul className="space-y-1.5">
                              {evaluation.gaps && evaluation.gaps.length > 0 ? (
                                evaluation.gaps.map((gap, i) => (
                                  <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed font-medium">
                                    <span className="text-rose-550 select-none mt-0.5">•</span>
                                    <span>{gap}</span>
                                  </li>
                                ))
                              ) : (
                                <span className="text-slate-450 text-xs italic font-medium">Outstanding! No structural gaps identified.</span>
                              )}
                            </ul>
                          </div>

                        </div>

                        {/* Missed Keywords */}
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-3xs">
                          <span className="text-xs text-amber-600 font-bold uppercase tracking-wider block mb-2">
                            Key Terminology & Topics Missed:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {evaluation.key_points_missed && evaluation.key_points_missed.length > 0 ? (
                              evaluation.key_points_missed.map((pt, i) => (
                                <span key={i} className="font-mono text-[11px] px-2.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/70 font-semibold select-none">
                                  {pt}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-450 text-xs italic font-medium">Excellent match! You referenced all expected technical keywords.</span>
                            )}
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
