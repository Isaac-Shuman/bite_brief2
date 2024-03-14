import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./Button";
import "./HeroSection.css";

function HeroSection() {
  return (
    <div className="hero-container">
      <h1>ALL-IN-ONE HEALTH GUIDE</h1>
      <p>Track your fav dish</p>
      <p>Custumized dietary preferences</p>
      <p>...and more!</p>

      <div className="hero-btns">
        <Button
          className="btns"
          buttonStyle="btn--primary"
          buttonSize="btn--large"
        >
          GET STARTED
        </Button>
      </div>

      <div className="user-of-the-day">
        <h3>User Of The Day!</h3>
      </div>
    </div>
  );
}

export default HeroSection;
