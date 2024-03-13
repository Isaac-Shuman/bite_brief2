// import React from "react";
// // import RecommendedDish from "./RecommendedDish";

// const RecommendedDish = () => {
//   return <h1>About Us</h1>;
// };

// export default RecommendedDish;
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function RecommendedDishes() {
  const [dishes, setDishes] = useState([]);
  const [userID, setUserID] = useState(0); // Same as in your Myprofile component

  useEffect(() => {
    if (userID !== 0) {
      // Check that userID is not the initial value
      const fetchDishes = async () => {
        try {
          const response = await axios.get(`/api/user/recommendedDishes`, {
            params: { userID }, // Pass userID as query parameter
          });
          console.log(response);
          setDishes(response.data); // Set fetched dishes to state
        } catch (error) {
          console.error("Error fetching recommended dishes:", error);
        }
      };

      fetchDishes();
    }
  }, [userID]); // Rerun effect if userID changes

  return (
    <div>
      <input
        type="text"
        placeholder="Input user ID"
        value={userID === 0 ? "" : userID} // If userID is 0 (initial state), show empty string
        onChange={(event) => setUserID(Number(event.target.value))}
      />
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
