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
      const timer = setTimeout(() => {
      window.location.reload();
      }, 2000);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };


  const [numTasks, setNumTasks] = useState(0);

  useEffect(() => {
    fetch('/tasks/count')
      .then(response => response.json())
      .then(data => setNumTasks(data.count))
      .catch(error => console.error('Error fetching task count:', error));
  }, []);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const searchTask = () => {
    if (!search.trim()) return;
    
    fetch(`/tasks/search?keyword=${encodeURIComponent(search)}`)
      .then(response => response.json())
      .then(data => {
        setSearchResults(data.results);
      })
      .catch(error => console.error('Error searching tasks:', error));
  }

  const [dueToday, setDueToday] = useState([])

  useEffect(() => {
    fetch('/todays-tasks')
      .then(response => response.json())
      .then(data => setDueToday(data.due))
      .catch(error => console.error('Error fetching tasks', error));
  }, [])

  const [numCompleted, setNumCompleted] = useState(0)

  useEffect(() =>  {
    fetch('/num/completed-tasks')
      .then(response => response.json())
      .then(data => {
        setNumCompleted(data.num);
      })
      .catch(error => console.error("Error fetching data", data))
  }, [])



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
      <p style={{ textAlign: "bottom-vertical", fontSize: "1.25rem" }}>{numTasks} tasks</p>  
    </div>
    <div className="completed-tasks">
      <h2>Completed Tasks</h2>
      <p style={{ textAlign: "bottom-vertical",fontSize: "1.25rem"}}>{numCompleted} tasks</p>
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
    <div className="search">
      <h2>Search</h2>
      <textarea placeholder="Search with a keyword..." value={search} onChange={(event) => setSearch(event.target.value)} />
      <button onClick={searchTask} disabled={!search.trim()}>🔎</button>
      <ul>
        {searchResults.map(task => (
          <li key={task[0]}>
            {task[1]} - {task[2]}
          </li>
        ))}
      </ul>
    </div>
    
    <div className="today-tasks">
      <h2>Today's Tasks</h2>
      <ul>
        {dueToday.map(task => (
          <li key={task[0]}>
            ⁃ {task[1]} - {task[2]}
          </li>
        ))}
      </ul>
    </div>


    <div className="footer">
      <p>Made with ❤️ by Srinivasa Gudi</p>
    </div>

    </main>
  );
}

export default Home;
// I think this will have the overdue project if there are any it will show up on the top if not it is cool and sam eloginc will be used in the .