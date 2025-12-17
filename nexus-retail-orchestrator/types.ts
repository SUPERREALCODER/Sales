export interface OrchestratorResponse {
  thought_process: string;
  plan: AgentName[];
  response_to_user: string;
}

export type AgentName = 
  | 'inventory_agent'
  | 'recommendation_agent'
  | 'payment_agent'
  | 'fulfillment_agent'
  | 'loyalty_agent';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  messageType?: 'text' | 'qr_code'; // Added to distinguish QR messages
  metadata?: {
    thought_process?: string;
    plan?: AgentName[];
  };
}

export interface SharedState {
  cart: CartItem[];
  userContext: {
    id: string;
    loyaltyTier: string;
    points: number;
    preferences: string[];
  };
  lastAgentResult?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}