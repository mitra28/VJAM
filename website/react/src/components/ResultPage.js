import React, { useState } from 'react';

function ResultPage(props) {

  return (
    <div className="ResultPage">
        <ul>
          <p>{props.package.name}</p>
          <li>Version: {props.package.version}</li>
        </ul>
    </div>
  );
}

export default ResultPage;

