import { GoogleGenAI, Modality, Type } from "@google/genai";
import { PlateAnalysisResult } from '../types';

// FIX: The API key must be retrieved from process.env.API_KEY as per the guidelines. This also resolves the TypeScript error regarding 'import.meta.env'.
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

export async function analyzePlate(base64ImageData: string, mimeType: string): Promise<{ result: PlateAnalysisResult, modifiedImageBase64: string }> {

  const imagePart = {
    inlineData: {
      data: base64ImageData,
      mimeType: mimeType,
    },
  };

  // --- Etapa 1: Extrair de forma confiável o texto da placa e a confiança usando um modelo de texto ---
  const textModel = 'gemini-2.5-flash';
  const textExtractionResponse = await ai.models.generateContent({
    model: textModel,
    contents: {
      parts: [
        imagePart,
        { text: "Analise a imagem, leia o texto da placa do veículo principal e retorne o texto e um score de confiança. Ignore a miniatura no canto superior direito." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plateText: {
            type: Type.STRING,
            description: "O texto alfanumérico extraído da placa do veículo."
          },
          confidence: {
            type: Type.NUMBER,
            description: "Um score de confiança entre 0.0 e 1.0 para a extração do texto."
          }
        },
        required: ["plateText", "confidence"]
      },
    },
  });
  
  let plateData: PlateAnalysisResult;
  try {
    const jsonText = textExtractionResponse.text.trim();
    if (!jsonText) {
        throw new Error("A IA de texto não retornou dados.");
    }
    plateData = JSON.parse(jsonText);
  } catch(e) {
      console.error("Falha ao analisar a resposta JSON da extração de texto:", e);
      throw new Error("Não foi possível extrair os dados da placa da imagem.");
  }

  if (!plateData || !plateData.plateText) {
      throw new Error("A análise de texto não conseguiu identificar a placa.");
  }

  // --- Etapa 2: Usar o texto extraído para guiar o modelo de imagem para um desenho preciso de AMBAS as partes ---
  const imageModel = 'gemini-2.5-flash-image';
  const imageEditingPrompt = `
    REGRA CRÍTICA INICIAL: Esta imagem contém uma miniatura no canto superior direito. Você DEVE ignorar completamente esta miniatura. NÃO desenhe nada dentro ou ao redor da área da miniatura. Todas as edições devem ocorrer apenas na imagem principal.

    TAREFA: Você deve realizar AMBAS as tarefas a seguir com extrema precisão na imagem do veículo principal:

    1.  **Contorno da Placa:**
        *   Encontre a placa física que contém o texto: "${plateData.plateText}".
        *   Desenhe um contorno verde brilhante, fino e perfeitamente ajustado às bordas da placa.

    2.  **Contorno do Para-brisa:**
        *   Localize o para-brisa: a grande janela de vidro frontal do carro, localizada ACIMA do capô e ABAIXO do teto.
        *   Desenhe um segundo contorno verde brilhante e fino, seguindo exatamente as bordas do vidro.
        *   **IMPORTANTE:** O contorno do para-brisa NÃO deve tocar em nenhuma parte da lataria do carro (capô, teto, colunas laterais). Ele deve contornar apenas o vidro. Ignore os limpadores.

    REGRAS GERAIS DE DESENHO:
    *   Foque apenas no veículo principal. Ignore todos os outros.
    *   Os contornos devem ser limpos e únicos. Não duplique linhas.
    *   Não adicione nenhuma outra marca, linha, ou símbolo na imagem.
  `;

  const imageEditingResponse = await ai.models.generateContent({
      model: imageModel,
      contents: { parts: [imagePart, { text: imageEditingPrompt }] },
      config: {
          responseModalities: [Modality.IMAGE],
      },
  });

  // --- Etapa 3: Extrair a imagem modificada ---
  if (!imageEditingResponse.candidates || imageEditingResponse.candidates.length === 0 || imageEditingResponse.candidates[0].finishReason !== 'STOP') {
      const blockReason = imageEditingResponse.candidates?.[0]?.finishReason;
      const safetyRatings = imageEditingResponse.candidates?.[0]?.safetyRatings;
      console.error("Safety Ratings:", safetyRatings);
      throw new Error(`A IA de imagem foi bloqueada ao tentar desenhar na imagem. Motivo: ${blockReason}`);
  }

  const modifiedImagePart = imageEditingResponse.candidates[0].content?.parts?.find(p => p.inlineData);

  if (!modifiedImagePart?.inlineData?.data) {
      throw new Error("A IA de imagem não retornou uma imagem modificada.");
  }

  return { result: plateData, modifiedImageBase64: modifiedImagePart.inlineData.data };
}