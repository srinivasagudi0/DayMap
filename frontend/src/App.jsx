import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Addtask from './AddTask';
import Pending from './PendingTasks';
import FutureRoom from './FutureRoom';


function App() {
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