import { useEffect, useState } from "react";

// THe file looks so good and satisfying with the formatting(though it took me like an hour)
// (later)yeah so really hard to keep organized, so...

function Pending() {
    const [dueToday, setDueToday] = useState([]);
    const [dueLater, setLater] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);

    const [completingId, setCompletingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const [completeMessage, setCompleteMessage] = useState("");
    const [deleteMessage, setDeleteMessage] = useState("");
    const [completedError, setCompletedError] = useState("");
    const [clearMessage, setClearMessage] = useState("");

    const [clearingCompleted, setClearingCompleted] = useState(false);
    const [showCompleted, setShowCompleted] = useState(false);

    const [savingEdit, setSavingEdit] = useState(false);
    const [editMessage, setEditMessage] = useState("");

    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        priority: "",
        dueDate: ""
    });

    useEffect(() => {
        fetch("/todays-tasks")
            .then(response =>
                response.headers.get("content-type")?.includes("json")
                    ? response.json()
                    : []
            )
            .then(data => setDueToday(data.due || []))
            .catch(error =>
                console.error("Error fetching today's tasks", error)
            );
    }, []);

    useEffect(() => {
        fetch("/upcoming-tasks")
            .then(response =>
                response.headers.get("content-type")?.includes("json")
                    ? response.json()
                    : []
            )
            .then(data => setLater(data.tasks || []))
            .catch(error =>
                console.error("Error fetching upcoming tasks", error)
            );
    }, []);

    function loadCompletedTasks() {
        fetch("/completed-tasks")
            .then(response => {
                if (!response.ok) {
                    throw new Error("Could not load completed tasks.");
                }

                return response.json();
            })
            .then(data => {
                setCompletedTasks(data.completed || []);
                setCompletedError("");
            })
            .catch(error => {
                setCompletedError(error.message);
            });
    }

    useEffect(() => {
        loadCompletedTasks();
    }, []);

    function startEditing(task) {
        setEditingId(task[0]);

        setEditForm({
            title: task[1],
            description: task[2],
            priority: task[3],
            dueDate: task[4]
        });
    }

    function cancelEditing() {
        setEditingId(null);

        setEditForm({
            title: "",
            description: "",
            priority: "",
            dueDate: ""
        });
    }

    async function saveEdit() {
    if (
        !editForm.title.trim() ||
        !editForm.priority ||
        !editForm.dueDate
    ) {
        setEditMessage(
            "Please fill in the title, priority, and due date."
        );

        return;
    }

    setSavingEdit(true);
    setEditMessage("");

    try {
        const response = await fetch(`/tasks/${editingId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: editForm.title,
                description: editForm.description,
                priority: editForm.priority,
                due_date: editForm.dueDate
            })
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
            throw new Error(
                data.error ||
                data.message ||
                "Could not update task"
            );
        }

        const [todayResponse, upcomingResponse] =
            await Promise.all([
                fetch("/todays-tasks"),
                fetch("/upcoming-tasks")
            ]);

        const [todayData, upcomingData] =
            await Promise.all([
                todayResponse.json(),
                upcomingResponse.json()
            ]);

        setDueToday(todayData.due || []);
        setLater(upcomingData.tasks || []);

        setEditMessage(data.message);
        setEditingId(null);

        setTimeout(() => {
            setEditMessage("");
        }, 2000);
        } catch (error) {
            setEditMessage(error.message);
        } finally {
            setSavingEdit(false);
        }
    }

    async function clearCompleted() {
        const confirmed = window.confirm(
            "Permanently clear all completed tasks?"
        );

        if (!confirmed) return;

        setClearingCompleted(true);
        setClearMessage("");

        try {
            const response = await fetch("/delete/completed-tasks", {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error("Could not clear completed tasks");
            }

            setCompletedTasks([]);
            setClearMessage("Completed tasks cleared");
        } catch (error) {
            setClearMessage(error.message);
        } finally {
            setClearingCompleted(false);
        }
    }

    async function completeTask(taskId, taskTitle) {
        const confirmed = window.confirm(
            `Completed "${taskTitle}"?`
        );

        if (!confirmed) return;

        setCompletingId(taskId);

        try {
            const response = await fetch("/complete-task", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: taskId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Could not complete task"
                );
            }

            setCompleteMessage(`${taskTitle} completed`);

            setDueToday(tasks =>
                tasks.filter(task => task[0] !== taskId)
            );

            setLater(tasks =>
                tasks.filter(task => task[0] !== taskId)
            );

            setOverdueTasks(tasks =>
                tasks.filter(tasks => tasks[0] !== taskId)
            );

            loadCompletedTasks();

            setTimeout(() => {
                setCompleteMessage("");
            }, 2000);
        } catch (error) {
            console.error("Error completing task", error);
            setCompleteMessage(error.message);
        } finally {
            setCompletingId(null);
        }
    }

    async function deleteTask(taskId, taskTitle) {
        const confirmed = window.confirm(
            `Delete "${taskTitle}"?`
        );

        if (!confirmed) return;

        setDeletingId(taskId);

        try {
            const response = await fetch("/delete-task", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: taskId
                })
            });

            if (!response.ok) {
                throw new Error("Could not delete task");
            }

            setDeleteMessage(`${taskTitle} deleted`);

            setDueToday(tasks =>
                tasks.filter(task => task[0] !== taskId)
            );

            setLater(tasks =>
                tasks.filter(task => task[0] !== taskId)
            );
            setOverdueTasks(tasks =>
                tasks.filter(tasks => tasks[0] !== taskId)
            );

            setTimeout(() => {
                setDeleteMessage("");
            }, 2000);
        } catch (error) {
            console.error("Error deleting task", error);
            setDeleteMessage(error.message);
        } finally {
            setDeletingId(null);
        }
    }


    const [overdueTasks, setOverdueTasks] = useState([]);
    const [overdueError, setOverdueError] = useState("");

    useEffect(() => {
        fetch("/overdue-tasks")
            .then(response => {
                if (!response.ok) {
                    throw new Error("Could not load overdue tasks");
                }

                return response.json();
            })
            .then(data => {
                setOverdueTasks(data.tasks || []);
                setOverdueError("");
            })
            .catch(error => {
                setOverdueError(error.message);
            });
    }, []);

    function renderEditForm() {
        return (
            <div className="edit-form">
                <input
                    type="text"
                    value={editForm.title}
                    placeholder="Task title"
                    onChange={event =>
                        setEditForm({
                            ...editForm,
                            title: event.target.value
                        })
                    }
                />

                <textarea
                    value={editForm.description}
                    placeholder="Task description"
                    onChange={event =>
                        setEditForm({
                            ...editForm,
                            description: event.target.value
                        })
                    }
                />

                <select
                    value={editForm.priority}
                    onChange={event =>
                        setEditForm({
                            ...editForm,
                            priority: event.target.value
                        })
                    }
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>

                <input
                    type="date"
                    value={editForm.dueDate}
                    onChange={event =>
                        setEditForm({
                            ...editForm,
                            dueDate: event.target.value
                        })
                    }
                />

                <button type="button" onClick={saveEdit} disabled={savingEdit}>
                    {savingEdit ? "Saving..." : "Save"}
                </button>

                <button
                    type="button"
                    onClick={cancelEditing}
                >
                    Cancel
                </button>
            </div>
        );
    }

    function renderTask(task, completeIcon) {
        return (
            <li key={task[0]}>
                {editingId === task[0] ? (
                    renderEditForm()
                ) : (
                    <>
                        <button
                            className="completed-check"
                            onClick={() =>
                                completeTask(task[0], task[1])
                            }
                            disabled={completingId === task[0]}
                            aria-label={`Complete ${task[1]}`}
                        >
                            {completingId === task[0] ? (
                                <span className="complete-spinner" />
                            ) : (
                                completeIcon
                            )}
                        </button>

                        <strong>{task[1]}</strong>
                        {" | "}
                        <i>{task[2]}</i>

                        <span
                            style={{
                                display: "grid",
                                textAlign: "center"
                            }}
                        >
                            {task[3]} {task[4]}
                        </span>

                        <button
                            type="button"
                            className="editBtn"
                            onClick={() => startEditing(task)}
                        >
                            Edit ✎
                        </button>

                        <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                                deleteTask(task[0], task[1])
                            }
                            disabled={deletingId === task[0]}
                            aria-label={`Delete ${task[1]}`}
                        >
                            {deletingId === task[0] ? (
                                <span className="complete-spinner" />
                            ) : (
                                "🗑️"
                            )}
                        </button>
                    </>
                )}
            </li>
        );
    }

    return (
        <main>
            <div
                className="title pending-title-box"
                style={{
                    backgroundImage:
                        "linear-gradient(135deg, #3dd6d0 0%, #2878ff 20%, #6d45e8 45%, #e749ae 70%, #ff8a4c 100%)"
                }}
            >
                <div className="task-badge today-badge">
                    Today: {dueToday.length}
                </div>

                <h1>Pending Tasks</h1>

                <div className="task-badge upcoming-badge">
                    Upcoming: {dueLater.length}
                </div>

                <p>See your tasks here!</p>
            </div>
            
            {overdueError && (<p role="alert">{overdueError}</p>)}

            {overdueTasks.length > 0 && (
                <div className="overdue-tasks">
                    <h2>🚨 Overdue Tasks ({overdueTasks.length})</h2>
                    <ul>{overdueTasks.map(task => renderTask(task, "✔️"))}</ul>
                </div>
            )}

            <br />

            {completeMessage && (
                <p
                    className="complete-message"
                    role="status"
                >
                    {completeMessage}
                </p>
            )}

            {deleteMessage && (
                <p
                    className="delete-message"
                    role="status"
                >
                    {deleteMessage}
                </p>
            )}

            <div className="today-tasks">
                <h2>Today's Tasks</h2>

                <ul
                    style={{
                        borderRadius: "50px",
                        border: "2px solid #2c3e50"
                    }}
                >
                    {dueToday.length === 0 ? (
                        <li className="empty-state">
                            Please add tasks due today to see them here.
                        </li>
                    ) : (
                        dueToday.map(task =>
                            renderTask(task, "✔️")
                        )
                    )}
                </ul>
            </div>

            <div className="upcoming-tasks">
                <h2>Upcoming Tasks</h2>

                <ul>
                    {dueLater.length === 0 ? (
                        <li className="empty-state">
                            No upcoming tasks available.
                        </li>
                    ) : (
                        dueLater.map(task =>
                            renderTask(task, "☑️")
                        )
                    )}
                </ul>
            </div>

            <div className="completed-tasks">
                <button
                    type="button"
                    className="toggle-completed-button"
                    onClick={() =>
                        setShowCompleted(previous => !previous)
                    }
                    aria-expanded={showCompleted}
                    aria-controls="completed-section"
                >
                    {showCompleted
                        ? "Hide Completed Tasks ⬆️"
                        : "Show Completed Tasks ⬇️"}
                </button>

                <button
                    type="button"
                    className="Clear-tasks"
                    onClick={clearCompleted}
                    disabled={
                        clearingCompleted ||
                        completedTasks.length === 0
                    }
                >
                    {clearingCompleted
                        ? "Clearing..."
                        : "Clear All"}
                </button>

                {clearMessage && (
                    <p role="status">
                        {clearMessage}
                    </p>
                )}

                <h2 style={{ fontSize: "1.9rem" }}>
                    Completed Tasks
                </h2>

                {showCompleted && (
                    <section id="completed-section">
                        {completedError ? (
                            <p role="alert">
                                {completedError}
                            </p>
                        ) : (
                            <ul>
                                {completedTasks.length === 0 ? (
                                    <li className="empty-state">
                                        No completed tasks yet.
                                    </li>
                                ) : (
                                    completedTasks.map(task => (
                                        <li key={task[0]}>
                                            <strong>
                                                {task[1]}
                                            </strong>
                                            {" - "}
                                            {task[2]}

                                            <br />

                                            <i>
                                                {task[3]} | {task[4]}
                                            </i>
                                        </li>
                                    ))
                                )}
                            </ul>
                        )}
                    </section>
                )}
            </div>
        </main>
    );
}

export default Pending;
