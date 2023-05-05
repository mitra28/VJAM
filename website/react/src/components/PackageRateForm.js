import React, { useState } from 'react';

function PackageRateForm() {
    const [packageID, setPackageID] = useState(''); // 
    const [scores, setScores] = useState(null); 
    const [errorMessage, setErrorMessage] = useState('');
  
    const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Package rate handle submit!');
  
    
    const response = await fetch(`/package/${packageID}/rate`, { // use fetch API to make a POST request to /api/packages endpoint
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    
    if (response.ok) {
      console.log('Package rated successfully!');
      setErrorMessage('');
    } else {
      console.error('Failed to rate package.');
      setErrorMessage('Failed to create package.');
    }
  };

  const handleIDChange = (event) => {
    setPackageID(event.target.value);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="url">Enter a package ID:</label>
        <input type="text" id="id" name="id" value={packageID} onChange={handleIDChange} />
      </div>
      <button type="submit">Rate Package</button>
      {errorMessage && <div>{errorMessage}</div>}
    </form>
  );
}

export default PackageRateForm;