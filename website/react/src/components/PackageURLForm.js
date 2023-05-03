import React, { useState } from 'react';
// const PackageData = require('../../../backend/models/packagedata');

function PackageURLForm() {
    const [packageUrl, setPackageUrl] = useState(''); 
    const [scores, setScores] = useState(null); 
    const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Package handle submit!');
  
    
    const response = await fetch('/package', { // use fetch API to make a POST request to /api/packages endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ URL: packageUrl }),
    });
    
    if (response.ok) {
      console.log('Package created successfully!');
      const scores = await response.json();
      setScores(scores.output);
      setErrorMessage('');
      
      console.log(`url scores: ${scores.output.URL}`);
    } else {
      console.error('Failed to create package.');
      setScores(null);
      setErrorMessage('Failed to create package.');
    }
  };

  const handleUrlChange = (event) => {
    setPackageUrl(event.target.value);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="url">Enter a package URL:</label>
        <input type="text" id="url" name="url" value={packageUrl} onChange={handleUrlChange} />
      </div>
      <button type="submit">Create Package</button>
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

export default PackageURLForm;

