import { useEffect, useState } from "react";

function Home() {

  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const addTask = async () => {
    if (!task.trim() || loading) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: task }),
      });
      const responseText = await response.text();
      let data = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = { error: responseText || "Server returned an invalid response" };
      }

      if (!response.ok) throw new Error(data.error || "Could not add task");

      setTask("");
      setMessage(data.message || "Task created successfully");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
    <div className="title">
      <h1>Home</h1>
      <p>Plan the day, keep tomorrow visible, and close the loop on what got done.</p>
    </div>
    <br />
    <br />
    <div className="row">
    <div className="date">
      <h2>Today</h2>
      <p>{date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
    </div>
    <div className="pending-tasks">
      <h2>Pending Tasks</h2>
      <p>There are no pending tasks.</p>  
    </div>
    <div className="completed-tasks">
      <h2>Completed Tasks</h2>
      <p>There are no completed tasks.</p>
    </div>
    </div>
    <div className="auto">
      <br />
      <h2>Quick Add (Beta AI)</h2>
      <p style={ { textAlign: "center" } }>Add a new task here.</p>
      <textarea placeholder="Enter task details..." value={task} onChange={(event) => setTask(event.target.value)} />
      <button onClick={addTask} disabled={loading || !task.trim()}>
        {loading ? "Adding..." : "Add Task"}
      </button>
      {message && <p className="task-message" role="status">{message}</p>}
    </div>
    </main>
  );
}

export default Home;
