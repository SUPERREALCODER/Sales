import { AgentName } from '../types';

export const executeAgent = async (agent: AgentName, context: string): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  console.log(`Executing Agent: ${agent} with context: ${context}`);

  switch (agent) {
    case 'inventory_agent':
      return "INVENTORY_CHECK: Target 'Red Shirt' is OUT_OF_STOCK.";

    case 'recommendation_agent':
      return "RECOMMENDATION: Alternative found: 'Yellow Shirt' (High Similarity). Status: IN_STOCK.";

    case 'loyalty_agent':
      return "LOYALTY_CHECK: User 'usr_8821' is VIP_GOLD. ACTION: Authorize 15% Discount on substitute item.";

    case 'payment_agent':
      return "PAYMENT_GATEWAY: Transaction Authorized. Amount: $45.00. Method: Visa **** 4242.";

    case 'fulfillment_agent':
      return "LOGISTICS_HUB: Order #ORD-7782 queued. Service: Express Next-Day.";

    default:
      return `AGENT_ERROR: Unknown agent ${agent}`;
  }
};