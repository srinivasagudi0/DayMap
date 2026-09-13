import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Addtask from './AddTask';
import Pending from './PendingTasks';
import FutureRoom from './FutureRoom';
import { api } from "./ap";
import { useState, useEffect } from 'react';


function App() {

  const [ready,  setReady] = useState(false);
  useEffect(() => {
    let stopped = false;
    let retry;

    async function checkServer() {
      try {
        const response = await fetch(api("/ready"));
        const data = await response.json();
         
        if (response.ok && data.ready === true) {
          if (!stopped) setReady(true);
          return;
        }
      } catch {
        //Server may be still waking up
      }
      if (!stopped) {
        retry = setTimeout(checkServer, 3000);
      }
    }
    checkServer();
    
    return () => {
      stopped=true;
      clearTimeout(retry);
    };
  }, []);

  if (!ready) {
    return (
      <div className='loading-screen'>
        <h1>Waking up DayMap... Please Wait.</h1>
        <p></p>
      </div>
  );}

   return (

    <BrowserRouter>
      <nav>
        <NavLink to="/">DayMap</NavLink>
        <NavLink to="/add-task">Add Task</NavLink>
        <NavLink to="/pending-tasks">Pending Tasks</NavLink>
      </nav>

      <Routes>
        <Route path="/"  element={<Home />} />
        <Route path="/add-task" element={<Addtask />} />
        <Route path="/pending-tasks" element={<Pending />} />
        <Route path="/future-room/:taskId" element={<FutureRoom />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App;