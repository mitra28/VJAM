import React, { useState } from 'react';

function PackageByNameDeleteForm() {
  const [packageName, setPackageName] = useState(''); // 
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Package put handle submit!');
  
    
    const response = await fetch(`/package/byName/${packageName}`, { // use fetch API to make a POST request to /api/packages endpoint
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    
    if (response.ok) {
      console.log('Package put successfully!');
      setErrorMessage('');
    } else {
      console.error('Failed to put package.');
      setErrorMessage('Failed to put package.');
    }
  };

  const handleNameChange = (event) => {
    setPackageName(event.target.value);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="url">Enter a package ID:</label>
        <input type="text" id="id" name="id" value={packageName} onChange={handleNameChange} />
      </div>
      <button type="submit">Delete Package</button>
      {errorMessage && <div>{errorMessage}</div>}
    </form>
  );
}

export default PackageByNameDeleteForm;