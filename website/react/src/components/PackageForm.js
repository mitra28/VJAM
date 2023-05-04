import React, { useState } from 'react';
<<<<<<< HEAD
// const PackageData = require('../../../backend/models/packagedata');

function PackageURLForm() {
    const [packageUrl, setPackageUrl] = useState(''); 
    const [packageID, setPackageID] = useState('');
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
=======
import JSZip from 'jszip';
const encoder = new TextEncoder();

// const PackageData = require('../../../backend/models/packagedata');

function PackageForm() {
    const [packageUrl, setPackageUrl] = useState('');
    const  [zipfile, setFile] = useState(null); 
    const [scores, setScores] = useState(null); 
    const [errorMessage, setErrorMessage] = useState('');

    const unzipFile = async (file) => {
      const zip = new JSZip();
      const blob = await zip.loadAsync(file);
      return blob;
    };

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
>>>>>>> main
  };

  const handleUrlChange = (event) => {
    setPackageUrl(event.target.value);
  }

<<<<<<< HEAD
=======
  const handleZipSubmit = async (event) => {
    console.log('Package handle zip submit!');
    event.preventDefault();
    
  
    if (!zipfile) {
      console.error('No file selected.');
      return;
    }
  
      // unzip file
      const unzippedData = await unzipFile(zipfile);
      console.log("unzippedData");
      console.log(unzippedData);

  
      const allfiles = unzippedData.files;
      let allfilesstring = '';
  
      for (const filename in unzippedData.files) {
        const file = unzippedData.files[filename];
        const text = await file.async('text');
        allfilesstring += text;
      }
    const string_data = encoder.encode(allfilesstring);

    let base64 = '';
    const CHUNK_SIZE = 4096;
    let content_length = 4; //string_data.length; **************************** CHANGE THIS
    for (let i = 0; i < content_length; i += CHUNK_SIZE) {
      const chunk = string_data.slice(i, i + CHUNK_SIZE);
      base64 += btoa(chunk);
    }

    // Send Request
    const response = await fetch('/package', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({Content: base64}),
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
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
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

>>>>>>> main
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="url">Enter a package URL:</label>
        <input type="text" id="url" name="url" value={packageUrl} onChange={handleUrlChange} />
      </div>
<<<<<<< HEAD
      <button type="submit">Create Package</button>
=======
      <div>
        <label htmlFor="file">Choose a zipfile:</label>
        <input type="file" id="file" name="file" onChange={handleFileChange} />
      </div>
      <button type="submit">Create Package</button>

>>>>>>> main
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

<<<<<<< HEAD
export default PackageURLForm;
=======
export default PackageForm;
>>>>>>> main

