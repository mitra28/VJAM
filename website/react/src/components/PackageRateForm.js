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
      const score = await response.json();
      setErrorMessage('');
      setScores(score);
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
      {scores && (
        <div>
          <p>URL: {scores.URL}</p>
          <p>Overall Score: {scores.NET_SCORE}</p>
          <p>Ramp Up Score: {scores.RAMP_UP_SCORE}</p>
          <p>Correctness Score: {scores.CORRECTNESS_SCORE}</p>
          <p>Bus Factor: {scores.BUS_FACTOR_SCORE}</p>
          <p>Responsiveness Score: {scores.RESPONSIVE_MAINTAINER_SCORE}</p>
          <p>License Score: {scores.LICENSE_SCORE}</p>
          <p>Version Score: {scores.VERSION_PIN_SCORE}</p>
          <p>Adherence Score: {scores.ADHERENCE_SCORE}</p>
        </div>
      )}
    </form>
  );
}

export default PackageRateForm;