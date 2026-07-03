from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

response = client.chat.completions.create(
    model=os.getenv("GROQ_MODEL"),
    messages=[
        {
            "role":"user",
            "content":"Say Hello"
        }
    ]
)

print(response.choices[0].message.content)