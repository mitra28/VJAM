import React, { useState } from 'react';

function PackageForm() {
  const  [zipfile, setFile] = useState(''); // 

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const packageData = new FormData();
    packageData.append('file', zipfile);
  
    const response = await fetch('/api/packages', { // use fetch API to make a POST request to /api/packages endpoint
      method: 'POST',
      body: packageData,
    });
    
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

export default PackageForm;

