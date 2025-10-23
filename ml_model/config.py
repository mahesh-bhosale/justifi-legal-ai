import os
from dotenv import load_dotenv

load_dotenv()

# Model Configuration
MODEL_NAME = os.getenv("MODEL_NAME", "varma007ut/Indian_Legal_Assitant")
QUANTIZATION_BITS = int(os.getenv("QUANTIZATION_BITS", "4"))
MAX_INPUT_LENGTH = 2048

# Environment Variables
HF_TOKEN = os.getenv("HF_TOKEN", "")
NGROK_AUTH_TOKEN = os.getenv("NGROK_AUTH_TOKEN", "")

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# Summarization settings
SUMMARIZATION_CONFIG = {
    "short": {
        "max_new_tokens": 500,
        "instruction": "Summarize this legal case clearly and concisely in 3-4 sentences, focusing on the key facts, the main legal issue, and the final outcome. Ensure the summary is coherent, meaningful, and avoids repetition."
    },
    "medium": {
        "max_new_tokens": 1500,
        "instruction": "Provide a 1-2 paragraph summary of this legal case, including the key facts, legal issues, main arguments, and the court's decision. Make sure the summary is logical, meaningful, and avoids repeated content."
    },
    "long": {
        "max_new_tokens": 3000,
        "instruction": "Write a detailed summary of this legal case covering important facts, legal issues, arguments from both sides, judgment reasoning, and the final outcome. Ensure clarity, meaningfulness, and no redundant statements."
    },
    "very_long": {
        "max_new_tokens": 6000,
        "instruction": "Write a comprehensive and well-structured summary of this legal case, including all relevant details: facts, timeline of events, legal issues, arguments from both parties, reasoning behind the judgment, and the final outcome. Make the summary coherent, fully meaningful, and avoid any repetition."
    }
}