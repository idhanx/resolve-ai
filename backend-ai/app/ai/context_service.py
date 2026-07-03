"""
context_service.py

Builds enterprise context for the AI reasoning engine.
Currently returns mock/demo data.
Later this will query PostgreSQL.
"""

from typing import Dict, Any


class ContextService:

    def get_employee_context(
        self,
        employee_id: int | None = None
    ) -> Dict[str, Any]:

        # TODO:
        # Replace with PostgreSQL query

        return {

            "employeeId": employee_id,

            "employeeName": "John Doe",

            "designation": "Software Engineer",

            "department": "Engineering",

            "manager": "David Wilson",

            "location": "Coimbatore",

            "employmentType": "Full Time",

            "experienceYears": 2,

            "tenureYears": 1.5,

            "previousComplaints": 1,

            "resolvedComplaints": 1
        }

    # ---------------------------------------

    def get_department_context(
        self,
        department: str
    ) -> Dict[str, Any]:

        # TODO:
        # Replace with database query

        return {

            "department": department,

            "employeeCount": 52,

            "openComplaints": 8,

            "resolvedComplaints": 23,

            "averageResolutionDays": 6,

            "manager": "David Wilson"

        }

    # ---------------------------------------

    def build_context(
        self,
        employee_id: int | None = None,
        department: str = "Engineering"
    ) -> Dict[str, Any]:

        employee = self.get_employee_context(
            employee_id
        )

        department_info = self.get_department_context(
            department
        )

        return {
            "employeeId": employee["employeeId"],
            "employeeName": employee["employeeName"],
            "department": department_info["department"],
            "manager": employee["manager"],
            "designation": employee["designation"],
            "previousComplaints": employee["previousComplaints"],
            "resolvedComplaints": employee["resolvedComplaints"],
            "departmentOpenComplaints": department_info["openComplaints"],
            "averageResolutionDays": department_info["averageResolutionDays"],
        }


# Singleton

context_service = ContextService()
