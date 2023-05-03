import React, { useState } from 'react';

function PackageIDForm() {
    const [packageID, setPackageID] = useState(''); // 

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Package handle submit!');
  
    
    const response = await fetch(`/package/${packageID}`, { // use fetch API to make a POST request to /api/packages endpoint
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    
    if (response.ok) {
      console.log('Package created successfully!');
    } else {
      console.error('Failed to create package.');
    }
  };

  const handleIDChange = (event) => {
    setPackageID(event.target.value);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="url">Enter a package ID:</label>
        <input type="text" id="id" name="id" value={packageID} onChange={handleIDChange} />
      </div>
      <button type="submit">Get Package</button>
    </form>
  );
}

export default PackageIDForm;