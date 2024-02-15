//Code ripped from: https://www.linkedin.com/pulse/connecting-reactjs-nodejs-bit-by-bit-guide-ataur-rahman/

const express = require('express');
const app = express();
const port = 3001; //arbitrary

app.get('/api/data', (req, res) => {
  // Handle your API logic here
  const data = { message: 'your mom' };
  res.json(data);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

