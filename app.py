import json
from flask import Flask, jsonify, request
from app_db import add_task, init_db
from openai import OpenAI
import os
from datetime import datetime



app = Flask(__name__)

init_db()

def quick_add_with_ai(task):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    prompt = '''Create a json that is like this:
    {"title": "Task title", "description": "Task description", "due_date": "YYYY-MM-DD"}
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
    data = request.get_json()
    task = data.get('text')
    task_data = quick_add_with_ai(task)

    # Parse the JSON response
    task_json = json.loads(task_data)
    title = task_json.get('title')
    description = task_json.get('description')
    due_date = task_json.get('due_date')

    add_task(title, description, due_date)
    return jsonify({'message': 'Task created successfully'}), 201

if __name__ == '__main__':
    app.run(debug=True)