# agents/tools.py

def inventory_node(state: dict):
    print("   [Inventory Agent]: Checking stock database...")
    item = state.get("cart_item", "").lower()
    
    # --- EDGE CASE SIMULATION ---
    # We force "red" items to fail to prove the agent can recover
    if "red" in item:
        print(f"   [Inventory Agent]: '{item}' is OUT OF STOCK.")
        return {"item_status": "out_of_stock"}
    else:
        print(f"   [Inventory Agent]: '{item}' is AVAILABLE.")
        return {"item_status": "in_stock"}

def recommendation_node(state: dict):
    print("   [Rec Agent]: Analyzing style preferences...")
    # Logic: If original failed, suggest an alternative
    return {"messages": ["System: Found alternative 'Blue Shirt' (Same Style)."]}

def payment_node(state: dict):
    print("   [Payment Agent]: Contacting Payment Gateway...")
    return {"messages": ["System: Payment Authorized."]}

def fulfillment_node(state: dict):
    print("   [Fulfillment Agent]: Allocating logicstics...")
    return {"messages": ["System: Order Shipped. Tracking ID: #BLU-999"]}