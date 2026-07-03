"""
alert_service.py

Enterprise Alert Intelligence

Uses the AI analysis to determine
who should investigate the complaint.

No notifications are sent here.

This service ONLY generates
the alert object.
"""

from typing import Dict, List


class AlertService:

    def generate_alert(
        self,
        analysis: Dict,
        confidence: float,
        history_found: bool,
        similar_cases: int
    ) -> Dict:

        business = analysis.get("businessImpact", {})

        alerts = analysis.get("alerts", {})

        priority = business.get(
            "priority",
            "Low"
        )

        severity = alerts.get(
            "severity",
            "Low"
        )

        notify = self._determine_recipients(
            priority,
            severity,
            history_found,
            similar_cases
        )

        action = self._recommended_action(
            priority,
            severity
        )

        return {

            "severity": severity,

            "priority": priority,

            "confidence": confidence,

            "historyFound": history_found,

            "similarCases": similar_cases,

            "notify": notify,

            "recommendedAction": action

        }

    # --------------------------------------------

    def _determine_recipients(

        self,

        priority,

        severity,

        history_found,

        similar_cases

    ) -> List[str]:

        recipients = [

            "HR Executive"

        ]

        if severity in [

            "Medium",

            "High",

            "Critical"

        ]:

            recipients.append(

                "HR Manager"

            )

        if priority in [

            "High",

            "Critical"

        ]:

            recipients.append(

                "Department Head"

            )

        if history_found:

            recipients.append(

                "Employee Relations"

            )

        if similar_cases >= 3:

            recipients.append(

                "CHRO"

            )

        if (

            severity == "Critical"

            or priority == "Critical"

        ):

            recipients.append(

                "CEO"

            )

        return sorted(

            list(

                set(recipients)

            )

        )

    # --------------------------------------------

    def _recommended_action(

        self,

        priority,

        severity

    ):

        if severity == "Critical":

            return "Immediate executive investigation"

        if priority == "High":

            return "Open HR investigation within 24 hours"

        if severity == "Medium":

            return "Assign HR case owner"

        return "Monitor complaint"


alert_service = AlertService()