import React from "react";
import {Link, Outlet} from "react-router-dom";

const Layout = () => {
  return (
    <div>
      <h1>Welcome to Our Website</h1>
      <div><Link to="search">Search</Link></div>
      <div><Link to="idform">IDForm</Link></div>
      <div><Link to="deleteidform">Delete Package</Link></div>
      <div><Link to="putidform">Put Package</Link></div>
      <div><Link to="packageform">PackageForm</Link></div>
      <Outlet />
    </div>
  );
};

export default Layout;
