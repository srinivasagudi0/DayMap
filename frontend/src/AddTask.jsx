import { useState, useEffect } from 'react';



function Addtask() {

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
  );
}

export default Addtask;
