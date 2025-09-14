import { AISummaryRequest, AIAskRequest, AISummaryResponse, AIAskResponse } from '../utils/types/ai.types';

const NGROK_BASE_URL = process.env.NGROK_BASE_URL;

if (!NGROK_BASE_URL) {
  console.warn('NGROK_BASE_URL environment variable is not set. External AI service will not be available.');
} else {
  console.log(`Using external AI service at: ${NGROK_BASE_URL}`);
}

export class AIService {
  async summarizeText(request: AISummaryRequest): Promise<AISummaryResponse> {
    if (!NGROK_BASE_URL) {
      throw new Error('AI service is not configured');
    }

    try {
      const formData = new FormData();
      formData.append('text', request.text);
      formData.append('level', request.level);

      const response = await fetch(`${NGROK_BASE_URL}/summarize/text`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('External AI service error:', errorText);
        throw new Error(errorText || 'Failed to get response from AI service');
      }

      const result = await response.json();
      return {
        summary: result.summary || '',
        level: request.level,
        status: 'success'
      };
    } catch (error) {
      console.error('Error calling external AI service:', error);
      throw new Error(error instanceof Error ? error.message : 'AI service is currently unavailable. Please try again later.');
    }
  }

  async askQuestion(request: AIAskRequest): Promise<AIAskResponse> {
    if (!NGROK_BASE_URL) {
      throw new Error('AI service is not configured');
    }

    const formData = new FormData();
    formData.append('question', request.question);
    formData.append('text', request.context);

    const response = await fetch(`${NGROK_BASE_URL}/ask/text`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI service error: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  private bufferToBlob(buffer: Buffer, type: string): Blob {
    // Create a new Uint8Array from the buffer
    const array = new Uint8Array(buffer);
    // Create a Blob from the Uint8Array
    return new Blob([array], { type });
  }

  async summarizePdf(file: Buffer, filename: string, level: 'short' | 'medium' | 'long' = 'short'): Promise<AISummaryResponse> {
    if (!NGROK_BASE_URL) {
      throw new Error('AI service is not configured');
    }

    const formData = new FormData();
    
    // Convert Buffer to Blob for file upload
    const blob = this.bufferToBlob(file, 'application/pdf');
    formData.append('file', blob, filename);
    formData.append('level', level);

    try {
      console.log(`Sending request to: ${NGROK_BASE_URL}/summarize/pdf`);
      console.log('Headers:', {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      });
      
      const response = await fetch(`${NGROK_BASE_URL}/summarize/pdf`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Response body:', responseText);

      if (!response.ok) {
        throw new Error(`AI service error (${response.status}): ${responseText}`);
      }
      
      const result = JSON.parse(responseText);
      return {
        summary: result.summary,
        level,
        status: 'success'
      };
    } catch (error) {
      console.error('Error calling external AI service:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to process PDF. Please try again later.');
    }
  }

  async askPdfQuestion(file: Buffer, filename: string, question: string): Promise<AIAskResponse> {
    if (!NGROK_BASE_URL) {
      throw new Error('AI service is not configured');
    }

    const formData = new FormData();
    
    // Convert Buffer to Blob for file upload
    const blob = this.bufferToBlob(file, 'application/pdf');
    formData.append('file', blob, filename);
    formData.append('question', question);

    try {
      console.log(`Sending request to: ${NGROK_BASE_URL}/ask/pdf`);
      console.log('Headers:', {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      });
      
      const response = await fetch(`${NGROK_BASE_URL}/ask/pdf`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Response body:', responseText);

      if (!response.ok) {
        throw new Error(`AI service error (${response.status}): ${responseText}`);
      }
      
      const result = JSON.parse(responseText);
      return {
        answer: result.answer
      };
    } catch (error) {
      console.error('Error calling external AI service:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to process PDF question. Please try again later.');
    }
  }

  // Health check to verify connection to AI service
  async healthCheck(): Promise<boolean> {
    if (!NGROK_BASE_URL) {
      console.error('NGROK_BASE_URL is not set');
      return false;
    }

    // Ensure the base URL doesn't end with a slash
    const baseUrl = NGROK_BASE_URL.endsWith('/') 
      ? NGROK_BASE_URL.slice(0, -1) 
      : NGROK_BASE_URL;

    const healthCheckUrl = `${baseUrl}/`;
    console.log(`Performing health check on: ${healthCheckUrl}`);

    try {
      const response = await fetch(healthCheckUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log(`Health check status: ${response.status} ${response.statusText}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Health check failed: ${response.status} - ${errorText}`);
      }
      
      return response.ok;
    } catch (error) {
      console.error('AI service health check failed:', error);
      return false;
    }
  }
}