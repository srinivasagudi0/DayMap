import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './Home'


function App() {
   return (

    <BrowserRouter>
      <nav>
        <Link to="/">Start</Link>
      </nav>

      <Routes>
        <Route path="/"  element={<Home />} />
        
      </Routes>
    </BrowserRouter>
  )
}
export default App;