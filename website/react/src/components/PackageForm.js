import React, { useState } from 'react';
const pako = require('pako');
const encoder = new TextEncoder();

// const PackageData = require('../../../backend/models/packagedata');

function PackageForm() {
    const [packageUrl, setPackageUrl] = useState('');
    const  [zipfile, setFile] = useState(null); 
    const [scores, setScores] = useState(null); 
    const [errorMessage, setErrorMessage] = useState('');

  const handleUrlSubmit = async (event) => {
      console.log('Package handle url submit!');
      event.preventDefault();
    
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

  const handleZipSubmit = async (event) => {
    console.log('Package handle zip submit!');
    event.preventDefault();
    
  
    if (!zipfile) {
      console.error('No file selected.');
      return;
    }
  
      console.log("unzippedData");
      console.log(zipfile);

      // compress zip
      const compressed = pako.deflate(zipfile);

    // Send Request
    const response = await fetch('/package', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({Content: compressed}),
    });

    //console.log('');
    console.log(response);

    if (response.ok) {
      console.log('Package created successfully!');
    } else {
      console.error('Failed to create package.');
    }
  };

  // callback for when file is uploaded
  const handleZipChange = (event) => {
    setFile(event.target.value);
  }

  const handleErrorSubmit = async (event) => {
    console.log('Package handle error submit!');
    event.preventDefault();
    const base64 = 'base64 string';
  
    const response = await fetch('/package', { // use fetch API to make a POST request to /api/packages endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ URL: packageUrl , Content: base64}),
    });
  
    if (response.ok) {
      console.log('Package created successfully!');
      const scores = await response.json();
      setScores(scores.output);
      setErrorMessage('');
    } else {
      console.error('Failed to create package.');
      const errormsg = await response.json();
      setScores(null);
      setErrorMessage(`${errormsg.error}`);
    }
};

  const handleSubmit = (event) => {
    event.preventDefault();
    if (packageUrl && zipfile) {
      handleErrorSubmit(event);
      setErrorMessage("Only one field can be filled at a time");
      return;
    }
    if (packageUrl) {
      handleUrlSubmit(event);
    } else if (zipfile) {
      handleZipSubmit(event);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="url">Enter a package URL:</label>
        <input type="text" id="url" name="url" value={packageUrl} onChange={handleUrlChange} />
      </div>
      <div>
        <label htmlFor="file">Choose a zipfile:</label>
        <input type="text" id="file" name="file" onChange={handleZipChange} />
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

export default PackageForm;

