import React, { useState } from 'react';

function PackageForm() {
  const [ownerName, setOwnerName] = useState(''); // initialize var to empty string
  const [repoName, setRepoName] = useState('');
  const [url, setUrl] = useState('');
  const [scores, setScores] = useState('');

  const handleSubmit = async (event) => { // event called when the user submits a form
    event.preventDefault(); // default is refresh page, turn that off
    const packageData = {
      owner_name: ownerName,
      repository_name: repoName,
      url,
      scores: scores.split(','),
    };
    const response = await fetch('/api/packages', { // use fetch API to make a POST request to the endpoint
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packageData),
    });
    if (response.ok) {
      console.log('Package created successfully!');
    } else {
      console.error('Failed to create package.');
    }
  };

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
          value={url}
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
      <button type="submit">Create Package</button>
    </form>
  );
}

export default PackageForm;
