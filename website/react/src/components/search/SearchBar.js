import React, { useState, useEffect } from 'react';
import ResultPage from '../ResultPage';



function SearchBar() {
  const name_results = [
    {name: "Hello"},
    {name: "Name"},
    {name: "Search"},
  ]
  
  const regex_results = [
    {name: "Hello"},
    {name: "Regex"},
    {name: "Search"},
  ]

  const [value, setValue] = useState('');
  const [results, setResults] = useState([]);

  
  useEffect(() => {
  }, []);

  const getResults = async (event) =>{
    event.preventDefault();
    const response = await fetch(`/package/byRegex`, { // use fetch API to make a POST request to /api/packages endpoint
      method: 'POST',
      body: {
        'content': {value}
      },
    });
    setResults(response);
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
          {results.map((result) => {
            return <ResultPage package={result}></ResultPage>
          })}
        </ul>
      </div>
    </div>
  );
}

export default SearchBar;

