from ai.rag_service import rag_service

cases = rag_service.retrieve_similar_cases(

    complaint="My manager humiliates employees and never appreciates them.",

    category="Leadership"

)

print(cases)

print()

print(
    rag_service.build_rag_context(cases)
)