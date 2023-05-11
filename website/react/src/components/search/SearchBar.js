import React, { useState, useEffect } from 'react';
import ResultPage from '../ResultPage';



function SearchBar() {
  const fail_results = [
    {name: "NO RESULTS FOUND", version: "NA"},
  ]
  
  const [value, setValue] = useState('.*');
  const [results, setResults] = useState([]);

  
  useEffect(() => {
  }, []);

  const getResults = async (event) =>{
    event.preventDefault();
    console.log(value);
    const temp_value = JSON.stringify({content: value});
    console.log(temp_value);
    const response = await fetch(`/package/byRegex`, { // use fetch API to make a POST request to /api/packages endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: temp_value,
    });
    const response_json = await response.json();
    console.log(response);
    console.log(response_json);
    if(response.status == 200){
      setResults(response_json.content);
    }
    else if(response.status == 404){
      setResults(fail_results);
    }  
    else{
      console.log("Response failed entirely");
    }
  }

  return (
    <div>
      <form className="SearchBar" onSubmit={getResults}>
        <label>Enter the package to search for here:
          <input
            type="text"
            placeholder="Search data..."
            value={value}
            onChange={ (newText) => {
              setValue(newText.target.value);
            }}
          />
        </label>
        <input type="submit"></input>
      </form>
      <div>
        <h1>Results:</h1>
        <ul>
          {results && results.map((result) => {
            return <ResultPage package={result}></ResultPage>
          })}
        </ul>
      </div>
    </div>
  );
}

export default SearchBar;

