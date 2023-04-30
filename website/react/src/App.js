import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Layout from './Layout.jsx';
import PackageForm from './components/PackageForm';
import Package from "./components/Package";
import PackageList from "./components/PackageList";
import ResultPage from "./components/ResultPage.js";
import SearchBar from './components/search/SearchBar.js';



const lodash_pack = new Package('Lodash', "Lodash", 1);

function App(prop) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/message")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element = {<Layout />}>
          <Route index element = {<PackageForm />}/>
          <Route path="search" element={<SearchBar />} />
          <Route path="packagelist" element={<PackageList />} />
          <Route path="package" element={<ResultPage package={lodash_pack}/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

/*
          <div className="App">
            {message}
            Hello, World!
          </div>
*/
export default App;
