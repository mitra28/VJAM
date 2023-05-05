import React, { useState } from 'react';
import JSZip from 'jszip';
const encoder = new TextEncoder();

// const PackageData = require('../../../backend/models/packagedata');

function PackageForm() {
    const [packageUrl, setPackageUrl] = useState('');
    const  [zipfile, setFile] = useState(null); 
    const [scores, setScores] = useState(null); 
    // const [id, setID] = useState(null); 
    // const [name, setName] = useState(null); 
    // const [version, setVersion] = useState(null); 
    // const [url, setURL] = useState(null);
    const [metadata, setMetaData] = useState('');
    const [data, setData] = useState('');
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
        const output = await response.json();
        console.log(output);
        const val = output.value;
        // setID(output.id);
        // setName(output.name);
        // setVersion(output.version);
        // setURL(output.URL);
        setMetaData(val.metadata);
        console.log(metadata);
        setData(val.data);
        console.log(data);
        setErrorMessage('');
        
        // console.log(`url scores: ${scores.scores.URL}`);
      } else {
        console.error('Failed to create package.');
        // setID(null);
        // setName(null);
        // setVersion(null);
        setMetaData('');
        setData('');
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

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="url">Enter a package URL:</label>
        <input type="text" id="url" name="url" value={packageUrl} onChange={handleUrlChange} />
      </div>
      <div>
        <label htmlFor="file">Choose a zipfile:</label>
        <input type="file" id="file" name="file" onChange={handleFileChange} />
      </div>
      <button type="submit">Create Package</button>

      {errorMessage && <div>{errorMessage}</div>}
      {metadata && data && (
        <div>
          <p>Name: {metadata.Name}</p>
          <p>Version: {metadata.Version}</p>
          <p>ID: {metadata.ID}</p>
          <p>URL: {data.URL}</p>
          
        </div>
      )}
    </form>
  );
}

export default PackageForm;

