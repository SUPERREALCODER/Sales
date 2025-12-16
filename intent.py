import os
import requests

API_URL = "https://router.huggingface.co/hf-inference/models/facebook/bart-large-mnli"
headers = {
    "Authorization": f"Bearer os.getenv('HF_API_KEY')",
}

def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    return response.json()

output = query({
       "inputs": "Hi, I want to buy a new shirt.",
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