import React from "react";
import {Link, Outlet} from "react-router-dom";

const Layout = () => {
  return (
    <div>
      <h1>Welcome to Our Website</h1>
      <div><Link to="search">Search</Link></div>
      <div><Link to="resetform">Registry Reset</Link></div>
      <div><Link to="idform">Package Retrieve</Link></div>
      <div><Link to="putidform">Package Update</Link></div>
      <div><Link to="deleteidform">Package Delete</Link></div>
      <div><Link to="packageform">Package Create</Link></div>
      <div><Link to="rateform">Package Rate</Link></div>
      <div><Link to="authenticate">Authentication</Link></div>
      
      <Outlet />
    </div>
  );
};

export default Layout;

//<div><Link to="bynamedeleteform">Package By Name Delete</Link></div>