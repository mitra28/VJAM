import React, { useState, useEffect } from 'react';

function SearchBar() {
  const [value, setValue] = useState('');

  useEffect(() => {
  }, [value]);
  
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
      <button onClick={() => {
        setValue("Search");
      }}>Search</button>
    </div>
  );
}

export default SearchBar;

