// Filename - "./components/Navbar.js

import React from "react";
import { Nav, NavLink, NavMenu } from "./NavbarElements";

const Navbar = () => {
  return (
    <>
      <Nav>
        <NavMenu>
          <NavLink to="/comdishes" activeStyle>
            comdishes
          </NavLink>
          <NavLink to="/customize">Favdishes</NavLink>
          <NavLink to="/signin" activeStyle>
            Signin
          </NavLink>
          <NavLink to="/yourmom" activeStyle> yourmom </NavLink>
          <NavLink to="/rankings" activeStyle> Rankings </NavLink>
        </NavMenu>
      </Nav>
    </>
  );
};

export default Navbar;
