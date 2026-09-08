import sqlite3


def init_db():
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            priority TEXT,
            due_date TEXT NOT NULL
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS completed_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            priority TEXT,
            due_date TEXT NOT NULL
        )
        ''')

    cursor.execute(''' 
        CREATE TABLE IF NOT EXISTS future_task_room (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER NOT NULL,
            role TEXT NOT NULL,
            content TEXT not null,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()

def add_task(title, description,priority, due_date):
    # add new tasks into the tasks table with all 4 categoriws
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO tasks (title, description, priority, due_date)
        VALUES (?, ?, ?, ?)
    ''', (title, description, priority, due_date))
    conn.commit()
    conn.close()

def get_tasks():
    # get all the the active (pending) tasks
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM tasks')
    tasks = cursor.fetchall()
    conn.close()
    return tasks


def get_num_tasks():
    # get num of pending tasks
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM tasks')
    count = cursor.fetchone()[0]
    conn.close()
    return count

def search_tasks(keyword):
    # return tasks that contain the keyword
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM tasks
        WHERE title LIKE ? OR description LIKE ?
    ''', (f'%{keyword}%', f'%{keyword}%'))
    results = cursor.fetchall()
    conn.close()
    return results

def due_today():
    # check the date today and see what due_date matches with today and return the matches
    from datetime import datetime
    today = datetime.now().strftime('%Y-%m-%d')
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM tasks WHERE due_date = ?', (today,))
    results = cursor.fetchall()
    conn.close()
    return results

def get_completed_tasks():
    # get all the tasks in the completed 
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM completed_tasks')
    results = cursor.fetchall()
    conn.close()
    return results

def num_completed_task():
    #number of completed tasks
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM completed_tasks')
    count = cursor.fetchone()[0]
    conn.close()
    return count

def due_upcoming():
    # due upcoming and not today
    from datetime import datetime
    today = datetime.now().strftime('%Y-%m-%d')
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    today = datetime.now().strftime('%Y-%m-%d')
    cursor.execute('SELECT * FROM tasks WHERE due_date > ?', (today, ))
    results = cursor.fetchall()
    conn.close()
    return results

def add_completed_task(task_id):
    conn = sqlite3.connect('app.db')
    try:
        cursor = conn.cursor()
        cursor.execute(
            'SELECT title, description, priority, due_date FROM tasks WHERE id = ?',
            (task_id,)
        )
        task = cursor.fetchone()

        if task is None:
            return False

        cursor.execute('''
            INSERT INTO completed_tasks (title, description, priority, due_date)
            VALUES (?, ?, ?, ?)
        ''', task)
        cursor.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
        conn.commit()
        return True
    finally:
        conn.close()

def delete_task(id):
    # edited this by mistake lmao
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM tasks WHERE id=?', (id,))
    conn.commit()
    conn.close()
    return True


def delete_completed_task():
    # delete ALL completed tasks
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute("DELETE FROM completed_tasks")
    deleted = cursor.rowcount
    conn.commit()
    conn.close()
    return deleted


def edit_task(id, title, description, priority, due_date):
    conn = sqlite3.connect("app.db")
    cursor = conn.cursor()
    cursor.execute("UPDATE tasks SET title =?, description=?, priority=?, due_date=? WHERE id=?", (title, description, priority, due_date, id))
    updated = cursor.rowcount
    conn.commit()
    conn.close()
    return updated>0 # probably true of false, if false would be like nothing changed and will work basically as back buttons

def get_overdue_tasks():
    from datetime import datetime, timedelta
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM tasks WHERE due_date <= ?', (yesterday,))
    overdue = cursor.fetchall()
    conn.close()
    return overdue


def save_future_message(task_id, role, content):
    if role not in ["user", "assistant"]:
        raise ValueError("app.db")

    conn = sqlite3.connect("app.db")
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO future_task_room (task_id, role, content)
        VALUES (?, ?, ?)
        """, (task_id, role, content))

    message_id = cursor.lastrowid

    conn.commit()
    conn.close()
    return message_id

def get_task_by_id(task_id):
    conn = sqlite3.connect("app.db")
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT id, title, description, priority, due_date
        FROM tasks
        WHERE id = ?
        """,
        (task_id,)
    )
    task = cursor.fetchone()
    conn.close()
    return task

def get_task_messages(task_id):
    # get all messages for a specific task from the future_task_room table
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT role, content, created_at
        FROM future_task_room
        WHERE task_id = ?
        ORDER BY created_at ASC
    ''', (task_id,))
    messages = cursor.fetchall()
    conn.close()
    return messages