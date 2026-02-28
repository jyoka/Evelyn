import { GoogleGenerativeAI } from "@google/generative-ai";

const globalForGemini = globalThis as unknown as {
  gemini: GoogleGenerativeAI;
};

const gemini =
  globalForGemini.gemini ||
  new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

if (process.env.NODE_ENV !== "production") globalForGemini.gemini = gemini;

export const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });
