import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Layout from './Layout.jsx';
import PackageURLForm from './components/PackageURLForm';
import ResultPage from "./components/ResultPage.js";
import SearchBar from './components/search/SearchBar.js';

function App(prop) {
  const [message, setMessage] = useState("");
  const apiUrl = 'https://backend-service-dot-ece-461-part-2-web-service.uk.r.appspot.com/'
  useEffect(() => {
    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element = {<Layout />}>
        <Route path="form" element = {<PackageURLForm />}/>
        <Route path="search" element={<SearchBar />} />
        <Route path="package" element={<ResultPage package={NaN}/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
/*
          <div className="App">
            {message}
            Hello, World!
          </div>
*/
