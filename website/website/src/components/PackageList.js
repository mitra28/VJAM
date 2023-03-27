import React from 'react';
import Package from './Package';

function PackageList() {
  const packages = [
    new Package('Lodash', "Lodash", 1),
    new Package('2Lodash', "Repository", 0.5),
    new Package('3Lodash', "Repo Name", 0.45),
  ];

  return (
    <div>
      <h2>Choose a Package</h2>
      <ul>
        {packages.map((pkg) => (
          <li key={pkg.owner}>
            <h3>{pkg.owner}</h3>
            <p>Repo: {pkg.repo}</p>
            <p>Score: {pkg.net_score}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PackageList;
