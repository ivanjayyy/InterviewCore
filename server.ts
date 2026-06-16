import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client helper
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets in AI Studio.");
    }
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// 1. QUESTION GENERATION API ENDPOINT
app.post("/api/generate", async (req, res) => {
  try {
    const { role, experience_level, skills, num_questions, interview_type } = req.body;

    // Validation
    const safeRole = (role || "Software Engineer").trim();
    const safeLevel = (experience_level || "Senior").trim();
    const safeSkills = (skills || "General Problem Solving").trim();
    const safeCount = Math.max(1, Math.min(15, parseInt(num_questions) || 5));
    const safeType = (interview_type || "Technical Screen").trim();

    const client = getGeminiClient();

    const prompt = `Generate exactly ${safeCount} interview questions for the following candidate parameters:
Job Role: ${safeRole}
Target Experience Level: ${safeLevel}
Core Skills/Technologies to focus on: ${safeSkills}
Interview Type: ${safeType}

Ensure that:
1. Every generated question matches the "${safeLevel}" experience tier. Do not ask entry-level questions to senior/lead developers, and do not ask deep architectural design questions to junior developers.
2. The evaluator guidelines must be rich, precise, and constructive (2-3 sentences), highlighting exactly what a perfect answer contains and what pitfalls to look for.
3. Every ideal_answer_keywords array should contain 4 to 8 highly relevant technical jargon words or terms specific to a bulletproof answer.
4. Set realistic estimated_time_minutes for each question (e.g., 5-10 mins for Technical, 15-20 mins for System Design).
5. Output must follow the required JSON schema. Do not output anything other than valid JSON.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are an elite principal software engineer and expert technical interviewer. You specialize in crafting precise, role-focused, and level-appropriate interview questions.
Your output must be strictly valid JSON conformant to the requested schema. No markdown code blocks, no trailing comments, no introductory remarks.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            role: { 
              type: Type.STRING, 
              description: "The job title of the interview" 
            },
            experience_level: { 
              type: Type.STRING, 
              description: "Experience Level (Junior, Mid, Senior, Lead)" 
            },
            interview_type: { 
              type: Type.STRING, 
              description: "Interview category selected by the user" 
            },
            questions: {
              type: Type.ARRAY,
              description: "List of generated questions",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING, description: "The full question text, fully detailed and professional" },
                  type: { type: Type.STRING, description: "The subclass of question - 'Technical', 'Behavioral', or 'Scenario-based'" },
                  estimated_time_minutes: { type: Type.INTEGER, description: "Alloted time for response" },
                  ideal_answer_keywords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "High impact technical concepts, patterns, or formulas expected in a top-tier answer"
                  },
                  evaluator_guidelines: { type: Type.STRING, description: "Step-by-step description of what a stellar response displays and red-flags to note" }
                },
                required: ["id", "question", "type", "estimated_time_minutes", "ideal_answer_keywords", "evaluator_guidelines"]
              }
            }
          },
          required: ["role", "experience_level", "interview_type", "questions"]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("No response text received from the Gemini configuration.");
    }

    // Since the system config specifies application/json, it is a valid JSON string.
    res.setHeader("Content-Type", "application/json");
    res.send(textOutput.trim());
  } catch (error: any) {
    console.error("Error in /api/generate:", error);
    res.status(500).json({
      error: error.message || "An error occurred while generating interview questions",
      details: error.stack
    });
  }
});

// 2. ANSWERS EVALUATION API ENDPOINT
app.post("/api/evaluate", async (req, res) => {
  try {
    const { question, ideal_answer_keywords, evaluator_guidelines, user_answer } = req.body;

    if (!user_answer || user_answer.trim() === "") {
      return res.status(400).json({ error: "User answer is required for evaluation." });
    }

    const client = getGeminiClient();

    const prompt = `Evaluate the following interview answer candidate response:
Question: ${question}
Ideal Answer Keywords/Tech: ${JSON.stringify(ideal_answer_keywords)}
Evaluator Guidelines: ${evaluator_guidelines}
Candidate's Answer: ${user_answer}

Provide feedback according to the grading schema. Evaluate objectively and grade out of 100 points, being fair but rigorous. Specify what keywords were missing, what gaps exist, and list the strengths clearly.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are an elite, objective technical interviewer and talent grader. You assess candidate technical or soft answers with absolute precision.
Your output must be strictly valid JSON conformant to the requested schema. Do not output markdown code blocks.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { 
              type: Type.INTEGER, 
              description: "Integrity score between 0 and 100 based on core guidelines met" 
            },
            strengths: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Accurate points, methodologies, or communication strengths displayed" 
            },
            gaps: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Incorrect statements, conceptual errors, or structural lacks" 
            },
            key_points_missed: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Crucial keywords or best practices from details target sheet missed" 
            },
            feedback: { 
              type: Type.STRING, 
              description: "A constructive, motivating 2-3 sentence overview feedback summarizing their result and how to prepare better" 
            }
          },
          required: ["score", "strengths", "gaps", "key_points_missed", "feedback"]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("No response text received from the evaluation engine.");
    }

    res.setHeader("Content-Type", "application/json");
    res.send(textOutput.trim());
  } catch (error: any) {
    console.error("Error in /api/evaluate:", error);
    res.status(500).json({
      error: error.message || "An error occurred while evaluating your answer."
    });
  }
});

// Setup Vite Dev server or production static serving
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

initializeServer().catch((error) => {
  console.error("Failed to initialize server:", error);
});
