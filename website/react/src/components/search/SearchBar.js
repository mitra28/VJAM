import React, { useState, useEffect } from 'react';

function SearchBar() {
  const [value, setValue] = useState('');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
  }, [checked, value]);

  const getResults = (event) =>{
    event.preventDefault();
    if(checked){
      console.log(`Searching for regex: '${value}'!`);
    }
    else{
      console.log(`Searching for name: '${value}'!`);
    }
  }

  return (
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
  );
}

export default SearchBar;

