import api from "./api";

export interface ChatResponse {
  answer: string;
}

export const askAI = async (message: string): Promise<ChatResponse> => {
  const response = await api.post("/chat", {
    message,
  });

  return response.data;
};