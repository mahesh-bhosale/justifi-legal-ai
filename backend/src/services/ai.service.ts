import { AISummaryRequest, AIAskRequest, AISummaryResponse, AIAskResponse, AIChatResponse } from '../utils/types/ai.types';

const NGROK_QA = process.env.NGROK_QA;
const NGROK_SUMMARY = process.env.NGROK_SUMMARY;

if (!NGROK_QA) {
  console.warn('NGROK_QA environment variable is not set. Question answering service will not be available.');
} else {
  console.log(`Using QA service at: ${NGROK_QA}`);
}

if (!NGROK_SUMMARY) {
  console.warn('NGROK_SUMMARY environment variable is not set. Summary service will not be available.');
} else {
  console.log(`Using Summary service at: ${NGROK_SUMMARY}`);
}

export class AIService {
  async summarizeText(request: AISummaryRequest): Promise<AISummaryResponse> {
    if (!NGROK_SUMMARY) {
      throw new Error('Summary service is not configured');
    }

    try {
      const formData = new FormData();
      formData.append('text', request.text);
      formData.append('level', request.level);

      const response = await fetch(`${NGROK_SUMMARY}/summarize/text`, {
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
    if (!NGROK_QA) {
      throw new Error('QA service is not configured');
    }

    const formData = new FormData();
    formData.append('question', request.question);
    formData.append('text', request.context);

    const response = await fetch(`${NGROK_QA}/ask/text`, {
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
    if (!NGROK_SUMMARY) {
      throw new Error('Summary service is not configured');
    }

    const formData = new FormData();
    
    // Convert Buffer to Blob for file upload
    const blob = this.bufferToBlob(file, 'application/pdf');
    formData.append('file', blob, filename);
    formData.append('level', level);

    try {
      console.log(`Sending request to: ${NGROK_SUMMARY}/summarize/pdf`);
      console.log('Headers:', {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      });
      
      const response = await fetch(`${NGROK_SUMMARY}/summarize/pdf`, {
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
    if (!NGROK_QA) {
      throw new Error('QA service is not configured');
    }

    const formData = new FormData();
    
    // Convert Buffer to Blob for file upload
    const blob = this.bufferToBlob(file, 'application/pdf');
    formData.append('file', blob, filename);
    formData.append('question', question);

    try {
      console.log(`Sending request to: ${NGROK_QA}/ask/pdf`);
      console.log('Headers:', {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      });
      
      const response = await fetch(`${NGROK_QA}/ask/pdf`, {
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

  async simpleChat(message: string): Promise<AIChatResponse> {
    if (!NGROK_QA) {
      throw new Error('Chat service is not configured');
    }

    try {
      const formData = new FormData();
      formData.append('message', message);

      const response = await fetch(`${NGROK_QA}/chat/simple`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Chat service error:', errorText);
        throw new Error(errorText || 'Failed to get response from chat service');
      }

      const result = await response.json();
      return {
        reply: result.reply || '',
        message: result.message || message,
        status: 'success'
      };
    } catch (error) {
      console.error('Error calling chat service:', error);
      throw new Error(error instanceof Error ? error.message : 'Chat service is currently unavailable. Please try again later.');
    }
  }

  // Health check to verify connection to both AI services
  async healthCheck(): Promise<boolean> {
    const qaHealthy = await this.checkServiceHealth(NGROK_QA, 'QA');
    const summaryHealthy = await this.checkServiceHealth(NGROK_SUMMARY, 'Summary');
    
    return qaHealthy && summaryHealthy;
  }

  private async checkServiceHealth(baseUrl: string | undefined, serviceName: string): Promise<boolean> {
    if (!baseUrl) {
      console.error(`${serviceName} service URL is not set`);
      return false;
    }

    // Ensure the base URL doesn't end with a slash
    const cleanUrl = baseUrl.endsWith('/') 
      ? baseUrl.slice(0, -1) 
      : baseUrl;

    const healthCheckUrl = `${cleanUrl}/`;
    console.log(`Performing health check on ${serviceName} service: ${healthCheckUrl}`);

    try {
      const response = await fetch(healthCheckUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log(`${serviceName} service health check status: ${response.status} ${response.statusText}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`${serviceName} service health check failed: ${response.status} - ${errorText}`);
      }
      
      return response.ok;
    } catch (error) {
      console.error(`${serviceName} service health check failed:`, error);
      return false;
    }
  }
}