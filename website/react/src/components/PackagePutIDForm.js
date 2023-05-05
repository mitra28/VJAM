import React, { useState } from 'react';

function PackagePutIDForm() {
  const [packageID, setPackageID] = useState(''); // 
  const [metadata, setMetadata] = useState(null); 
  const [data, setData] = useState(null); 

  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Package put handle submit!');
  
    
    const response = await fetch(`/package/${packageID}`, { // use fetch API to make a POST request to /api/packages endpoint
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    
    if (response.ok) {
      console.log('Package put successfully!');
      const value = await response.json();
      setMetadata(value.output.metadata);
      setData(value.Data)
      setErrorMessage('');
    } else {
      //const errormsg = await response.json();
      console.error('Failed to put package.');
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
      <button type="submit">Put Package</button>
      {errorMessage && <div>{errorMessage}</div>}
      {metadata && data && (
      <div>
          <p>Name: {metadata.name}</p>
          <p>Version: {metadata.version}</p>
          <p>ID: {metadata.id}</p>
          <p>Content: {data.content}</p>
        </div>
        )}
    </form>
  );
}

export default PackagePutIDForm;