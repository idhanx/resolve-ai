import os
import requests
from dotenv import load_dotenv

load_dotenv()


class ComplaintClient:

    def __init__(self):

        self.url = os.getenv("AI_SERVICE_URL")

    def predict(self, complaint):

        response = requests.post(

            self.url,

            json={

                "text": complaint

            },

            timeout=30

        )

        response.raise_for_status()

        return response.json()


client = ComplaintClient()