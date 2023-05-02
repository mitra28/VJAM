import React, { useState, useEffect } from 'react';

function SearchBar() {
  const [value, setValue] = useState('');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    console.log(`Checked state is ${checked}`);
  }, [checked, value]);
  
  return (
    <div className="SearchBar">
      <input
        type="text"
        className="SearchBar_text"
        placeholder="Search data..."
        value={value}
        onChange={(newText) => {
          setValue(newText.target.value);
        }}
      />
      <input type="checkbox"
      onChange={(newCheck) => {
        setChecked(newCheck.target.checked)
      }}></input>
      <button onClick={() => {
        setValue("Search");
      }}>Search</button>
    </div>
  );
}

export default SearchBar;

