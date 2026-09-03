import { useEffect, useState } from "react";

function Pending() {
    const [dueToday, setDueToday] = useState([]);

    useEffect(() => {
    fetch('/todays-tasks')
        .then(res => res.headers.get("content-type")?.includes("json") ? res.json() : [])
        .then(data => setDueToday(data.due || []))
        .catch(error => console.error('Error fetching tasks', error));
    }, []);

    const [completingId, setCompletingId] = useState(null);
    const [completeMessage, setCompleteMessage] = useState("");


    const [dueLater, setLater] = useState([]);
    useEffect(() => {
     fetch('/upcoming-tasks')
        .then(res => res.headers.get("content-type")?.includes("json") ? res.json() : [])
        .then(data => setLater(data.tasks || []))
        .catch(error => console.error('Error fetching tasks', error));
    }, []);

    const [completedTasks, setCompletedTasks] = useState([])
    useEffect(() => {
        fetch('/completing-tasks')
            .then(response => response.headers.get("content-type")?.includes("json") ? response.json() : [])
            .then(data => setCompletedTasks(data.completed))
            .catch(error => console.error('Error fetching tasks', error));
    }, []);


    
    async function completeTask(taskId, taskTitle) {
        const confirmed = window.confirm(`Completed "${taskTitle}"?`);

        if (!confirmed) return;

        setCompletingId(taskId);

        try {
            const response = await fetch('/complete-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: taskId }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Could not complete task');
            }

            setCompleteMessage(`${taskTitle} completed`)
            await new Promise(resolve => setTimeout(resolve, 500));
            setDueToday(tasks => tasks.filter(task => task[0] !== taskId));
            setTimeout(() => setCompleteMessage(""), 2000);
            window.location.reload();
        } catch(error) {
            console.error('Error completing task', error);
            setCompleteMessage(error.message);
        } finally {
            setCompletingId(null);
        }
    }
   
    const [deletingId, setDeletingId] = useState(null)
    const [deleteMessage, setDeleteMessage] = useState("")
    async function deleteTask(taskId, taskTitle) {
        const confirmed = window.confirm(`Deleted ${taskTitle}`);

        if (!confirmed) return;

        setDeletingId(taskId);

        try {
            const response = await fetch('/delete-task', {
                method: 'POST',
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify({id: taskId}),
            });
            const data = await response.json();

            if (!response.ok ) {
                throw new Error(data.error || 'Could not delete task');
            }
            
            setDeleteMessage(`${taskTitle} deleted`);
            await new Promise(resolve => setTimeout(resolve, 500));
            setDueToday(tasks => tasks.filter(task => task[0] !== taskId));
            setTimeout(() => setDeleteMessage(""), 2000);
            window.location.reload();
        } catch(error) {
            console.error('Error deleting the task', error.message);
            setDeleteMessage(error.message);
        } finally {
            setDeletingId(null);
        }
    }

    return (
    <main>
    <div className="title pending-title-box" style={{"backgroundImage": "linear-gradient(135deg, #3dd6d0 0%, #2878ff 20%, #6d45e8 45%, #e749ae 70%, #ff8a4c 100%)"}}>
        <div className="task-badge today-badge">
            Today: {dueToday.length}
        </div>
        <h1>Pending Tasks</h1>
        <div className="task-badge upcoming-badge">
            Upcoming: {dueLater.length}
        </div>
        <p>See your tasks here!</p>
    </div>
    <br />
    
    <div className="today-tasks">
        <h2>Today's Tasks</h2>
        {deleteMessage && (
                        <p className="delete-message" role="status">{deleteMessage}</p>
                    )}
        <ul style={{"borderRadius": "50px", "border": "2px solid #2c3e50"}}>
            {dueToday.map(task => (
                <li key={task[0]}>
                    <button
                        className="completed-check"
                        onClick={() => completeTask(task[0], task[1])}
                        disabled={completingId === task[0]}
                        aria-label={`Complete ${task[1]}`}
                    >
                        {completingId === task[0]
                            ? <span className="complete-spinner" />
                            : "✔️"
                        }
                    </button>
                    <strong>{task[1]}</strong> | <i>{task[2]}</i> <span style={{"display": "grid", textAlign: "center"}}>{task[3]} {task[4]}</span>
                    {completeMessage && (
                        <p className="complete-message" role="status">{completeMessage}</p>
                    
                    )}
                    <button 
                    className="delete-button"
                    onClick={() => deleteTask(task[0], task[1])}
                    disabled={deletingId === task[0]}
                    aria-label={`Complete ${task[1]}`}
                    >
                        {deletingId === task[0]
                            ? <span className="complete-spinner" />
                            : "🗑️"
                        }
                    </button>

                    
                    
                </li>
                
            ))}
        </ul>
    </div>
    
    <div className="upcoming-tasks">
        <h2>Upcoming Tasks</h2>
        <ul>
            {dueLater.map(task => (
                <li key={task[0]}>

                    <button
                    className="completed-check"
                    onClick={() => completeTask(task[0], task[1])}
                    disabled={completingId === task[0]}
                    aria-label={`Completed ${task[1]}`}
                    >
                    {completingId === task[0]
                        ? <span className="complete-spinner" />
                        : "☑️"
                    }
                    </button>

                    <strong>{task[1]}</strong> | <i>{task[2]}</i> <span style={{"display": "grid", textAlign: "center"}}>{task[3]} {task[4]}</span>

                    <button
                    className="delete-button"
                    onClick={() => deleteTask(task[0], task[1])}
                    disabled={deletingId === task[0]}
                    aria-label={`Delete ${task[1]}`}
                    >
                        {deletingId ===task[0]
                            ?<span className="complete-spinner" />
                            : "🗑️"
                        }
                    </button>

                </li>
            ))}
        </ul>
    </div>
    <div className="completed-tasks">
        <h3>Completed Tasks</h3>
        <p>{completedTasks}</p>


    </div>
    </main>
    );
}

export default Pending;
