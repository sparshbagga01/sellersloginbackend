import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_GENAI_API_KEY } from "../../config/variables.js";

console.log(
  "[DEBUG] GOOGLE_GENAI_API_KEY:",
  GOOGLE_GENAI_API_KEY ? "Loaded ✅" : "Missing ❌"
);

if (!GOOGLE_GENAI_API_KEY) {
  throw new Error(
    "[ERROR] GOOGLE_GENAI_API_KEY is missing. Please set it in your environment or config file."
  );
}

const genAI = new GoogleGenerativeAI(GOOGLE_GENAI_API_KEY);

export async function generateDescription(
  productName,
  features,
  tone = "friendly"
) {
  console.log("[DEBUG] generateDescription called with:", {
    productName,
    features,
    tone,
  });

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json", // Force JSON output
      },
    });
    console.log("[DEBUG] Model initialized with JSON mode ✅");

    const prompt = `
Generate product descriptions for: ${productName}
Key Features: ${features}
Tone: ${tone}

Create:
1. shortDescription: Exactly 30 words maximum, catchy and engaging
2. fullDescription: Exactly 450 words maximum, highlight features, benefits, and use cases

Return as JSON object with keys "shortDescription" and "fullDescription".
`;

    // console.log("[DEBUG] Sending prompt to Gemini model...");

    const result = await model.generateContent(prompt);
    // console.log("[DEBUG] Response received ✅");

    const text = result.response.text();
    // console.log("[DEBUG] Raw model output:", text);

    // Aggressive cleaning to handle all markdown variations
    let cleanedText = text
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/g, "")
      .replace(
        /^\s*{\s*"shortDescription":\s*"```json\\n{\s*"shortDescription":/i,
        '{"shortDescription":'
      )
      .replace(/}\s*```"\s*}?\s*$/i, "}") // Remove trailing markdown
      .trim();

    // If the response is nested JSON strings, extract the inner JSON
    if (cleanedText.includes("\\n") || cleanedText.includes('\\"')) {
      // console.log("[DEBUG] Detected escaped JSON, attempting to parse nested structure...");
      const firstParse = JSON.parse(cleanedText);

      // Check if the values are JSON strings themselves
      if (
        typeof firstParse.shortDescription === "string" &&
        firstParse.shortDescription.includes("{")
      ) {
        cleanedText = firstParse.shortDescription
          .replace(/```json\n?/gi, "")
          .replace(/```\n?/g, "")
          .trim();
      }
    }

    const parsed = JSON.parse(cleanedText);

    const shortWords = parsed.shortDescription.split(/\s+/).length;
    const fullWords = parsed.fullDescription.split(/\s+/).length;

    // console.log("[DEBUG] Short description:", shortWords, "words");
    // console.log("[DEBUG] Full description:", fullWords, "words");
    // console.log("[DEBUG] Parsed successfully ✅");

    return {
      shortDescription: parsed.shortDescription.trim(),
      fullDescription: parsed.fullDescription.trim(),
    };
  } catch (error) {
    console.error("[ERROR] generateDescription failed:", error);
    console.error("[ERROR] Problematic text:", error.message);
    throw new Error(`Failed to generate description: ${error.message}`);
  }
}
