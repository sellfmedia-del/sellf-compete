import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function runAuditEngine(url: string, type: string, platform: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  const prompt = `
    Analyze this ${platform} product: ${url || "Concept: " + type}.
    Return a CLEAN JSON. No markdown.
    Structure:
    1. topSellers: Array(3) {rank, title, sales_estimate}
    2. sentiment: {likes, dislikes}
    3. rivals: {mainThreat, closestMatch}
    4. pricing: {min, max, optimalRange, position}
    5. platformInfo: {commission, volumeShare, demandLevel}
    6. growth: {opportunity, threat, revenueForecast, score}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}