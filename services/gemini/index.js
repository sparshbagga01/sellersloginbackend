import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_GENAI_API_KEY } from "../../config/variables.js";

const genAI = new GoogleGenerativeAI(GOOGLE_GENAI_API_KEY);

async function main() {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent("Explain how AI works in 100 words");
  console.log(result.response.text());
}

main().catch(console.error);
