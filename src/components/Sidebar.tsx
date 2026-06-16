import React from "react";
import { InterviewGeneratorInput } from "../types";
import { 
  Briefcase, 
  Layers, 
  Cpu, 
  HelpCircle, 
  Sliders, 
  Sparkles,
  Zap,
  RotateCcw
} from "lucide-react";

interface SidebarProps {
  input: InterviewGeneratorInput;
  onChange: (key: keyof InterviewGeneratorInput, value: any) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const TEMPLATE_ROLES = [
  {
    label: "Senior React Architect",
    role: "Senior React Architect",
    experience_level: "Senior",
    skills: "React 19, TypeScript, SSR, Hydration, State State Management, Core Performance optimization",
    interview_type: "Technical Screen",
    num_questions: 5
  },
  {
    label: "Staff AI Solutions Engineer",
    role: "Staff AI Solutions Engineer",
    experience_level: "Lead",
    skills: "Gemini API SDKs, Vector Embeddings, LLM Orchestration, RAG Architecture, Concurrency, CUDA",
    interview_type: "System Design",
    num_questions: 6
  },
  {
    label: "Mid-Tier Cloud Backend Developer",
    role: "Mid-Tier Cloud Backend Developer",
    experience_level: "Mid",
    skills: "Node.js, Express, PostgreSQL, Redis, REST APIs, Docker, ACID, DB Indexing",
    interview_type: "Technical Screen",
    num_questions: 4
  },
  {
    label: "Lead Engineering Manager",
    role: "Lead Engineering Manager",
    experience_level: "Lead",
    skills: "Conflict Resolution, Project Lifecycle Delivery, Agile Scrum, System Scaling, Cross Team Alignment",
    interview_type: "Behavioral",
    num_questions: 5
  },
  {
    label: "Junior QA Automation Engineer",
    role: "Junior QA Automation Engineer",
    experience_level: "Junior",
    skills: "Selenium, Cypress, Integration Checks, Mocha, Unit Assertions, CI/CD pipelines",
    interview_type: "Scenario-based",
    num_questions: 3
  }
];

export default function Sidebar({ input, onChange, onSubmit, isLoading }: SidebarProps) {
  
  const applyTemplate = (template: typeof TEMPLATE_ROLES[0]) => {
    onChange("role", template.role);
    onChange("experience_level", template.experience_level);
    onChange("skills", template.skills);
    onChange("interview_type", template.interview_type);
    onChange("num_questions", template.num_questions);
  };

  const handleReset = () => {
    onChange("role", "");
    onChange("experience_level", "Senior");
    onChange("skills", "");
    onChange("interview_type", "Technical Screen");
    onChange("num_questions", 5);
  };

  return (
    <div className="space-y-6">
      
      {/* Parameter Form - Conformed to Professional Polish Light Design Spec */}
      <div className="border border-slate-200 bg-white p-5 md:p-6 rounded-xl relative shadow-sm space-y-5">
        
        {/* Top subtle highlight */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-xl" />
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-display font-bold text-slate-800 text-xs tracking-wider uppercase flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            Interview Blueprints
          </h2>
          <button 
            type="button"
            onClick={handleReset}
            className="text-slate-450 hover:text-slate-700 transition-colors flex items-center gap-1 text-xs font-semibold"
            title="Reset to default settings"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
          
          {/* Job Role Input */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1.5 matches-selector">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              Target Job Role / Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Frontend Engineer"
              value={input.role}
              onChange={(e) => onChange("role", e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-800 placeholder-slate-400 text-sm rounded-lg border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all outline-none"
            />
          </div>

          {/* Target Experience Level Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Experience Level
            </label>
            <div className="relative">
              <select
                value={input.experience_level}
                onChange={(e) => onChange("experience_level", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-800 text-sm rounded-lg border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white appearance-none cursor-pointer transition-all outline-none"
              >
                <option value="Junior">Junior (0 - 2 years)</option>
                <option value="Mid">Mid (2 - 5 years)</option>
                <option value="Senior">Senior (5 - 8 years)</option>
                <option value="Lead">Lead / Staff / Principal (8+ years)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                <ChevronDown />
              </div>
            </div>
          </div>

          {/* Core Skills Input */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              Focus Skills & Technologies
            </label>
            <textarea
              required
              placeholder="e.g., React, Redux, Webpack, browser performance"
              value={input.skills}
              onChange={(e) => onChange("skills", e.target.value)}
              className="w-full min-h-[70px] max-h-[140px] px-3.5 py-2.5 bg-slate-50 text-slate-800 placeholder-slate-400 text-sm rounded-lg border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all resize-none outline-none"
            />
          </div>

          {/* Interview Type Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              Interview Mode/Category
            </label>
            <div className="relative">
              <select
                value={input.interview_type}
                onChange={(e) => onChange("interview_type", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-800 text-sm rounded-lg border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white appearance-none cursor-pointer transition-all outline-none"
              >
                <option value="Technical Screen">Technical Screen / QA</option>
                <option value="Behavioral">Behavioral (STAR format)</option>
                <option value="System Design">System Design & Architecture</option>
                <option value="Scenario-based">Scenario-based / Edge Cases</option>
                <option value="Coding Challenge">Coding & Logic challenge</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                <ChevronDown />
              </div>
            </div>
          </div>

          {/* Slider for Question Count */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center">
              <label className="text-xs uppercase font-bold tracking-wider text-slate-500">
                Number of Questions
              </label>
              <span className="font-mono text-xs font-bold bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded text-blue-600 shadow-2xs">
                {input.num_questions}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              value={input.num_questions}
              onChange={(e) => onChange("num_questions", parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono">
              <span>1</span>
              <span>6</span>
              <span>12</span>
            </div>
          </div>

          {/* Generate Button with Solid corporate blue styling */}
          <button
            type="submit"
            disabled={isLoading || !input.role || !input.skills}
            className="w-full mt-2 py-3 px-4 bg-blue-600 text-white font-semibold text-sm rounded-lg shadow-sm hover:bg-blue-700 active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:scale-100 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-blue-500/10"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Assembling Interview Room...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current text-white/90" />
                Generate Interview Kit
              </>
            )}
          </button>

        </form>

      </div>

      {/* Quick Templates Drawer */}
      <div className="border border-slate-200 bg-white p-4 rounded-xl shadow-xs space-y-3.5">
        <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-2 border-b border-slate-100">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          Pre-defined Roles (Quick Test)
        </h3>
        
        <div className="flex flex-col gap-1.5">
          {TEMPLATE_ROLES.map((t, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => applyTemplate(t)}
              className="w-full text-left p-2.5 rounded-lg border border-slate-200/60 bg-slate-50/70 text-slate-700 text-xs hover:text-slate-900 hover:bg-slate-50 hover:border-blue-500/30 transition-all font-sans flex items-center justify-between shadow-2xs cursor-pointer font-medium"
            >
              <span className="truncate">{t.label}</span>
              <span className="text-[10px] text-slate-500 bg-white font-mono px-2 py-0.5 rounded border border-slate-200 shrink-0 select-none font-semibold">
                {t.experience_level}
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

function ChevronDown() {
  return (
    <svg className="h-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
