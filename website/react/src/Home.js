import React, { useState, useEffect } from 'react';

function Home() {
  const [value, setValue] = useState('');

  useEffect(() => {
  }, [value]);
  
  return (
    <div className="Home">
        <header>Welcome to Team 5's website</header>
        
    </div>
  );
}

export default SearchBar;

