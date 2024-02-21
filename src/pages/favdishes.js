import React from "react";
import { useState } from "react";
import { useEffect } from 'react';
import axios from 'axios';


const dishes = [
  { name: 'chicken', url: 'https://yadayada', id: 0, },
  { name: 'dirt', url: 'https://yadayada', id: 1, },
  { name: 'rock', url: 'https://yadayada', id: 2, },
]

const dishComp = dishes.map((dish) =>
  <h4>Name is {dish.name}. Url is {dish.url} </h4>); //swap out h4 comp here with custom one later


const Favdishes = () => {
  const [typedText, setText] = useState('');
  const [mealsRendered, updateMeals] = useState([Array(9).fill(null)]);
  const [serverText, setServeText] = useState('');


  useEffect(() => {
    axios({
        method: 'post',
        url: '/api/favdishes',
        data: {
          meal: typedText
        }
    }) 
      .then(response => {
        setServeText(response.data.message);
      })
      .catch(error => {
        console.error(error);
      });
  }, [typedText]);


  function handleChange(what_is_this)
  {
    //updateMeals(event.target.mealsRendered)
    setText(what_is_this.target.value);


    /*
    insert request to server here with text as param
    this should call updateMeals
    */
    
    
  };
  return (
    <div>
      <h1>Fav page.</h1>
      <input
            type="text"
            onChange={handleChange}
      />
      <p> Value: {typedText}</p>
      <p> Server Value: {serverText} </p>
      {dishComp}
    </div>
  );
};

export default Favdishes;
