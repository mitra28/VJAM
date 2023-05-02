import React, { useState } from 'react';

function ResultPage(props) {

  return (
    <div className="ResultPage">
        <ul>
            <p>{props.package.owner}</p>
            <li>Repo: {props.package.repo}</li>
            <li>Score: {props.package.net_score}</li>
        </ul>
    </div>
  );
}

export default ResultPage;

