import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import Home from './Home'
import Addtask from './AddTask'


function App() {
   return (

    <BrowserRouter>
      <nav>
        <Link to="/">DayMap</Link>
        <Link to="/add-task">Add Task</Link>
      </nav>

      <Routes>
        <Route path="/"  element={<Home />} />
        <Route path="/add-task" element={<Addtask />} />
        
      </Routes>
    </BrowserRouter>
  )
}
export default App;