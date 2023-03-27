import React, { useState, useEffect } from "react";
import './App.css';


function App(prop) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/message")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <div className="App">
      {message}
      {/* {prop.children} */}
    </div>
  );
}

export default App;
