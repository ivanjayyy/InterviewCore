export interface InterviewGeneratorInput {
  role: string;
  experience_level: string;
  skills: string;
  num_questions: number;
  interview_type: string;
}

export interface InterviewQuestion {
  id: number;
  question: string;
  type: "Technical" | "Behavioral" | "Scenario-based" | string;
  estimated_time_minutes: number;
  ideal_answer_keywords: string[];
  evaluator_guidelines: string;
}

export interface GeneratedQuestionsResult {
  role: string;
  experience_level: string;
  interview_type: string;
  questions: InterviewQuestion[];
}

export interface AnswerGrade {
  score: number; // 0 to 100
  strengths: string[];
  gaps: string[];
  key_points_missed: string[];
  feedback: string;
}

export interface EvaluationRequest {
  question: string;
  ideal_answer_keywords: string[];
  evaluator_guidelines: string;
  user_answer: string;
}
