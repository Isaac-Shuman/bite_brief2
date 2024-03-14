import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./Button";
import "./Navbar.css";

function Navbar() {
  const [click, setClick] = useState(false);
  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);
  const [button, setButton] = useState(true);

  const showButton = () => {
    if (window.innerWidth <= 960) {
      setButton(false);
    } else {
      setButton(true);
    }
  };

  window.addEventListener("resize", showButton);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            Bitebrief <i class="fa-solid fa-seedling"></i>
          </Link>
          <div className="menu-icon" onClick={handleClick}>
            <i className={click ? "fas fas fa-times" : "fas fa-bars"} />
          </div>
          <ul className={click ? "nav-menu active" : "nav-menu"}>
            <li className="nav-item">
              <Link to="/" className="nav-links" onClick={closeMobileMenu}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/myprofile"
                className="nav-links"
                onClick={closeMobileMenu}
              >
                My Profile
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/recommendeddish"
                className="nav-links"
                onClick={closeMobileMenu}
              >
                Recommended Dishes
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/aboutus"
                className="nav-links"
                onClick={closeMobileMenu}
              >
                About US
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/trending"
                className="nav-links"
                onClick={closeMobileMenu}
              >
                What's Trending
              </Link>
            </li>

            <li className="nav-item">
              <Link
                to="/allergyseverity"
                className="nav-links"
                onClick={closeMobileMenu}
              >
                Allergy Severity
              </Link>
            </li>
          </ul>
          {button && <Button buttonStyle="btn--outline">SIGN UP</Button>}
        </div>
      </nav>
    </>
  );
}

export default Navbar;
