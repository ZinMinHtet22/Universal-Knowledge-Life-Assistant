import axios from 'axios';
import { getToken } from './auth';

const API_URL = 'http://localhost:8000/api/chat';

export const getChatHistory = async () => {
  const token = getToken();
  const response = await axios.get(`${API_URL}/history`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const streamChat = async (query, chatId = null, onChunk, onDone, onError) => {
  const token = getToken();
  
  try {
    const response = await fetch(`${API_URL}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: query,
        chat_id: chatId
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        onDone();
        break;
      }
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.substring(6).trim();
          if (dataStr === '[DONE]') {
            // End of stream signaled
            onDone();
            return; 
          }
          if (dataStr) {
            try {
              const data = JSON.parse(dataStr);
              onChunk(data);
            } catch (e) {
              console.error("Failed to parse SSE data chunk", e, dataStr);
            }
          }
        }
      }
    }
  } catch (error) {
    onError(error);
  }
};
