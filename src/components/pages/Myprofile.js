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

function DishSearchRes({searchPerformed, matchMeals, userID, addToFavorites})
{
  return (
    <div>
    <h3>Search Results:</h3>
    {searchPerformed && matchMeals.length === 0 ? (
      <p>No dishes found...</p>
    ) : (
      matchMeals.slice(0, 10).map((meal, index) => (
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

{/* <SelectDiet diets = {leftDiets} addDiet={addDiet}/>
<SelectAllergy allergies ={leftAllergies} addAllergy = {addAllergy}/> */}

function SelectDiet({diets, addDiet})
{
  return (
    <>
    <div>
    <h2>2. Add Diets</h2>
    {/* <select onChange={addDiet}>
      <option value="">Select Allergy</option>
      <option value="Peanuts">Peanuts</option>
      <option value="Shellfish">Shellfish</option>
      <option value="Gluten">Gluten</option>
      <option value="Eggs">Eggs</option>
      <option value="Diary">Diary</option>
    </select> */}
      {diets.map((item, index) => (
    <div className="item" key={index}>
      <span className="item-name">{item.name}</span>

      <button
        onClick={() => {
          addDiet(diets[index].id);
        }}
      >
        {" "}
        Add{" "}
      </button>
    </div>
  ))}
  </div>
  <br></br>
  </>

  );
}

function SelectAllergy({allergies, addAllergy})
{
  return (
  <div>
        <h2>3. Add Allergies</h2>
        {/* <input
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
        <br /> */}
        {allergies.map((item, index) => (
    <div className="item" key={index}>
      <span className="item-name">{item.name}</span>

      <button
        onClick={() => {
          addAllergy(allergies[index].id);
        }}
      >
        {" "}
        Add{" "}
      </button>
    </div>
  ))}
      
  </div>
  );
}


function YourFavorites({favFoods, removeFood})
{
  return (
  <div>
  <h1> Your favorite foods</h1>
  {favFoods.slice(0, 10).map((item, index) => (
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

function YourDiets({diets, removeDiet})
{
  return (
  <div>
  <h1> Your current diets</h1>
  {diets.map((item, index) => (
    <div className="item" key={index}>
      <span className="item-name">{item.name}</span>

      <button
        onClick={() => {
          removeDiet(diets[index].id);
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


function YourAllergies({allergies, removeAllergy, allergyIndices, updateAllergyIndex})
{
  return (
  <div>
  <h1> Your current allergies</h1>
  {allergies.map((item, index) => (
    <div className="item" key={index}>
      <span className="item-name">{item.name}</span>

      <button
        onClick={() => {
          removeAllergy(allergies[index].id);
        }}
      >
        {" "}
        Remove{" "}
      </button>
      <p1> How would you rate the severity of this allergy? </p1>
      <select onChange={(event) => {updateAllergyIndex(allergies[index].id, event.target.value)}} value={allergyIndices[index]}>
        <option value={0}>Rate Severity 1-3</option>
        <option value={1}>1- Barely notice it</option>
        <option value={2}>2- Problematic</option>
        <option value={3}>3- Anaphylaxis</option>
      {/* Add more allergy options */}
      </select>
    </div>
  ))}
  </div>
  );
}

export default function Myprofile() {
  const [typedText, setText] = useState("");
  const [matchMeals, setMatchMeals] = useState([Array(9).fill(null)]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [leftAllergies, setLeftAllergies] = useState([Array().fill(null)]);
  const [leftDiets, setLeftDiets] = useState([Array().fill(null)]);

    ////////////Beatrice:
  //get this user's favorite foods from the server
  const [userID, setUserID] = useState(0);
  const [reRender, setReRender] = useState(true);
  const [favFoods, setFavFoods] = useState([Array().fill(null)]);
  const [userAllergies, setUserAllergies] = useState([Array().fill(null)]);
  const [userDiets, setUserDiets] = useState([Array().fill(null)]);
  const [userIndices, setUserIndices] = useState([Array().fill(0)]);

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

  useEffect(() => {
    //render all selected diets
    axios({
      method: "post",
      url: "/api/user/myDiets",
      data: {
      },
    })
      .then((response) => {
        setUserDiets(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [reRender]);

  useEffect(() => {
    //render all selected allergies
    axios({
      method: "post",
      url: "/api/user/myAllergies",
      data: {
      },
    })
      .then((response) => {
        setUserAllergies(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [reRender]);

  useEffect(() => {
    //render all unselected allergies
    axios({
      method: "post",
      url: "/api/user/leftAllergies",
      data: {
      },
    })
      .then((response) => {
        setLeftAllergies(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
    }, [reRender]);

    useEffect(() => {
      //render all unselected diets
      axios({
        method: "post",
        url: "/api/user/leftDiets",
        data: {
        },
      })
        .then((response) => {
          setLeftDiets(response.data);
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

    reRenderPage(); //to redisplay updated dishes
  };

    //clicked the remove button on a diet item
    const removeDiet = (dietID) => {
      axios({
        method: "delete",
        url: "/api/user/myDiets",
        data: {
          Did: dietID,
        },
      })
        .then((response) => {
          console.log("deleted %d, code: %s", dietID, response);
        })
        .catch((error) => {
          console.error(error);
        });
  
      reRenderPage(); //to redisplay updated diets
    };

    //clicked the remove button on an allergy item
    const removeAllergy = (allergyID) => {
      axios({
        method: "delete",
        url: "/api/user/myAllergies",
        data: {
          Aid: allergyID,
        },
      })
        .then((response) => {
          console.log("deleted %d, code: %s", allergyID, response);
        })
        .catch((error) => {
          console.error(error);
        });
  
      reRenderPage(); //to redisplay updated diets
    };

    const addAllergy = async (allergyID) => {
      try {
        // Logging to ensure IDs are correct before sending
        //console.log("Adding to favorites:", { userID, foodID });
  
        // Using Axios to send a POST request
        const response = await axios.post("/api/user/addAllergy", {
          allergyID
        });
  
        // Check if the response was successful
        if (response.status === 200) {
          alert(response.data.message); // Or update UI to show success
        } else {
          console.error("Failed to add diet:", response.data.message);
        }
      } catch (error) {
        // If there's an error with the request itself, it will be caught here
        console.error(
          "Error adding to diets:",
          error.response ? error.response.data : error
        );
      }
      reRenderPage();
    };

    const addDiet = async (dietID) => {
      try {
        // Logging to ensure IDs are correct before sending
        //console.log("Adding to favorites:", { userID, foodID });
  
        // Using Axios to send a POST request
        const response = await axios.post("/api/user/addDiet", {
          dietID
        });
  
        // Check if the response was successful
        if (response.status === 200) {
          alert(response.data.message); // Or update UI to show success
        } else {
          console.error("Failed to add diet:", response.data.message);
        }
      } catch (error) {
        // If there's an error with the request itself, it will be caught here
        console.error(
          "Error adding to diets:",
          error.response ? error.response.data : error
        );
      }
      reRenderPage();
    };

  const reRenderPage = () => {
    setReRender(!reRender);
  };  

  const updateAllergyIndex = async (allergyID, value) => {
    
    let nextUserIndices = userIndices.slice();
    nextUserIndices[allergyID] = value;
    setUserIndices(nextUserIndices);
    console.log('event.target.value is: %s', value);
    console.log('allergID is %i', allergyID);

    
  };

////////////
  if (loggedin)
  {
  return (
    <div className="myprofile">
      <EnterDish handleSearchChange={handleSearchChange}/>
      <DishSearchRes searchPerformed={searchPerformed} matchMeals={matchMeals} userID={userID} addToFavorites ={addToFavorites}/>
      <SelectDiet diets = {leftDiets} addDiet={addDiet}/>
      <SelectAllergy allergies ={leftAllergies} addAllergy = {addAllergy}/>
      <YourDiets diets={userDiets} removeDiet={removeDiet}/>
      <YourAllergies allergies={userAllergies} removeAllergy={removeAllergy} allergyIndices={userIndices} updateAllergyIndex={updateAllergyIndex}/>
      <YourFavorites favFoods={favFoods} removeFood={removeFood}/>
    </div>
  );
  }
  else {
    return (
      <h1> Please login </h1>
    )
  }
}
