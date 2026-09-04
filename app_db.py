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
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM tasks where id = ?', (id,))
    conn.commit()
    conn.close()
    return True


