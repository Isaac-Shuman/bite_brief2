import React from "react";
import Navbar from "./components/Navbar";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Myprofile from "./components/pages/Myprofile";
import Trending from "./components/pages/Trending";
import Home from "./components/pages/Home";
import SignUp from "./components/pages/SignUp";
import AboutUs from "./components/pages/AboutUs";
import RecommendedDish from "./components/pages/RecommendedDish";

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/myprofile" component={Myprofile} />
          <Route path="/trending" component={Trending} />
          <Route path="/sign-up" component={SignUp} />
          <Route path="/aboutus" component={AboutUs} />
          <Route path="/recommendeddish" component={RecommendedDish} />
        </Switch>
      </Router>
    </>
  );
}

export default App;
