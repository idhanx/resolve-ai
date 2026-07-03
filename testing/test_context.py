from ai.context_service import context_service

context = context_service.build_context(
    employee_id=101,
    department="Engineering"
)

print(context)