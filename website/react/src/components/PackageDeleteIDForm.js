import React, { useState } from 'react';

function PackageDeleteIDForm() {
  const [packageID, setPackageID] = useState(''); // 
  const [scores, setScores] = useState(null); 
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Package delete handle submit!');
  
    
    const response = await fetch(`/package/${packageID}`, { // use fetch API to make a POST request to /api/packages endpoint
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    
    if (response.ok) {
      console.log('Package deleted successfully!');
      setScores(scores.output);
      setErrorMessage('');
    } else {
      console.error('Failed to delete package.');
      setScores(null);
      setErrorMessage('Failed to delete package.');
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
      <button type="submit">Delete Package</button>
      {errorMessage && <div>{errorMessage}</div>}
    </form>
  );
}

export default PackageDeleteIDForm;