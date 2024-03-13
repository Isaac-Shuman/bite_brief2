
import React from 'react';
import Navbar from './components/Navbar';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Myprofile from './components/pages/Myprofile';
import Trending from './components/pages/Trending';
import Home from './components/pages/Home';
import SignUp from './components/pages/SignUp';
import AboutUs from './components/pages/AboutUs';
import { createContext, useEffect, useState} from 'react'
import axios from "axios";
import RecommendedDish from "./components/pages/RecommendedDish";
import { ToastContainer } from 'react-toastify';


export const SignInContext = createContext(false);


function WrappedProfile(loggedIn)
{
  return (
    <SignInContext.Provider value={loggedIn}>
      <Myprofile />
    </SignInContext.Provider>
  );
}

function SignInWithState()
{
  
  return (
    <SignUp />
  )
}
function App() {
  const [userID, setUserID] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false)
  useEffect(() => {
    axios({
      method: "get",
      url: "/api/user/uid", 
    })
      .then((response) => {
        console.log("recieved id %s", JSON.stringify(response.data))
        //setUserID(Number(response.data.userID));
        //console.log("User id is %d", userID)
      })
      .catch((error) => {
        console.error(error);
      });
  }, [loggedIn]);

  return (
    <>
      <Router>
        <Navbar />
        <Switch>
          <Route path='/' exact component={Home} />
 
          <Route path='/myprofile' exact render ={() =>
            <SignInContext.Provider value={loggedIn}>
              <Myprofile />
            </SignInContext.Provider>
            } />
          <Route path='/trending' component={Trending} loggedIn={loggedIn}/>
          <Route path='/sign-up' exact render={() => 
            <SignUp loggedIn={loggedIn} setLoggedIn={setLoggedIn}/>
          } />
          <Route path="/aboutus" component={AboutUs} />
          <Route path="/recommendeddish" component={RecommendedDish} />
        </Switch>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
