import React, { useState } from "react";
import { NavLink } from "react-router-dom";

import "./Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav>
      <h5 to="/" className="header">
         BLOC-VOTE
      </h5>
      <ul
        className="navbar-links"
        style={{ width: "60%", transform: open ? "translateX(0px)" : "" }}
      >
        <li>
          <NavLink to="/" className="header">
          <i className="fab fa-hive"></i> HOME
          </NavLink>
        </li>
        
        <li>
          <NavLink to="/Registration" activeClassName="nav-active">
            <i className="far fa-registered" /> Registration
          </NavLink>
        </li>
        <li>
          <NavLink to="/Voting" activeClassName="nav-active">
            <i className="fas fa-vote-yea" /> Voting
          </NavLink>
        </li>
        <li>
          <NavLink to="/Standing" activeClassName="nav-active">
            <i className="fas fa-poll" /> Standing
          </NavLink>
        </li>
        <li>
          <NavLink to="/Results" activeClassName="nav-active">
            <i className="fas fa-poll-h" /> Results
          </NavLink>
        </li>
        <li>
          <NavLink to="/Transactions" activeClassName="nav-active">
            <i className="fas fa-poll-h" /> Transactions
          </NavLink>
        </li>
       
        
      </ul>
      <i onClick={() => setOpen(!open)} className="fas fa-bars burger-menu"></i>
    </nav>
  );
}
