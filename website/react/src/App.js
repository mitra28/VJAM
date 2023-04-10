import React, { useState, useEffect } from "react";
import './App.css';
import PackageForm from './components/PackageForm';


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
      Hello, World!
      {/* {prop.children} */}
      <PackageForm />
    </div>
  );
}

export default App;