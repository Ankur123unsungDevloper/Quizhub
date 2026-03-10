export const generateQuestionsPrompt = (
  examName: string,
  subjectName: string,
  topicName: string,
  difficulty: "easy" | "medium" | "hard",
  count: number,
  previousQuestionTexts: string[] = []
) => `
You are an expert exam question creator for Indian competitive exams.

Generate ${count} unique MCQ questions for:
- Exam: ${examName}
- Subject: ${subjectName}
- Topic: ${topicName}
- Difficulty: ${difficulty}

${previousQuestionTexts.length > 0 ? `
IMPORTANT: Do NOT repeat or rephrase any of these already used questions:
${previousQuestionTexts.map((q, i) => `${i + 1}. ${q}`).join("\n")}
` : ""}

Rules:
1. Each question must be unique and different in approach
2. Options must be plausible and not obviously wrong
3. Explanation must be clear and educational
4. Match the exact difficulty level requested
5. Follow the actual ${examName} exam pattern

Return ONLY a valid JSON array. No extra text. No markdown. No backticks. Format:
[
  {
    "questionText": "string",
    "options": ["A", "B", "C", "D"],
    "correctOptionIndex": 0,
    "explanation": "string",
    "difficulty": "${difficulty}"
  }
]
`;