
import { GoogleGenAI, Type } from "@google/genai";

// Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
export async function fetchDailyFunFact(): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Tell me one interesting and surprising fun fact about science, history, or technology for a student audience. Keep it under 150 characters. Do not use Markdown formatting.",
      config: { temperature: 0.9 }
    });
    return response.text?.trim() || "Did you know? Honey never spoils!";
  } catch (error) {
    console.error("Error fetching fun fact:", error);
    return "The shortest war in history lasted only 38 minutes.";
  }
}

export async function generateStudyTip(): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Give me a quick, actionable study tip for a college student. Max 20 words. No Markdown.",
      config: { temperature: 0.8 }
    });
    return response.text?.trim() || "Use the Pomodoro technique: study for 25 minutes, then take a 5-minute break.";
  } catch (error) {
    console.error("Error fetching study tip:", error);
    return "Try explaining complex concepts to a rubber duck to find gaps in your knowledge.";
  }
}

export async function generateQuizQuestion(subject: string): Promise<{ question: string, options: string[], answer: number }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a multiple choice question about ${subject} with 4 options. Return strictly as valid JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.INTEGER, description: "Index of the correct option (0-3)" }
          },
          required: ["question", "options", "answer"]
        }
      }
    });
    const text = response.text?.trim() || "";
    // Robust parsing for common AI JSON wrapper issues
    const cleanedJson = text.startsWith('```json') ? text.replace(/```json|```/g, '').trim() : text;
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error("Error generating quiz:", error);
    return {
      question: `What is a fundamental concept in ${subject}?`,
      options: ["Consistency", "Scalability", "Reliability", "All of the above"],
      answer: 3
    };
  }
}
