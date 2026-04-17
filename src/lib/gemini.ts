import { GoogleGenAI } from "@google/genai";

// Initialization - using the platform-injected GEMINI_API_KEY
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

export const model = "gemini-3-flash-preview";

export async function generateCreativeIdeas(topic: string) {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [{ text: `Generate 5 creative, non-obvious ideas or angles for exploring the following topic: "${topic}". Provide a brief explanation for each.` }]
        }
      ],
      config: {
        systemInstruction: "You are Lumina, a brilliant creative strategist known for lateral thinking and poetic yet practical wisdom. Your goal is to help users find unique perspectives.",
        temperature: 0.9,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

export async function chatWithLumina(history: { role: string; text: string }[], message: string) {
  try {
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction: "You are Lumina, a creative Muse. You help users refine their thoughts, brainstorm ideas, and find inspiration. Be concise, insightful, and slightly encouraging. Use markdown for structure.",
      }
    });

    // Note: The @google/genai SDK expects history to be formatted correctly if we used chat.sendMessage, 
    // but we can also just use generateContent for a stateless-feeling chat or use the chat object.
    
    const response = await ai.models.generateContent({
      model,
      contents: [
        ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        { role: "user", parts: [{ text: message }] }
      ]
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
