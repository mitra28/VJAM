import React, { useState } from 'react';
// const PackageData = require('../../../backend/models/packagedata');

function PackageZipForm() {
  const  [zipfile, setFile] = useState(null); // 

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Package handle submit!');
  
    const formData = new FormData();
    formData.append('zipfile', zipfile);

    const response = await fetch('/packages', {
      method: 'POST',
      body: formData,
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

