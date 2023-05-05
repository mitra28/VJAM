import React, { useState } from 'react';

function ResultPage(props) {

  const getResults = (event) =>{
    event.preventDefault();
    console.log(`Deleting package ${props.package.name}`);
  }

  return (
    <div className="ResultPage">
        <ul>
          <p>{props.package.name}</p>
          <li>Repo: {props.package.name}</li>
          <li>Score: {props.package.name}</li>
          <form className="deleteRepo" onSubmit={getResults}>
            <label>Delete package: 
              <input type="submit"></input>
            </label>
          </form>
        </ul>
    </div>
  );
}

export default ResultPage;

