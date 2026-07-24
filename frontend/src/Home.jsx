import { useEffect, useState } from "react";

function Home() {

  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api')
      .then(response => response.json())
      .then(data => setData(data?.message))
      .catch(error => console.error('Error fetching data:', error));
  }, []);


  return (
    <div>
      <h1>{data}</h1>
    </div>
  );
}

export default Home;