import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import Home from './Home'
import Addtask from './AddTask'
import Pending from './PendingTasks'


function App() {
   return (

    <BrowserRouter>
      <nav>
        <Link to="/">DayMap</Link>
        <Link to="/add-task">Add Task</Link>
        <Link to="/pending-tasks">Pending Tasks</Link>
      </nav>

      <Routes>
        <Route path="/"  element={<Home />} />
        <Route path="/add-task" element={<Addtask />} />
        <Route path="/pending-tasks" element={<Pending />} />
        
      </Routes>
    </BrowserRouter>
  )
}
export default App;