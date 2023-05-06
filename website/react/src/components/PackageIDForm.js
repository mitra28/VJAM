import React, { useState } from 'react';

function PackageIDForm() {
  const [packageID, setPackageID] = useState(''); // 
  const [metadata, setMetadata] = useState(''); 
  const [data, setData] = useState(''); 
  const [errorMessage, setErrorMessage] = useState('');

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
      const value = await response.json();
      
      setMetadata(value.output.metadata);
      setData(value.output.Data)

      console.log(value.output.metadata);
      console.log(value.output.Data);
      console.log(data);
      console.log(metadata);
      setErrorMessage('');
    } else {
      console.error('Failed to create package.');
      setMetadata(null);
      setData(null);
      setErrorMessage('Failed to put package.');
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
      {errorMessage && <div>{errorMessage}</div>}
      {metadata && data && (
      <div>
          <p>Name: {metadata.Name}</p>
          <p>Version: {metadata.Version}</p>
          <p>ID: {metadata.ID}</p>
          <p>Content: {data.Content}</p>
        </div>
        )}
    </form>
  );
}

export default PackageIDForm;