import React, { useState } from 'react';
import JSZip from 'jszip';
const encoder = new TextEncoder();

// Now you can use the getUrlFromPackageJson function in this module

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

