import { useEffect, useState } from "react";

function Pending() {
    const [dueToday, setDueToday] = useState([]);

    useEffect(() => {
        fetch('/todays-tasks')
            .then(response => response.json())
            .then(data => setDueToday(data.due))
            .catch(error => console.error('Error fetching tasks', error));
    }, []);

    const [dueLater, setLater] = useState([]);
    useEffect(() => {
         fetch('/upcoming-tasks')
        .then(response => response.json())
        .then(data => setLater(data.tasks))
        .catch(error => console.error('Error fetching tasks', error));
    }, []);

    const [completingId, setCompletingId] = useState(null);
    const [completeMessage, setCompleteMessage] = useState("");
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
        } catch(error) {
            console.error('Error completong task', error);
            setCompleteMessage(error.message);
        } finally {
            setCompletingId(null);
        }
    }
   
    return (
    <main>
    <div className="title">
        <h1>Pending Tasks</h1>
        <p>See your tasks here!</p>
    </div>
    <br />
    
    <div className="today-tasks">
        <h2>Today's Tasks</h2>
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
                    <strong>{task[1]}</strong> | <i>{task[2]}</i> <caption style={{"display": "grid", "textAlign": "center"}}>{task[3]} {task[4]}</caption>
                    {completeMessage && (
                        <p className="complete-message" role="status">{completeMessage}</p>
                    )}
                </li>
                
            ))}
        </ul>
    </div>
    
    <div className="upcoming-tasks">
        <h2>Upcoming Tasks</h2>
        <ul style={{"borderRadius": "50px", "border": "2px solid #2c3e50"}}>
            {dueLater.map(task => (
                <li key={task[0]}>
                    <strong>{task[1]}</strong> | <i>{task[2]}</i> <caption style={{"display": "grid", "textAlign": "center"}}>{task[3]} {task[4]}</caption>
                </li>
            ))}
        </ul>
    </div>
    </main>
    );
}

export default Pending;
