from app_db import get_task_by_id, get_task_messages

a = get_task_messages(1)
print("messages", a)

b = get_task_by_id(1)
print("task", b)