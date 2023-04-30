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
    const unzippedData = await unzipFile(zipfile);
    console.log(unzippedData);

    const allfiles = unzippedData.files;
    let allfilesstring = '';

    for (const filename in unzippedData.files) {
      const file = unzippedData.files[filename];
      const text = await file.async('text');
      allfilesstring += text;
    }

    const string_data = encoder.encode(allfilesstring);
    console.log(string_data);

    const base64 = window.btoa(String.fromCharCode(...new Uint8Array(string_data)));
  
    const response = await fetch('/package', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({Content: base64}),
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

