import React, { useState, useEffect } from "react";
import './App.css';
import PackageForm from './components/PackageForm';


function App(prop) {
  const [message, setMessage] = useState("");
  // const apiUrl = 'https://backend-service-dot-ece-461-part-2-web-service.uk.r.appspot.com/'
  const apiUrl = 'http://localhost:8080/message'
  useEffect(() => {
    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <div className="App">
      {message}
      Hello!
      {/* {prop.children} */}
      <PackageForm />
    </div>
  );
}

export default App;

// 