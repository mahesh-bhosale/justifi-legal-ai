export interface AISummaryRequest {
    text: string;
    level: 'short' | 'medium' | 'long';
  }
  
  export interface AIAskRequest {
    question: string;
    context: string;
  }
  
  export interface AISummaryResponse {
    summary: string;
    level?: 'short' | 'medium' | 'long';
    status: 'success' | 'error';
    error?: string;
  }
  
  export interface AIAskResponse {
    answer: string | string[];
  }
  
  export interface AIUsageParams {
    userId?: string;
    ipAddress?: string;
    endpoint: string;
    usageCount?: number;
  }
  
  export interface RateLimitCheck {
    allowed: boolean;
    limit: number;
    used: number;
    remaining?: number;
    error?: string;
    resetTime?: string;
  }