import OpenAI from 'openai';
import dotenv from 'dotenv'

dotenv.config()

function getRandomToken() {
  const tokens = process.env.GITHUB_TOKEN?.split(",").map((t) => t.trim()) || [];
  if (tokens.length === 0) {
    throw new Error("No GitHub tokens found in environment variables");
  }
  return tokens[Math.floor(Math.random() * tokens.length)];
}

// export function createOpenAIClient() {
//   return new OpenAI({
//     baseURL: "https://models.github.ai/inference",
//     apiKey: getRandomToken(),
//   });
// }

export function createOpenAIClient() {
  return new OpenAI({
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    apiKey: process.env.GEMINI_API_KEY,
  })
}