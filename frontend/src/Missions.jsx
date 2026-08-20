import { useState, useEffect } from 'react';



function Missions() {

  const [numTasks, setNumTasks] = useState(0);

  useEffect(() => {
    fetch('/tasks/count') 
      .then(response => response.json())
      .then(data => setNumTasks(data.count))
      .catch(error => console.error('Error fetching task count:', error));
    
  }, [])


  return (
    <div>
      <h1>Missions</h1>
      <p>This is the Missions page.</p>
      <p>Number of tasks: {numTasks}</p>
    </div>
  );
}

export default Missions;
