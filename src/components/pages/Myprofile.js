import React from "react";
import "../../App.css";
import { useState, useEffect, useContext } from "react";
import "./Trending.css";
import axios from "axios";
import { SignInContext } from "../../App.js";

function EnterDish({handleSearchChange}) {
  return (
  <>
  <div>
        <h2>1. My Favorite Dish</h2>
        <input
          type='text'
          placeholder='Search for your favorite dish...'
          onChange={handleSearchChange}
        />
        <button type="submit"><i class="fa fa-search"></i></button>
        {/* Connect to backend database to fetch favorite dish */}
  </div>
  <br></br>
  </>
  );
}

function SelectAllergies({handleAllergySelect})
{
  return (
    <>
    <div>
    <h2>2. My Allergies</h2>
    <select onChange={handleAllergySelect}>
      <option value="">Select Allergy</option>
      <option value="Peanuts">Peanuts</option>
      <option value="Shellfish">Shellfish</option>
      <option value="Gluten">Gluten</option>
      <option value="Eggs">Eggs</option>
      <option value="Diary">Diary</option>
      {/* Add more allergy options */}
    </select>
    {/* Connect to backend database to fetch and save allergies */}
  </div>
  <br></br>
  </>

  );
}

function DishSearchRes({searchPerformed, matchMeals, userID, addToFavorites})
{
  return (
    <div>
    <h3>Search Results:</h3>
    {searchPerformed && matchMeals.length === 0 ? (
      <p>No dishes found...</p>
    ) : (
      matchMeals.map((meal, index) => (
        <div key={index} className="search-result">
          <span>{meal.name}</span>
          <button onClick={() => addToFavorites(userID, meal.id)}>
            Add to Favorites
          </button>
        </div>
      ))
    )}
  </div>
  );
}

function HealthGoal({handleGoalSelect})
{
  return (
  <div>
        <h2>3. My Health Goal</h2>
        <input
          type="radio"
          id="goal1"
          name="healthGoal"
          value="goal1"
          onChange={handleGoalSelect}
        />
        <label htmlFor="goal1">Increased energy levels:</label>
        <br />
        <input
          type="radio"
          id="goal2"
          name="healthGoal"
          value="goal2"
          onChange={handleGoalSelect}
        />
        <label htmlFor="goal2">Gain Muscle</label>
        <br />
        <input
          type="radio"
          id="goal3"
          name="healthGoal"
          value="goal3"
          onChange={handleGoalSelect}
        />
        <label htmlFor="goal3">Control Blood Sugar</label>
        <br />
        {/* Add more health goal options */}
          {/* Connect to backend database to save selected health goal */}
  </div>
  );
}

function Useless({matchMeals})
{
  return (
  <div className="popular-items">
        {matchMeals.map((item, index) => (
          <div className="item" key={index}>
            <span className="item-name">{item.name}</span>
            <span className="item-likes">
              <i className="fas fa-heart"></i> {item.likes}
            </span>
            <button type="submit">
              <i class="fa fa-search"></i>
            </button>
          </div>
        ))}
  </div>
  );
}

function YourFavorites({favFoods, setReRender, reRender, setUserID, removeFood})
{
  return (
  <div>
  <input
    type="text"
    placeholder="For now, input a user id number (1~6)"
    onChange={(event) => {
      // console.log(JSON.stringify(event.target.value));
      setUserID(Number(event.target.value));
      setReRender(!reRender);
    }}
  />
  <h1> Your favorite foods</h1>
  {favFoods.map((item, index) => (
    <div className="item" key={index}>
      <span className="item-name">{item.name}</span>
      {/* <h1>{JSON.stringify(favFoods[index])} </h1>  */}

      <button
        onClick={() => {
          removeFood(favFoods[index].id);
        }}
      >
        {" "}
        Remove{" "}
      </button>
    </div>
  ))}
  </div>
  );
}

export default function Myprofile() {
  const [typedText, setText] = useState("");
  const [matchMeals, setMatchMeals] = useState([Array(9).fill(null)]);
  const [searchPerformed, setSearchPerformed] = useState(false);

    ////////////Beatrice:
  //get this user's favorite foods from the server
  const [userID, setUserID] = useState(0);
  const [reRender, setReRender] = useState(true);
  const [favFoods, setFavFoods] = useState([Array().fill(null)]);
  
  const loggedin = useContext(SignInContext);

  // Function to handle search bar change
  const handleSearchChange = async (event) => {
    const searchTerm = event.target.value;
    setText(searchTerm);

    if (searchTerm.trim() === "") { //|| userID === 0) {
      setMatchMeals([]);
      setSearchPerformed(false); // when a search has not been performed or is not valid
      return;
    }

    try {
      const response = await axios.get(`/api/search`, {
        params: {
          term: searchTerm,
          userID: userID,
        },
      });
      if (response.data && response.data.length > 0) {
        // If there are search results, update the state
        setMatchMeals(response.data);
      } else {
        // If there are no search results
        setMatchMeals([]); // Keep matchMeals as an empty array
      }
      setSearchPerformed(true); // when a search has been performed
    } catch (error) {
      console.error("Search error:", error);
      setMatchMeals([]);
      setSearchPerformed(false);
    }
  };

  const addToFavorites = async (userID, foodID) => {
    try {
      // Logging to ensure IDs are correct before sending
      //console.log("Adding to favorites:", { userID, foodID });

      // Using Axios to send a POST request
      const response = await axios.post("/api/user/addToFavorites", {
        userID, // Assuming userID is already defined and valid
        foodID,
      });

      // Check if the response was successful
      if (response.status === 200) {
        alert(response.data.message); // Or update UI to show success
      } else {
        console.error("Failed to add to favorites:", response.data.message);
      }
    } catch (error) {
      // If there's an error with the request itself, it will be caught here
      console.error(
        "Error adding to favorites:",
        error.response ? error.response.data : error
      );
    }
    setReRender(!reRender);
  };

  // Function to handle allergy selection
  const handleAllergySelect = (event) => {
    // Get selected allergy value
    const selectedAllergy = event.target.value;
    // Connect to backend database to save selected allergy
    console.log("Selected allergy:", selectedAllergy);
  };

  // Function to handle health goal selection
  const handleGoalSelect = (event) => {
    // Get selected goal value
    const selectedGoal = event.target.value;
    // Connect to backend database to save selected health goal
    console.log("Selected health goal:", selectedGoal);
  };


  useEffect(() => {
    //initially render all dishes(trending)
    axios({
      method: "post",
      url: "/api/user/favdishes", //url: '/api/profile',
      data: {
        // meal: typedText
      },
    })
      .then((response) => {
        setMatchMeals(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [reRender]);

  useEffect(() => {
    //render all fav dishes of this user
    axios({
      method: "post",
      url: "/api/user/myFavDishes",
      data: {
        id: userID,
      },
    })
      .then((response) => {
        setFavFoods(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [reRender]);

  //clicked the remove button on a food item
  const removeFood = (foodID) => {
    // setReRender(!reRender);
    axios({
      method: "delete",
      url: "/api/user/myFavDishes",
      data: {
        Uid: userID,
        Fid: foodID,
      },
    })
      .then((response) => {
        console.log("deleted %d, code: %s", foodID, response);
      })
      .catch((error) => {
        console.error(error);
      });

    setReRender(!reRender); //to redisplay updated dishes
  };
  ////////////
  if (loggedin)
  {
  return (
    <div className="myprofile">
      <EnterDish handleSearchChange={handleSearchChange}/>
      <DishSearchRes searchPerformed={searchPerformed} matchMeals={matchMeals} userID={userID} addToFavorites ={addToFavorites}/>
      <SelectAllergies handleAllergySelect={handleAllergySelect}/>
      <HealthGoal handleGoalSelect={handleGoalSelect}/>
      <YourFavorites favFoods={favFoods} setReRender={setReRender} reRender={reRender} setUserID={setUserID} removeFood={removeFood}/>
    </div>
  );
  }
  else {
    return (
      <h1> Please login </h1>
    )
  }
}
