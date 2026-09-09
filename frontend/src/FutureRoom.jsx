import  { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

function FutureRoom() {
    const {taskId} = useParams();

    const [task, setTask] = useState(null);
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
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

    async function requestAnswer(event) {
        event.preventDefault();

        if(!input.trim() || sending) return;

        setSending(true);
        setError("");
        try {
        // The POST request will come here next.
            const response = await fetch(`/tasks/${taskId}/future-room`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    content: input
                })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Could not send message");
            }

            setMessages(previousMessages => [
                ...previousMessages,
                ["user", input],
                ["assistant", data.assistant_message.content]
            ]);
            setInput("");
        } catch (error) {
            setError(error.message);
        } finally {
            setSending(false);
    }
    }


    if (loading) {
        return <p>Loading Future Room...</p>;
    }

    if (error) {
        return <p role="alert">{error}</p>
    }

    

    return (
        <main className="future-room">
            <Link to="/pending-tasks">🔙</Link>
            <h1>Future Task Room</h1>

            {task && (
                <section className="future-task-detail">
                    <h2>{task[1]}</h2>
                    <p>{task[2]}</p>
                    <p>Due: <strong>{task[4]}</strong></p>
                </section>
            )}
        <section className="future-chat">
            {messages.length === 0 ? (
                <p>No messages yet. Start discussing yout task.</p>
            ) : (
                messages.map((message, index) => (
                    <div key={index} className={`message-${message[0]}`}>
                        <strong>{message[0]}</strong>
                        <p>{message[1]}</p>
                    </div>
                ))
            )}

            <form onSubmit={requestAnswer}>
                <input
                    type="text"
                    value={input}
                    onChange={event => setInput(event.target.value)}
                    placeholder="Discuss this task with Future AI..."
                    disabled={sending}
                />

                <button type="submit" disabled={sending || !input.trim()}>
                    {sending ? "Thinking..." : "Send"}
                </button>
            </form>
        </section>
        </main>
    )
}

export default FutureRoom;