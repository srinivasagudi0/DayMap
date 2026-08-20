import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './Home'
import Missions from './Missions'


function App() {
   return (

    <BrowserRouter>
      <nav>
        <Link to="/">DayMap</Link>
        <Link to="/missions">Missions</Link>
      </nav>

      <Routes>
        <Route path="/"  element={<Home />} />
        <Route path="/missions" element={<Missions />} />
        
      </Routes>
    </BrowserRouter>
  )
}
export default App;