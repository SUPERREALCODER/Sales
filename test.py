import requests
import json

# --- CONFIGURATION ---
API_URL = "https://router.huggingface.co/v1/chat/completions"
# Ideally, keep your token safe in an environment variable, but for testing:
HF_TOKEN = "" # Your token from the snippet

headers = {
    "Authorization": f"Bearer {HF_TOKEN}",
    "Content-Type": "application/json"
}

def ask_llm_for_next_step(last_message, item_status="unknown"):
    """
    The 'Brain' of the agent. 
    Input: Current chat context.
    Output: The exact name of the next tool to run.
    """
    
    # 1. DEFINE THE SYSTEM PROMPT (The Rules)
    # This tells the LLM exactly how to behave.
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

    # 2. DEFINE THE USER CONTEXT (The Current Situation)
    user_context = f"""
    CURRENT STATUS:
    Last Message: "{last_message}"
    Item Status: "{item_status}"
    
    What is the next agent?
    """

    payload = {
        "model": "HuggingFaceH4/zephyr-7b-beta:featherless-ai", # Standard Zephyr model
        "messages": [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_context
            }
        ],
        "temperature": 0.1, # Keep it logical/strict
        "max_tokens": 250    # We only need one word
    }

    print(f"\n--- Thinking for: '{last_message}' (Status: {item_status}) ---")

    try:
        response = requests.post(API_URL, headers=headers, json=payload)
        response.raise_for_status() # Raise error if 404/500
        
        data = response.json()
        
        # Extract the content from the Chat Completion format
        decision = data["choices"][0]["message"]["content"].strip().lower()
        
        # Clean up any extra punctuation (common with LLMs)
        clean_decision = decision.replace(".", "").replace("'", "")
        
        print(f"Decision: {clean_decision}")
        return clean_decision

    except Exception as e:
        print(f"Error: {e}")
        # If API fails, print the raw response to help debug
        if 'response' in locals():
            print(f"Raw API Response: {response.text}")
        return "end"

# --- TEST IT DIRECTLY ---
if __name__ == "__main__":
    
    # SCENARIO 1: Happy Path
    # Should print: inventory
    ask_llm_for_next_step("I want to buy a Blue Shirt", "unknown")
    
    # SCENARIO 2: The Edge Case (Failure Recovery)
    # Should print: recommendation
    ask_llm_for_next_step("I want to buy a Red Shirt", "out_of_stock")
    
    # SCENARIO 3: Closing the Deal
    # Should print: payment
    ask_llm_for_next_step("Yes, I'll take the recommended one", "unknown")