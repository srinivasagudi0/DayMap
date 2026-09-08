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
    })

    return (
        <main className="future-room">
            <Link to="/pending-tasks">🔙 Back to tasks</Link>
            <h1>Future Task Room</h1>
        </main>
    )
}

export default FutureRoom;