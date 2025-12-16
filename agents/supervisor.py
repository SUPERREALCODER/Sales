# agents/supervisor.py
import requests

def supervisor_node(state: dict):
    # 1. READ INPUT & CONTEXT
    last_message = state["messages"][-1] if state["messages"] else ""
    current_status = state.get("item_status")
    previous_step = state.get("next_step")

    API_URL = "https://router.huggingface.co/hf-inference/models/facebook/bart-large-mnli"
    headers = {
                "Authorization": f"Bearer ",
        }   

    def query(payload):
        response = requests.post(API_URL, headers=headers, json=payload)
        return response.json()

    output = query({
       "inputs": last_message,
         "parameters": {
             "candidate_labels": [
        "purchase inquiry",      # "I want to buy..."
        "check inventory",       # "Do you have stock?"
        "payment issue",         # "My card failed"
        "shipping status",       # "Where is my order?"
        "affirmation",           # "Yes", "Okay"
        "denial"                 # "No", "Cancel"
        ]
         }
        })
    print(output[0]["label"])
    
    # 2. DECIDE NEXT STEP (The "Brain")
    
    # Case A: User wants to buy something (Initial Trigger)
    if "buy" in last_message.lower() and not current_status:
        # Simple extraction logic for demo
        item_name = last_message.replace("buy", "").replace("I want to", "").strip()
        print(f"[Master Agent]: Intent 'Purchase' detected for '{item_name}'. Checking Inventory.")
        return {"next_step": "inventory", "cart_item": item_name}
    
    elif previous_step == "payment":
        return {"next_step": "fulfillment"}
    
    elif previous_step == "fulfillment":
        return {"next_step": "end"}
    
    # Case B: Inventory said "Out of Stock" (THE AGENTIC EDGE CASE)
    elif current_status == "out_of_stock" and previous_step != "recommendation":
        print("[Master Agent]: Item is missing. Triggering Recommendation Strategy.")
        # We pivot instead of failing
        return {"next_step": "recommendation"}

    # Case C: User accepts the recommendation (or item was in stock)
    elif "yes" in last_message.lower() or previous_step == "recommendation":
        # If it was in stock OR they said yes to the blue shirt -> Pay
        print("[Master Agent]: Moving to Payment.")
        return {"next_step": "payment"}
        
    # Case D: Payment done, move to fulfillment
    
        
    # Case E: Done
    else:
        return {"next_step": "end"}