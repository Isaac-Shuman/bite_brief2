import React from 'react';
import '../../App.css';

export default function Myprofile() {
  // Function to handle search bar change
  const handleSearchChange = (event) => {
    // Connect to backend database and perform search
    console.log('Search query:', event.target.value);
  };

  // Function to handle allergy selection
  const handleAllergySelect = (event) => {
    // Get selected allergy value
    const selectedAllergy = event.target.value;
    // Connect to backend database to save selected allergy
    console.log('Selected allergy:', selectedAllergy);
  };

  // Function to handle health goal selection
  const handleGoalSelect = (event) => {
    // Get selected goal value
    const selectedGoal = event.target.value;
    // Connect to backend database to save selected health goal
    console.log('Selected health goal:', selectedGoal);
  };

  return (
    <div className='myprofile'>
     

      {/* My Favorite Dish */}
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

      {/* My Allergies */}
      <div>
        <h2>2. My Allergies</h2>
        <select onChange={handleAllergySelect}>
          <option value=''>Select Allergy</option>
          <option value='Peanuts'>Peanuts</option>
          <option value='Shellfish'>Shellfish</option>
          <option value='Gluten'>Gluten</option>
          <option value='Eggs'>Eggs</option>
          <option value='Diary'>Diary</option>
          {/* Add more allergy options */}
        </select>
        {/* Connect to backend database to fetch and save allergies */}
      </div>
      <br></br>

      {/* My Health Goal */}
      <div>
        <h2>3. My Health Goal</h2>
        <input type='radio' id='goal1' name='healthGoal' value='goal1' onChange={handleGoalSelect} />
        <label htmlFor='goal1'>Increased energy levels:</label><br />
        <input type='radio' id='goal2' name='healthGoal' value='goal2' onChange={handleGoalSelect} />
        <label htmlFor='goal2'>Gain Muscle</label><br />
        <input type='radio' id='goal3' name='healthGoal' value='goal3' onChange={handleGoalSelect} />
        <label htmlFor='goal3'>Control Blood Sugar</label><br />
        {/* Add more health goal options */}
      </div>
      {/* Connect to backend database to save selected health goal */}
    </div>
  );
}