"""
history_service.py

Enterprise Knowledge Service

Checks whether a complaint has already been solved
and returns previous resolutions.

Currently uses demo data.

Later:
PostgreSQL
↓
Vector Search
↓
Enterprise Knowledge Base
"""

from typing import List, Dict


class HistoryService:

    def __init__(self):

        # Demo knowledge base
        self.history = [

            {
                "id": 101,
                "category": "Leadership",
                "keywords": [
                    "manager",
                    "humiliate",
                    "shout",
                    "respect",
                    "feedback"
                ],
                "resolution": "Leadership Coaching Program",
                "owner": "HR",
                "status": "Resolved",
                "days": 14
            },

            {
                "id": 102,
                "category": "Compensation",
                "keywords": [
                    "salary",
                    "increment",
                    "bonus",
                    "pay"
                ],
                "resolution": "Compensation Review Committee",
                "owner": "Finance + HR",
                "status": "Resolved",
                "days": 18
            },

            {
                "id": 103,
                "category": "Work Environment",
                "keywords": [
                    "chair",
                    "ac",
                    "office",
                    "desk",
                    "equipment"
                ],
                "resolution": "Facilities Maintenance",
                "owner": "Admin",
                "status": "Resolved",
                "days": 5
            }

        ]

    # --------------------------------------------------

    def find_existing_solution(
        self,
        complaint: str
    ) -> Dict:

        complaint = complaint.lower()

        best_match = None

        highest_score = 0

        for item in self.history:

            score = 0

            for keyword in item["keywords"]:

                if keyword in complaint:

                    score += 1

            if score > highest_score:

                highest_score = score

                best_match = item

        if best_match:

            return {

                "found": True,

                "matchScore": highest_score,

                "caseId": best_match["id"],

                "resolution": best_match["resolution"],

                "owner": best_match["owner"],

                "status": best_match["status"],

                "resolvedInDays": best_match["days"]

            }

        return {

            "found": False

        }


history_service = HistoryService()