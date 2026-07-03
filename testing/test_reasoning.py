from ai.pipeline.reasoning_engine import reasoning_engine
result = reasoning_engine.analyze(

    complaint="My manager humiliates employees during meetings and never appreciates our work.",

    employee_context={

        "department": "Engineering",

        "designation": "Software Engineer",

        "experience": 2,

        "previousComplaints": 1

    },

    similar_cases=[]

)

print(result)