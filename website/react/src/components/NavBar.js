import React, { useState, useEffect } from 'react';

function NavBar() {
return (
    <nav>
        <ul>
            <li>
                <Link to="/">Home</Link>
            </li>
            <li>
                <Link to="/search">Search</Link>
            </li>
            <li>
                <Link to="/intake">Package Intake</Link>
            </li>
        </ul>
    </nav>
    );
}
  
export default NavBar;

