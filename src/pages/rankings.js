
import React from "react";
import { useEffect, useState } from 'react';
import axios from 'axios';

const Rankings = () => {
  return (
    <div>
      <h1>This is Isaac's page</h1>
    </div>
  );
};


function ServerConnection() {
  const [data, setData] = useState('');

  //I think we are technically supposed to have a url here that is less random and more associated with our website
  useEffect(() => {
    axios.get('/api/rankings') 
      .then(response => {
        setData(response.data.message);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  var msg = "";
  for (let i =0; i<data.length; i++){
    msg = msg + data[i].id + "   ";
    msg = msg + data[i].name + "<br />";
  }
  /*
  make an array = []
  for (let i =0; i<5; i++)
  {
    display object with data from serverping3
  }
  */

  return (
    <div className="App">
      <h1>React and Node.js Integration</h1>
      <p>Full Message from server: {JSON.stringify(data)}</p>
      <p>After for-loop processing: {msg}</p>
      <p>The linebreak (br) thing doesn't work as a string but let's fix that later</p>
    </div>
  );
}

export default ServerConnection;

