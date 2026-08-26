import { useState } from 'react';



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
      setMessage(error);
    } finally {
      setLoading(false);
    }
  };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("");
  const priorities = [
    {id: "low", name: "Low"},
    {id: "medium", name: "Medium"},
    {id: "high", name: "High"}
  ];
  const [dueDate, setDueDate] = useState("");


  const handleManualSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !level.trim() || !dueDate.trim()) {
      setMessage("Please fill all the feilds")
    }

    setLoading(true);
    setMessage("");

    try {
    // Make sure this route matches your Flask blueprint route
    const response = await fetch("/tasks/manual-add", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        title: title,
        description: description,
        priority: level,  // level -> priority
        due_date: dueDate
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to save manual task")
    }

    setTitle("");
    setDescription("");
    setLevel("");
    setDueDate("");

    setMessage(data.message || "Manual task created Successful");

  } catch(error) {
    setMessage(error.message);
  }
  finally {
    setLoading(false);
  }
};
// need to tyle title to title 2 to get a brnad new look.

  return (
    <main>
      <div class="title2">
        <h1>Add Task</h1>
        <p>Add tasks with AI or manually</p>
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

    <div className="manual-add">
      <h1>Manual Add</h1>
      <form onSubmit={handleManualSubmit}> 
        <label   style={{marginLeft: '350px'}}>
          Title:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}

            />      
        </label>
        <label>
          Description:
          <input 
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            />
          </label>

        <label>
          Priority:
         <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">--Select Priority--</option>

          {priorities.map((priority) => (
            <option key={priority.id} value={priority.id}>
              {priority.name}
            </option>
            ))}
         </select>
        </label>
        <label>
          Due Date:
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            />
        </label>
        <br />

        <button type="submit" disabled={loading || !title.trim() || !description.trim() || !dueDate.trim() || !level.trim()}>
          Save Task Manually
        </button>

      </form>
    </div>

    </main>
  );
}

export default Addtask;
