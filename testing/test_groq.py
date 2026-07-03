"""
Test Groq API connection.
Requires GROQ_API_KEY in backend-ai/.env or environment.
Run from project root:
    python3 testing/test_groq.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend-ai"))

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / "backend-ai" / ".env")

import os
from groq import Groq

api_key = os.getenv("GROQ_API_KEY")
model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

if not api_key:
    print("❌ GROQ_API_KEY not set. Add it to backend-ai/.env")
    sys.exit(1)

client = Groq(api_key=api_key)

response = client.chat.completions.create(
    model=model,
    messages=[{"role": "user", "content": "Say Hello in one sentence."}],
)

print(f"✅ Groq ({model}) response:")
print(response.choices[0].message.content)
