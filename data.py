import csv
import random
from datetime import datetime, timedelta

random.seed(42)

departments = [
    "Engineering",
    "Technology",
    "Operations",
    "Finance",
    "HR",
    "Sales",
    "Marketing"
]

leadership = [
    (
        "Manager humiliates employees during meetings.",
        "Leadership Coaching Program"
    ),
    (
        "Manager never appreciates employee work.",
        "Monthly One-on-One Meetings"
    ),
    (
        "Engineering decisions are ignored by management.",
        "Technical Review Board Introduced"
    ),
    (
        "Manager shouts during sprint reviews.",
        "Manager Performance Improvement Plan"
    ),
]

career = [
    (
        "Promotion process lacks transparency.",
        "Career Progression Framework"
    ),
    (
        "No promotion criteria for senior engineers.",
        "Engineering Career Ladder"
    ),
    (
        "Career growth discussions never happen.",
        "Quarterly Career Reviews"
    ),
]

compensation = [
    (
        "Salary increment delayed.",
        "Compensation Review Committee"
    ),
    (
        "Bonus policy is unclear.",
        "Published Bonus Guidelines"
    ),
    (
        "Market salary adjustment pending.",
        "Salary Benchmark Review"
    ),
]

developer = [
    (
        "Build pipeline takes 45 minutes.",
        "CI/CD Optimization"
    ),
    (
        "Legacy monolith slows development.",
        "Microservice Migration"
    ),
    (
        "No automated testing.",
        "QA Automation Pipeline"
    ),
]

environment = [
    (
        "Office AC not working.",
        "Facilities Maintenance"
    ),
    (
        "Poor ergonomic chairs.",
        "Workspace Upgrade"
    ),
    (
        "Meeting rooms unavailable.",
        "Workspace Expansion"
    ),
]

templates = {
    "Leadership": leadership,
    "Career Development": career,
    "Compensation": compensation,
    "Developer Experience": developer,
    "Work Environment": environment,
}

managers = [
    "David Wilson",
    "Sarah Johnson",
    "Michael Brown",
    "Emily Davis",
    "Robert Taylor"
]

rows = []

complaint_id = 1

for category, examples in templates.items():

    for _ in range(50):

        complaint, resolution = random.choice(examples)

        status = random.choices(

            ["Resolved", "In Progress", "Submitted"],

            weights=[60,25,15]

        )[0]

        department = random.choice(departments)

        manager = random.choice(managers)

        created = datetime(2026,1,1) + timedelta(
            days=random.randint(0,180)
        )

        resolved = ""

        if status == "Resolved":

            resolved = (
                created + timedelta(
                    days=random.randint(3,20)
                )
            ).strftime("%Y-%m-%d")

        rows.append({

            "id": complaint_id,

            "employee_id": random.randint(1001,1150),

            "department": department,

            "manager": manager,

            "category": category,

            "description": complaint,

            "resolution": resolution,

            "status": status,

            "priority": random.choice(

                [

                    "Low",

                    "Medium",

                    "High",

                    "Critical"

                ]

            ),

            "created_at": created.strftime("%Y-%m-%d"),

            "resolved_at": resolved

        })

        complaint_id += 1

with open(

    "synthetic_rag_data.csv",

    "w",

    newline=""

) as file:

    writer = csv.DictWriter(

        file,

        fieldnames=rows[0].keys()

    )

    writer.writeheader()

    writer.writerows(rows)

print(

    f"Generated {len(rows)} complaints."

)