import sqlite3


def init_db():
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            due_date TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def add_task(title, description, due_date):
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO tasks (title, description, due_date)
        VALUES (?, ?, ?)
    ''', (title, description, due_date))
    conn.commit()
    conn.close()

def get_tasks():
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM tasks')
    tasks = cursor.fetchall()
    conn.close()
    return tasks