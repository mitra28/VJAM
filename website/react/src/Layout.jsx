import React from "react";
import {Link, Outlet} from "react-router-dom";

const Layout = () => {
  return (
    <div>
      <h1>Welcome to Our Website</h1>
      <Link to="search">Search</Link>
      <Link to="urlform">URLForm</Link>
      <Link to="zipform">ZipForm</Link>
      <Outlet />
    </div>
  );
};

export default Layout;
