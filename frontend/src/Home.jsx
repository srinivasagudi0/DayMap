import { useEffect, useState } from "react";

function Home() {

  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <main>
    <div className="title">
      <h1>Home</h1>
      <p>Plan the day, keep tomorrow visible, and close the loop on what got done.</p>
    </div>
    <div className="row">
    <div className="date">
      <h2>Today</h2>
      <p>{date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
    </div>
    <div className="pending-tasks">
      <h2>Pending Tasks</h2>
      <p>There are no pending tasks.</p>  
    </div>
    <div className="completed-tasks">
      <h2>Completed Tasks</h2>
      <p>There are no completed tasks.</p>
    </div>
    </div>
    </main>
  );
}

export default Home;

