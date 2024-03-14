import React, {useState, useEffect} from "react";
import { Link } from "react-router-dom";
import { Button } from "./Button";
import axios from "axios";
import "./HeroSection.css";

function HeroSection() {
  const [randUser, setRandUser] = useState();
  const [randFact, setRandFact] = useState();

    useEffect(() => {
    //render all fav dishes of this user
    axios({
      method: "get",
      url: "/api/user/random",
      data: { },
    })
      .then((response) => {
        setRandUser(response.data.user.username);
        setRandFact(response.data.user.fun_fact);
        console.log("hm", randUser);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

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
        <p>{randUser}</p>
        <p>{randFact}</p>
      </div>
    </div>
  );
}

export default HeroSection;
