const express = require("express");
const Groq = require("groq-sdk");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

if (!process.env.GROQ_API_KEY) {
  console.error("GROQ_API_KEY not found in .env file");
  process.exit(1);
}
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function queryGroq(prompt) {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: "Respond strictly with a JSON object." },
      { role: "user", content: prompt },
    ],
    model: "llama-3.1-8b-instant",
    response_format: { type: "json_object" },
  });
  return chatCompletion.choices[0]?.message?.content || "{}";
}

app.post("/api/upload-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const buffer = req.file.buffer;
    const ext = req.file.originalname.split(".").pop().toLowerCase();

    let text = "";
    if (ext === "pdf") {
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (ext === "docx") {
      const data = await mammoth.extractRawText({ buffer });
      text = data.value;
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    const prompt = `Extract candidate details from this text:
${text}
Respond ONLY in JSON:
{"name":"...","email":"...","phone":"..."}`;

    const result = await queryGroq(prompt);
    res.json(JSON.parse(result));
  } catch (err) {
    console.error("Resume parsing error:", err);
    res.status(500).json({ error: "Failed to parse resume" });
  }
});


app.post("/api/generate-question", async (req, res) => {
  try {
    const { level } = req.body; 
    const prompt = `Generate a ${level} full-stack (React/Node) interview question must be able to answer within less time and question is must be two lines.
Respond ONLY in JSON:
{"question":"...","answer":"..."}`;

    const result = await queryGroq(prompt);
    res.json(JSON.parse(result));
  } catch (err) {
    console.error("Question error:", err);
    res.status(500).json({ error: "Failed to generate question" });
  }
});


app.post("/api/evaluate-answer", async (req, res) => {
  try {
    const { question, userAnswer, correctAnswer } = req.body;
    const prompt = `Evaluate candidate's answer.
Q: ${question}
User: ${userAnswer}
Correct: ${correctAnswer}
Respond ONLY in JSON:
{"isCorrect": true/false, "feedback":"...", "score": number}`;

    const result = await queryGroq(prompt);
    res.json(JSON.parse(result));
  } catch (err) {
    console.error("Evaluation error:", err);
    res.status(500).json({ error: "Failed to evaluate answer" });
  }
});


app.post("/api/generate-summary", async (req, res) => {
  try {
    const { candidate } = req.body; 
    const prompt = `Write a short hiring summary for this candidate based on their interview performance:
${JSON.stringify(candidate)}
Respond ONLY in JSON:
{"summary":"...", "finalScore": number}`;

    const result = await queryGroq(prompt);
    res.json(JSON.parse(result));
  } catch (err) {
    // This block provides detailed error logging for debugging
    if (err instanceof Groq.APIError) {
        console.error("Groq API Error:", err.status, err.error);
        res.status(500).json({ error: `AI service error: ${err.error?.message || 'Failed to generate summary'}` });
    } else {
        console.error("Summary generation error:", err);
        res.status(500).json({ error: "Failed to generate summary" });
    }
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Backend running at http://localhost:${PORT}`)
);
