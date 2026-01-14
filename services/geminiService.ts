
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Strictly following initialization guidelines using process.env.API_KEY directly
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const enhanceDescription = async (name: string, currentDesc: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Melhore esta descrição de serviço para um prestador de serviço profissional. 
                 Serviço: ${name}. 
                 Descrição Atual: ${currentDesc}.
                 Retorne apenas a nova descrição sugerida, de forma persuasiva e profissional.`,
    });
    // Fix: Access response.text property directly (not a method)
    return response.text || currentDesc;
  } catch (error) {
    console.error("Erro ao melhorar descrição:", error);
    return currentDesc;
  }
};

export const generateQuoteMessage = async (clientName: string, total: number, services: string[]) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Escreva uma mensagem curta e profissional de WhatsApp/Email para enviar um orçamento.
                 Cliente: ${clientName}.
                 Valor Total: R$ ${total.toFixed(2)}.
                 Serviços inclusos: ${services.join(", ")}.
                 A mensagem deve ser cordial e convidar para o fechamento.`,
    });
    // Fix: Access response.text property directly (not a method)
    return response.text || "";
  } catch (error) {
    console.error("Erro ao gerar mensagem:", error);
    return "Olá, segue o orçamento solicitado.";
  }
};
