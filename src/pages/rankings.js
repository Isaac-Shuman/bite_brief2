
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

  useEffect(() => {
    axios.get('/api/data')
      .then(response => {
        setData(response.data.message);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  return (
    <div className="App">
      <h1>React and Node.js Integration</h1>
      <p>Message from the server: {data}</p>
    </div>
  );
}

export default ServerConnection;

