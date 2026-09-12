import sqlite3

db = 'app.db'

def delete():
    conn = sqlite3.connect(db)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM future_task_room')
    conn.commit()
    conn.close()
    return "done"

a = delete()

print(a)