import React, { useState } from 'react';
// const PackageData = require('../../../backend/models/packagedata');

function PackageURLForm() {
    const [packageUrl, setPackageUrl] = useState(''); // 

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
    } else {
      console.error('Failed to create package.');
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
    </form>
  );
}

export default PackageURLForm;

