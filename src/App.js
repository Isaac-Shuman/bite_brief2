// Filename - App.js

import React from "react";
import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages";
import Comdishes from "./pages/comdishes";
import Favdishes from "./pages/favdishes";
import Signin from "./pages/signin";
import Rankings from "./pages/rankings";
//import Home from "./pages/home";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/comdishes" element={<Comdishes />} />
        <Route path="/customize" element={<Favdishes />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/rankings" element={<Rankings />} />
      </Routes>
    </Router>
  );
}

export default App;
