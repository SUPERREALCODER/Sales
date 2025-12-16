from langgraph.graph import StateGraph, END
from state import RetailState
# Import our modular agents
from agents.tools import inventory_node, recommendation_node, payment_node, fulfillment_node
from agents.supervisor import supervisor_node

# 1. SETUP THE GRAPH (Same wiring as before)
workflow = StateGraph(RetailState)

workflow.add_node("supervisor", supervisor_node)
workflow.add_node("inventory", inventory_node)
workflow.add_node("recommendation", recommendation_node)
workflow.add_node("payment", payment_node)
workflow.add_node("fulfillment", fulfillment_node)

def router(state):
    step = state.get("next_step")
    if step == "end":
        return END
    return step

workflow.add_conditional_edges(
    "supervisor",
    router,
    {
        "inventory": "inventory",
        "recommendation": "recommendation",
        "payment": "payment",
        "fulfillment": "fulfillment",
        END: END
    }
)

workflow.add_edge("inventory", "supervisor")
workflow.add_edge("recommendation", "supervisor")
workflow.add_edge("payment", "supervisor")
workflow.add_edge("fulfillment", "supervisor")

workflow.set_entry_point("supervisor")
app = workflow.compile()

# --- INTERACTIVE TERMINAL LOOP ---
if __name__ == "__main__":
    print("=== RETAIL AGENT (Interactive Mode) ===")
    print("Type 'quit' to exit. \nTry asking: 'I want to buy a Red Shirt' (to test failure) or 'Blue Shirt' (to test success).")

    # Initialize the "Shared Memory"
    current_state = {
        "messages": [],
        "user_id": "user_01",
        "current_channel": "terminal",
        "cart_item": None,
        "item_status": None,
        "next_step": None
    }

    while True:
        # 1. Get User Input
        user_input = input("\nYou: ")
        if user_input.lower() in ["quit", "exit"]:
            print("Exiting...")
            break
        
        # 2. Add input to State Memory
        current_state["messages"].append(user_input)
        
        # 3. Reset the router for the new turn
        # We assume the last turn ended, so we restart the routing logic
        current_state["next_step"] = None 

        # 4. Run the Graph (Stream allows us to see the thought process)
        print("Bot is thinking...")
        for event in app.stream(current_state):
            for node_name, state_update in event.items():
                # Update our local state with whatever the agent changed
                current_state.update(state_update)
                
                # Visual Debugging: Show which Agent is working
                print(f"   --> Agent '{node_name}' finished.")
                
                # If an agent added a message, print it as the "Bot Response"
                if "messages" in state_update:
                    latest_msg = state_update["messages"][-1]
                    # Don't print user messages, only bot system messages
                    if "System:" in latest_msg:
                        print(f"Bot: {latest_msg.replace('System:', '').strip()}")
        
        # 5. Handle the "Final Reply" from Supervisor if no specific tool replied
        # (This mimics the Master Agent summarizing the action)
        if current_state.get("next_step") == "end" and not any("System:" in msg for msg in current_state["messages"][-1:]):
             # If the loop finished without a tool message, the Master Agent speaks
             pass