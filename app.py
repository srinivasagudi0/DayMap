import json
from flask import Flask, jsonify, request
from app_db import add_task, init_db, get_num_tasks, search_tasks, due_today, num_completed_task, due_upcoming, add_completed_task, delete_task, get_completed_tasks, delete_completed_task, edit_task, get_overdue_tasks, get_task_by_id, get_task_messages, save_future_message
from openai import OpenAI
import os
from datetime import datetime



app = Flask(__name__)

init_db()

def quick_add_with_ai(task):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    prompt = '''Create a json that is like this:
    {"title": "Task title", "description": "Task description", "priority": "low|medium|high", "due_date": "YYYY-MM-DD"}
    Just vgive pure working json without any explanation or text. The task is:
    ''' + task + f" as of {datetime.now().strftime('%Y-%m-%d')}"

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    return response.choices[0].message.content.strip()


@app.route('/tasks', methods=['POST'])
def create_task():
    data = request.get_json(silent=True) or {}

    # had to do a lot of error handling to know what work s
    if not isinstance(data, dict):
        return jsonify({'error': 'Request body must be a JSON object'}), 400

    task = (data.get('text') or '').strip()

    if not task:
        return jsonify({'error': 'Missing task text'}), 400

    try:
        task_data = quick_add_with_ai(task)
    except Exception as error:
        return jsonify({'error': f'Could not create task with AI: {error}'}), 500

    # Parse the JSON response
    try:
        task_json = json.loads(task_data)
    except json.JSONDecodeError:
        return jsonify({'error': 'AI returned invalid JSON'}), 500

    title = task_json.get('title')
    description = task_json.get('description')
    due_date = task_json.get('due_date')
    priority = task_json.get('priority')

    if not title or not due_date:
        return jsonify({'error': 'AI response is missing a title or due date'}), 500

    add_task(title, description, priority, due_date)
    return jsonify({'message': f'Task: {title} \n {description} \n {due_date}'}), 201

@app.route('/tasks/count')
def get_task_count():
    return jsonify({'count': get_num_tasks()})


@app.route('/tasks/search', methods=['GET'])
def search_task():
    keyword = request.args.get('keyword', '').strip()

    results = search_tasks(keyword)
    return jsonify({'results': results}), 200

@app.route('/todays-tasks')
def due_tasks():
    tasks = due_today()
    return jsonify({"due": tasks})

@app.route('/num/completed-tasks')
def num_completed():
    num = num_completed_task()
    return jsonify({"num": num})

@app.route('/tasks/manual-add', methods=['POST'])
def manual_add():
    print("Received the meessage")
    data = request.get_json() or {}

    title = data.get('title')
    description = data.get('description')
    priority = data.get('priority')
    due_date = data.get('due_date')

    if not title or not description or not priority or not due_date:
        return {"ok": False}

    try:
        add_task(title, description, priority, due_date )
        return jsonify({"ok": True, "message": "Task was succesfully saved."})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)})



@app.route('/complete-task', methods=['POST'])
def complete_a_task():
    data = request.get_json(silent=True) or {}
    task_id = data.get('id')

    if task_id is None:
        return jsonify({"ok": False, "error": "Missing task id"}), 400

    try:
        completed = add_completed_task(task_id)
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

    if not completed:
        return jsonify({"ok": False, "error": "Task not found"}), 404

    return jsonify({"ok": True, "message": "Task completed"})


@app.route('/delete-task', methods=['POST'])
def delete_a_taks():
    data = request.get_json(silent=True) or {}
    task_id = data.get('id')

    if task_id is None:
        return jsonify({"ok": False, "error": "Missing task id"}), 400
    try:
        delete = delete_task(task_id)
    except Exception as error:
        return jsonify({"ok": False, "error": str(error)})
    if not delete:
        return jsonify({"ok": True, "error": 'Task not found'})
    return jsonify({"ok": True, "message": "Task deleted"})

@app.route('/upcoming-tasks')
def get_upcoming():
    upcoming = due_upcoming()
    return jsonify({"tasks": upcoming})

@app.route("/completed-tasks")
def get_completed():
    completed = get_completed_tasks()
    return jsonify({"completed": completed, "ok": True})

@app.route('/delete/completed-tasks', methods=['DELETE'])
def delete_completed_tasks():
    deleted_count = delete_completed_task()
    return jsonify({
                "ok": True,
                "message": f"Cleared {deleted_count} completed tasks"})

@app.route("/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    try:
        data = request.get_json(silent=True) or {}
        title = (data.get("title") or "").strip()
        description = (data.get("description") or "").strip()
        priority = (data.get("priority") or "").strip()
        due_date = (data.get("due_date") or "").strip()

        if not title or not priority or not due_date:
            return jsonify({
                "ok": False,
                "message": "Please fill the required feilds(tasks, priority, & due_date"
            })

        if priority not in ["low", "medium", "high"]:
            return jsonify({
                "ok": False,
                "message": "Please choose a priority for your task."
            })

        editing_task = edit_task(task_id, title, description,priority, due_date)

        if editing_task:
            return jsonify({
                "ok": True,
                "message": "Your Task has been changed successfully!"
            })
        else: 
            return jsonify({
                "ok": True,
                "message": "Your task is as is before and after the edit. "
            })
    except Exception as e:
        return jsonify({"ok": "False", "error": f"AN ERROR SAYS: {e}"})

@app.route('/overdue-tasks')
def give_overdue_tasks():
    tasks = get_overdue_tasks()
    if not tasks:
        return jsonify({'ok': True, 'visible': False, "tasks": 0})
    return jsonify({"ok": True, "visible": True, "tasks": tasks})

@app.route("/tasks/<int:task_id>/future-room")
def get_future_room(task_id):
    try:
        task = get_task_by_id(task_id)

        if task is None:
            return jsonify({
                "ok": False,
                "error": "Task not found"
            }), 404

        messages = get_task_messages(task_id)
        return jsonify({"ok": True, "task": task, "messages": messages})

    except Exception as e:
        return jsonify({"ok": False, "error": str(e) }), 500


def get_future_ai_answer(task, messages):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    conversation = [
        {
            "role": message[0],
            "content": message[1]
        }
        for message in messages
    ]

    response = client.responses.create(
        model="gpt-5.6-sol",
        reasoning={"effort": "medium"},
        instructions = f"""
            You are Future AI, a focused task-completion assistant.

            The user's current task is:
            Title: {task[1]}
            Description: {task[2]}
            Priority: {task[3]}
            Due date: {task[4]}
            !! Your first message should mostly be turning the users task into a visible path of 3-6 checkpoints. As the conversation progresses, checkpoints become Completed.
            Instead of overwhelming the user, explain exactly one action like 'Your next move: Write one sentence explaining what a proton does.'
            Help the user make real progress on this exact task.
            Be concise, practical, and encouraging.
            Do not discuss unrelated subjects.
            Never mark or delete the task automatically.
            If the user says the task is finished, ask them to confirm completion.
        """, # chatgpt wrote this prompt man.
        input = conversation
    )

    return response.output_text.strip()

@app.route("/tasks/<int:task_id>/future-room", methods=["POST"]) # forgot to put this 
def post_future_message(task_id):
    try:
        task = get_task_by_id(task_id)

        if task is None:
            return jsonify({
                "ok": False,
                "error": "Task not found"
            }), 404

        data = request.get_json(silent=True) or {}
        content = (data.get("content") or "").strip()

        if not content:
            return jsonify({
                "ok": False,
                "error": "Message cannot be empty",
            }), 400

        

        message_id = save_future_message(
            task_id,
            "user",
            content
        )

        messages = get_task_messages(task_id)
        assistant_content= get_future_ai_answer(task, messages)

        assistant_id = save_future_message(
            task_id,
            "assistant",
            assistant_content
        )

        return jsonify({
            "ok": True,
            "user_message": {
                "id": message_id,
                "role": "user",
                "content": content
            },
            "assistant_message": {
                "id": assistant_id,
                "role": "assistant",
                "content": assistant_content
            }
        }), 201

    except Exception as e:
        return jsonify({
            "ok": False,
            "error": str(e)
        })

@app.route("/tasks/<int:task_id>/future-sprint-message", methods=["POST"])
def future_sprint_message(task_id):
    data = request.get_json(silent=True) or {}
    event_type = data.get("event_type")
    minutes = data.get("minutes", 10)

    task = get_task_by_id(task_id)

    if not task:
        return jsonify({
            "ok": False,
            "error": f"Task no.{task_id} not found, check it if it is db or soemthing."
        })

    title = task[1]
    description = task[2]

    if event_type == "start":
        if description:
            content = (
                f"Your {minutes} minute Future Sprint has started. "
                f"Focus on {title}: {description}"
                "Work and come back and I will be avialble if you need to ask me."
            )
        else:
            content = (
                f"Your {minutes} minutes Future Sprint has started"
                f"Focus on the clearest next step for {title}. "
                "Come back with some real progress."
            )

    else:
        pass

if __name__ == '__main__':
    app.run(debug=True)
