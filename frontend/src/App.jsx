import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Start from './Start'


function App() {
   return (

    <BrowserRouter>
      <nav>
        <Link to="/">Start</Link>
      </nav>

      <Routes>
        <Route path="/"  element={<Start />} />
        
      </Routes>
    </BrowserRouter>
  )
}
export default App;