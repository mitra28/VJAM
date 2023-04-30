import React, { useState } from 'react';
import JSZip from 'jszip';
const encoder = new TextEncoder();
// const PackageData = require('../../../backend/models/packagedata');

function PackageZipForm() {
  const  [zipfile, setFile] = useState(null); 

  console.log("Inside PackageZipForm");
  const unzipFile = async (file) => {
    const zip = new JSZip();
    const blob = await zip.loadAsync(file);
    return blob;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Package handle submit!');
  
    if (!zipfile) {
      console.error('No file selected.');
      return;
    }
  
    // unzip file
    //const unzippedData = await unzipFile(zipfile);
    const data = encoder.encode(zipfile);
    console.log(zipfile);
    const base64 = window.btoa(String.fromCharCode(...new Uint8Array(data)));
    console.log(base64);
  
    const response = await fetch('/packages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({data: base64}),
    });
    
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

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="file">Choose a zipfile:</label>
        <input type="file" id="file" name="file" onChange={handleFileChange} />
      </div>
      <button type="submit">Create Package</button>
    </form>
  );
}

export default PackageZipForm;

