import React, { useState } from 'react';

function PackageForm() {
  const [ownerName, setOwnerName] = useState(''); // initialize var to empty string
  const [repoName, setRepoName] = useState('');
  const [URL, setUrl] = useState('');
  const [scores, setScores] = useState('');
  const  [zipfile, setFile] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const packageData = new FormData();
    packageData.append('owner_name', ownerName);
    packageData.append('repository_name', repoName);
    packageData.append('url', URL);
    packageData.append('scores', scores.split(','));
    packageData.append('file', zipfile);
  
    const response = await fetch('/api/packages', { // use fetch API to make a POST request to the endpoint
      method: 'POST',
      body: packageData,
    });
    
    if (response.ok) {
      console.log('Package created successfully!');
    } else {
      console.error('Failed to create package.');
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="owner-name">Owner Name:</label>
        <input
          type="text"
          id="owner-name"
          value={ownerName}
          onChange={(event) => setOwnerName(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="repo-name">Repository Name:</label>
        <input
          type="text"
          id="repo-name"
          value={repoName}
          onChange={(event) => setRepoName(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="url">URL:</label>
        <input
          type="text"
          id="url"
          value={URL}
          onChange={(event) => setUrl(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="scores">Scores:</label>
        <input
          type="text"
          id="scores"
          value={scores}
          onChange={(event) => setScores(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="file">Choose a file:</label>
        <input type="file" id="file" name="file" onChange={handleFileChange} />
      </div>
      <button type="submit">Create Package</button>
    </form>
  );
}

export default PackageForm;

