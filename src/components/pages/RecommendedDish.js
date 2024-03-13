// import React from "react";
// // import RecommendedDish from "./RecommendedDish";

// const RecommendedDish = () => {
//   return <h1>About Us</h1>;
// };

// export default RecommendedDish;
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function RecommendedDishes({loggedIn}) {
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await axios.get(`/api/user/recommendedDishes`, {
          //params: { userID }, // Pass userID as query parameter
        });
        console.log(response);
        setDishes(response.data); // Set fetched dishes to state
      } catch (error) {
        console.error("Error fetching recommended dishes:", error);
      }
    };
    fetchDishes();
  }, [loggedIn]); // Rerun effect if userID changes

  if (loggedIn) {
  return (
    <div>
      <h1>Recommended Dishes</h1>
      <div className="dishes-list">
        {dishes.map((dish, index) => (
          <div key={index} className="dish">
            <span>{dish.name}</span>
            {/* Add more dish details here */}
          </div>
        ))}
      </div>
    </div>
  );
  }
  else {
    return (
      <h1> Please login </h1>
    )
  }
}
