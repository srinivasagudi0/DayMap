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
                    {task[1]} - {task[2]}
                </li>
            ))}
        </ul>
    </div>
    
    <div className="upcoming-tasks">
        <h2>Upcoming Tasks</h2>
        <ul style={{"borderRadius": "50px", "border": "2px solid #2c3e50"}}>
            {dueLater.map(task => (
                <li key={task[0]}>
                    {task[1]} - {task[2]}
                </li>
            ))}
        </ul>
    </div>
    </main>
    );
}

export default Pending;
