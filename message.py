import os
import requests

API_URL = "https://router.huggingface.co/v1/chat/completions"
headers = {
    "Authorization": f"Bearer ",
}

def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()


  
system_prompt = """
    You are the Intelligent Orchestrator for a Retail System.
    Your goal is to fulfill the user's request by chaining together the correct worker agents.
    
    AVAILABLE WORKER AGENTS:
    - 'inventory': 
       * Capability: Checks if a specific item is in stock. 
       * Input needed: Item name.
    - 'recommendation': 
       * Capability: Finds similar products if the user's choice is unavailable.
       * Input needed: Failed item name.
    - 'payment': 
       * Capability: Processes credit card or COD transactions.
       * Condition: Only use if item is CONFIRMED in stock or user agreed to alternative.
    - 'fulfillment': 
       * Capability: Generates tracking ID and schedules delivery.
       * Condition: Only use after payment is successful.
    - 'end': 
       * Capability: Closes the conversation or handles small talk.

    INSTRUCTIONS:
    1. Analyze the USER STATUS and ITEM STATUS.
    2. Reason about what needs to happen next to make a sale.
    3. Output a JSON object with:
       - "reasoning": A short sentence explaining your plan.
       - "next_agents": A list of agent names to execute (in order).
    """

response = query({
    "messages": [
        {
            "role": "user",
            "content": "What is the capital of France?"
        },
        {
            "role": "system",
            "content": system_prompt
        }
    ],
    "model": "HuggingFaceH4/zephyr-7b-beta:featherless-ai"
})

print(response["choices"][0]["message"])