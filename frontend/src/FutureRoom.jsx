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
        CheckSprint();
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

    const [completeMessage, setCompleteMessage] = useState("");
    const [completedError, setCompletedError] = useState("");
    const [completingId, setCompletingId] = useState(null);

    async function completeTask(taskId, taskTitle) {
        const confirmed = window.confirm(
            `Completed "${taskTitle}"`
        );

        if (!confirmed) return;
        
        setCompletingId(taskId);

        try {
            const response = await fetch("/complete-task", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({id: taskId})
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Could not Complete task"
                );
            }

            setCompleteMessage(`${taskTitle} completed`)
            
            setTimeout(() => {
                window.location.href = "/pending-tasks";
            }, 1500);
        } catch (error) {
            setCompletedError(error.message);
        } finally {
            setCompletingId(null);
        }

    }

    const [sprintMinutes, setSprintMinutes] = useState(10);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [sprintEnd, setSprintEnd] = useState(null);
    const [sprintActive, setSprintActive] = useState(false);

    function startSprint() {
        const endingTime = Date.now() + sprintMinutes * 60 *1000;

        setSprintEnd(endingTime);
        setSecondsLeft(sprintMinutes * 60);
        setSprintActive(true);

        localStorage.setItem(
            `future-sprint-${taskId}`,
            endingTime.toString()
        );
        addSprintMessage("start")
            .catch(error => setError(error.message));
    }

    function stopSprint() {
        const confirmed = window.confirm("Stop this Future Sprint?");

        if (!confirmed) return;

        setSprintActive(false);
        setSecondsLeft(0);
        setSprintEnd(null);

        localStorage.removeItem(`future-sprint-${taskId}`);
    }

    function CheckSprint() {
        const savedTimer = localStorage.getItem(`future-sprint-${taskId}`);
        
        if (!savedTimer) return;

        const endingTime = Number(savedTimer);
        const remaining = Math.max(0,Math.ceil((endingTime - Date.now()) / 1000))

        if (remaining > 0) {
            setSprintEnd(endingTime);
            setSecondsLeft(remaining);
            setSprintActive(true);
        } else {
            localStorage.removeItem(`future-sprint-${taskId}`);
        }
    }

    useEffect(() => {
        if (!sprintActive || !sprintEnd) return;
        
        const timer = setInterval(() => {
            const remaining = Math.max(
                0,
                Math.ceil((sprintEnd - Date.now()) / 1000) // bad at maths that why caught it now.
            );
            setSecondsLeft(remaining)

            if (remaining === 0) {
                addSprintMessage("finish")
                    .catch(error => setError(error.message));
                setSprintActive(false);
                setSprintEnd(null);
                localStorage.removeItem(`future-sprint-${taskId}`);
                
            }
        }, 1000)

        return () => clearInterval(timer);
    }, [sprintActive, sprintEnd, taskId]);


    function formatSprintTime(seconds) {
        const minutes = Math.floor(seconds/60);
        const remainingSeconds = seconds % 60;

        return `${minutes}:${remainingSeconds.toString().padStart(2,"0")}`;
    }

    async function addSprintMessage(eventType) {
        const response = await fetch(
            `/tasks/${taskId}/future-sprint-message`,
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    event_type: eventType,
                    minutes: sprintMinutes
                })
            }
        );
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Could not add sprint message");
        }

        setMessages(previous => [
            ...previous,
            ["assistant", data.assistant_message.content]
        ]);
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

            {completedError && (
                <p className="complete-error" role="alert">
                    {completedError}
                </p>
            )}
         {task && (
            <button
                className="AI-complete"
                onClick={() =>
                    completeTask(task[0], task[1])
                }
                disabled={completingId === task[0]}
                aria-label={`Complete ${task[1]}`}
            >
                {completingId === task[0] ? (
                    <span className="complete-spinner" />
                ) : (
                    "DONE with this task!✔️"
                )}
                </button>
            )}

            {task && (
                <section className="future-task-detail">
                    <h2>{task[1]}</h2>
                    <p>{task[2]}</p>
                    <p>Due: <strong>{task[4]}</strong></p>
                </section>
            )}

            <section className="future-sprint">
            <h2>Future Sprint</h2>

            {!sprintActive ? (
                <>
                <div className="sprint-options">
                    {[10, 20, 30].map(minutes => (
                        <button
                            type="button"
                            key={minutes}
                            onClick={() => setSprintMinutes(minutes)}
                            className={
                                sprintMinutes === minutes
                                    ? "selected-sprint"
                                    : ""
                            }
                            aria-pressed={sprintMinutes === minutes}

                        >{minutes} min</button>
            ))}
            </div>

            <button type="button" onClick={startSprint} className="start-sprint"> Start Future Sprint </button>
        </>
        ) : (
            <>
                <p className="sprint-time">
                    {formatSprintTime(secondsLeft)}
                </p>

                <button type="button" onClick={stopSprint} className='stop-sprint'>
                    Stop Sprint
                </button>
            </>
        )}
            </section>
        <section className="future-chat">
            {completeMessage && (
                <p
                    className="complete-message"
                    role="status"
                >
                    {completeMessage}
                </p>
            )}

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
                    className="Query" // dont know what to put honestly
                    disabled={sending}
                />

                <button type="submit" disabled={sending || !input.trim()} className="Ask-ai">
                    {sending ? "Thinking..." : "⬆"}
                </button>
            </form>
        </section>
        </main>
    )
}

export default FutureRoom;
// coooking on this file and honestly one of my best works in this project, did somehting never did before(afaik)