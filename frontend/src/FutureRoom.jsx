import  { Link, useParams } from "react-router-dom"
import { useEffect, useState } from "react";

function FutureRoom() {
    const {taskId} = useParams();

    const [task, setTask] = useState(null);
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useState(() => {
        fetch(`/tasks/${taskId}/future-room`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Could not load the Future Room");
                }
                return response.json();
            })
            .then(data => {
                setTask(data.task);
                setMessages(data.messages || []);
                setError("");
            })
            .catch(error => setError(error.message))
            .finally(() => setLoading(false));
    }, [taskId]);

    if (loading) {
        return <p>Loading Future Room...</p>;
    }

    if (error) {
        return <p role="alert">{error}</p>
    }

    return (
        <main className="future-room">
            <Link to="/pending-tasks">🔙 Back to tasks</Link>
            <h1>Future Task Room</h1>

            {task && (
                <section className="future-task-detail">
                    <h2>{task[1]}</h2>
                    <p>{task[1]}</p>
                    <p>{task[2]}</p>
                    <p>Due: {task[4]}</p>
                </section>
            )}

        </main>
    )
}

export default FutureRoom;