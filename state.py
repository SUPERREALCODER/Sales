from typing import TypedDict, List, Optional

class RetailState(TypedDict):
    # Conversation History
    messages: List[str]
    
    # Context (User details & Session)
    user_id: str
    current_channel: str
    
    # Transaction State
    cart_item: Optional[str]
    item_status: Optional[str]  # e.g., "in_stock", "out_of_stock"
    
    # The Router Signal (Decides who goes next)
    next_step: str