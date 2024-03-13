import React, { useState, useEffect } from "react";
import axios from "axios";
import "./RecommendedDish.css";

export default function RecommendedDishes() {
  const [userID, setUserID] = useState("");
  const [mealPeriodID, setMealPeriodID] = useState("");
  const [recommendedDishes, setRecommendedDishes] = useState([]);
  const [FavFoods, setFavFoods] = useState([Array().fill(null)]);
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteDishes, setFavoriteDishes] = useState([]);

  const fetchRecommendedDishes = async () => {
    if (!userID || !mealPeriodID) {
      alert("Both User ID and Meal Period ID are required.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        `/api/recommendeddish?userID=${userID}&mealPeriodID=${mealPeriodID}`
      );
      setRecommendedDishes(response.data);
      // console.log("Recommended Dishes:", response.data);
    } catch (error) {
      console.error("Error fetching recommended dishes:", error);
      alert("Failed to fetch recommended dishes.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFavorites = async () => {
    axios({
      method: "post",
      url: "/api/myFavDishes",
      data: {
        id: userID,
      },
    })
      .then((response) => {
        setFavFoods(response.data);
        // console.log(FavFoods);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const addToFavorites = async (foodID) => {
    if (!userID) {
      alert("User ID is required.");
      return;
    }

    try {
      const response = await axios.post("/api/addToFavorites", {
        userID,
        foodID,
      });
      if (response.status === 200) {
        alert("Dish added to favorites successfully!");
        // console.log(response);
        fetchFavorites(); // Re-fetch favorites to update the list
      } else {
        alert("Failed to add dish to favorites.");
      }
    } catch (error) {
      console.error("Error adding to favorites:", error);
      alert("Failed to add dish to favorites.");
    }
  };

  useEffect(() => {
    if (userID) {
      fetchFavorites(); // Fetch favorites when the userID is set or changed
    }
  }, [userID]);

  return (
    <div className="recommended-dishes">
      <input
        type="text"
        className="input-box"
        placeholder="Input User ID"
        value={userID}
        onChange={(e) => setUserID(e.target.value)}
      />
      <input
        type="text"
        className="input-box"
        placeholder="Input Meal Period ID"
        value={mealPeriodID}
        onChange={(e) => setMealPeriodID(e.target.value)}
      />
      <button
        className="button"
        onClick={fetchRecommendedDishes}
        disabled={isLoading}
      >
        Fetch Dishes
      </button>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {recommendedDishes.slice(0, 20).map((dish) => {
            // console.log(dish);

            // return the JSX for each dish
            return (
              <li key={dish.id}>
                <span className="dish-name">{dish.name}</span> -{" "}
                <button
                  onClick={() => {
                    // console.log(`Adding dish to favorites: ${dish.id}`);
                    addToFavorites(dish.id);
                  }}
                >
                  Add to Favorites
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {/* <h2>Your Favorite Foods</h2> */}
      <ul>
        {favoriteDishes.map((dish) => (
          <li key={dish.id}>{dish.name}</li>
        ))}
      </ul>
    </div>
  );
}
