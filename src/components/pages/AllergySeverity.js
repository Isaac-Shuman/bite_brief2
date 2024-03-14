// import React from "react";
// // Add any other imports you need, like styles or other components

// const AllergySeverity = () => {
//   return (
//     <div>
//       <h1>Allergy Severity Information</h1>
//     </div>
//   );
// };

// export default AllergySeverity;

import "../../App.css";
import React, { useState, useEffect } from "react";
import "./Trending.css";
import axios from "axios";

const Trending = ({ loggedIn }) => {
  const [popularItems, setPopularItems] = useState([
    { name: "Item 1     ", likes: 10 },
    { name: "Item 2     ", likes: 15 },
    { name: "Item 3     ", likes: 20 },
    { name: "Item 4     ", likes: 25 },
    { name: "Item 5     ", likes: 30 },
  ]);

  useEffect(() => {
    axios({
      method: "post",
      url: "/api/favdishes",
    })
      .then((response) => {
        setPopularItems(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [loggedIn]);

  return (
    <div className="trending-container">
      <h1 className="trending">WHAT'S TRENDING</h1>
      <div className="popular-items">
        {popularItems.slice(0, 10).map((item, index) => (
          <div className="item" key={index}>
            <span className="item-name">{item.name}</span>
            <span className="item-likes">
              <i className="fas fa-heart"></i> {item.likes}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Trending;
