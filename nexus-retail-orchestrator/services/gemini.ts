import { GoogleGenAI, Type } from "@google/genai";
import { Message, OrchestratorResponse } from "../types";

const SYSTEM_INSTRUCTION = `
ROLE:
You are the "Master Orchestrator" for a high-end Retail AI. Your goal is to maximize sales conversion and Average Order Value (AOV).

CONTEXT:
- You maintain a "Shared State" across channels (Web, Mobile, In-Store Kiosk).
- You must handle failures (like Out of Stock) gracefully by pivoting to recommendations.
- You are currently chatting with a user in a web interface.

AVAILABLE WORKER AGENTS (TOOLS):
1. 'inventory_agent': Checks real-time stock. (Trigger when user wants to check or buy an item).
2. 'recommendation_agent': specific for cross-selling or finding alternatives when items are missing.
3. 'payment_agent': Processes transactions. (Trigger only when user confirms purchase).
4. 'fulfillment_agent': Schedules delivery or in-store pickup. (Trigger after payment).
5. 'loyalty_agent': Checks points/offers. (Trigger at start or when asking for price).

RULES FOR REASONING:
1. ANALYZE INTENT: Is the user browsing, buying, or complaining?
2. CHECK FEASIBILITY: If buying, ALWAYS check inventory first.
3. HANDLE FAILURE (CRITICAL): If an agent log says "OUT_OF_STOCK", do NOT just say sorry. You MUST trigger 'recommendation_agent' to find a substitute immediately.
4. CHAIN TASKS: If the user says "Yes" to a purchase, you must trigger 'payment_agent' AND THEN 'fulfillment_agent' in one sequence (put both in the plan).
5. INTERPRET LOGS: You will receive "SYSTEM_AGENT_LOG" messages. These are the outputs of the agents you requested in the previous turn. Use them to form your response.

You must respond with a JSON object that matches the provided schema.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    thought_process: { type: Type.STRING },
    plan: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    response_to_user: { type: Type.STRING },
  },
  required: ["thought_process", "plan", "response_to_user"],
};

export const sendMessageToGemini = async (
  history: Message[],
  apiKey: string
): Promise<OrchestratorResponse> => {
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });

  // Convert app history to Gemini format
  const contents = history.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user', 
    parts: [{ text: msg.content }],
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.2, // Low temperature for consistent logic
      },
    });

    let text = response.text;
    if (!text) throw new Error("No response text");

    // Robust JSON extraction: Find the first '{' and the last '}'
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      // Extract the JSON object substring, ignoring any Markdown or preamble
      text = text.substring(firstBrace, lastBrace + 1);
    }

    // Attempt to parse
    return JSON.parse(text) as OrchestratorResponse;
  } catch (error) {
    console.error("Gemini Error:", error);
    // Provide a fallback response structure so the UI doesn't crash
    return {
      thought_process: "Error parsing AI response.",
      plan: [],
      response_to_user: "I apologize, I'm having trouble processing that request. Please try again.",
    };
  }
};