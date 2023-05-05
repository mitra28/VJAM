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
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState([]);

  
  useEffect(() => {
  }, [checked]);

  const getResults = (event) =>{
    event.preventDefault();
    if(checked){
      console.log(`Searching for regex: '${value}'!`);
      setResults(regex_results);
    }
    else{
      console.log(`Searching for name: '${value}'!`);
      setResults(name_results);
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
        <input type="checkbox"
        onChange={(newCheck) => {
          setChecked(newCheck.target.checked)
        }}></input>
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

