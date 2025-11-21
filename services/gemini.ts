import { GoogleGenAI, Chat, Content, Part } from "@google/genai";
import { Message, Sender, ChatSessionConfig } from "../types";

const MODEL_NAME = 'gemini-2.5-flash';

// Initialize the client
// Note: API_KEY is guaranteed to be available in process.env by the runtime environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chatSession: Chat | null = null;

const SYSTEM_INSTRUCTION_BASE = `
Você é o "Professor Geral", um educador virtual extremamente inteligente, paciente e didático.
Sua missão é explicar qualquer conceito solicitado pelo usuário em Português (Brasil).

Diretrizes de Personalidade:
- Seu tom é encorajador, acadêmico mas acessível, e confiável.
- Use analogias do mundo real para explicar conceitos abstratos.
- Formate suas respostas usando Markdown para máxima clareza (títulos, listas, negrito).
- Se o usuário fizer uma pergunta simples, seja direto. Se pedir detalhes, seja profundo.
- Sempre valide a curiosidade do aluno.

Se o usuário perguntar quem você é, responda apenas: "Eu sou o Professor Geral, sua inteligência artificial dedicada ao ensino e aprendizado."
`;

export const startNewChat = (config: ChatSessionConfig): void => {
  const depthInstruction = config.depthLevel === 'concise' 
    ? "Responda de forma sucinta e direta, focando nos pontos chave."
    : config.depthLevel === 'academic'
    ? "Responda com rigor acadêmico, citando definições formais e contexto histórico se aplicável."
    : "Forneça uma explicação detalhada e abrangente.";

  chatSession = ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: `${SYSTEM_INSTRUCTION_BASE}\n\nConfiguração Atual: ${depthInstruction}`,
      temperature: 0.7,
      tools: config.useSearch ? [{ googleSearch: {} }] : undefined,
    },
  });
};

export const sendMessageToGemini = async (
  text: string,
  onStream: (chunkText: string) => void
): Promise<{ fullText: string; groundingMetadata?: any }> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized");
  }

  try {
    const resultStream = await chatSession.sendMessageStream({ message: text });
    
    let fullText = '';
    let finalGroundingMetadata = undefined;

    for await (const chunk of resultStream) {
      const chunkText = chunk.text || '';
      fullText += chunkText;
      onStream(chunkText);

      // Capture grounding metadata from chunks if available
      if (chunk.candidates?.[0]?.groundingMetadata) {
        finalGroundingMetadata = chunk.candidates[0].groundingMetadata;
      }
    }

    return { fullText, groundingMetadata: finalGroundingMetadata };

  } catch (error) {
    console.error("Error in Gemini service:", error);
    throw error;
  }
};

export const extractWebSources = (groundingMetadata: any) => {
  if (!groundingMetadata?.groundingChunks) return [];
  
  return groundingMetadata.groundingChunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({
      uri: chunk.web.uri,
      title: chunk.web.title,
    }));
};