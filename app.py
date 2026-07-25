from flask import Flask, jsonify, request
from app_db import add_task, init_db



app = Flask(__name__)

init_db()

@app.route('/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    due_date = data.get('due_date')

    if not title or not due_date:
        return jsonify({'error': 'Title and due date are required'}), 400

    add_task(title, description, due_date)
    return jsonify({'message': 'Task created successfully'}), 201

if __name__ == '__main__':
    app.run(debug=True)
