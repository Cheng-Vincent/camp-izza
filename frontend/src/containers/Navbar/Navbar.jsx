import React from "react";
import "../Navbar/Navbar.css";
import { Outlet, Link } from "react-router-dom";

const Navbar = () => {
  return (
    <>
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <button
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarTogglerDemo01"
          aria-controls="navbarTogglerDemo01"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarTogglerDemo01">
          <a class="navbar-brand" href="#">
            Youth Spiritual Summit
          </a>
          <ul class="navbar-nav mr-auto mt-2 mt-lg-0"></ul>
          <div class="form-inline my-2 my-lg-0">
            <Link to="/">
              <a class="nav-link" href="#">
                HOME
              </a>
            </Link>
          </div>
        </div>
      </nav>
      <Outlet />
    </>
  );
};

export default Navbar;
