import '../../App.css'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from "js-cookie";

export default function SignUp({loggedIn, setLoggedIn}) {

  /*TODO: Update UI, Add cookies */

  const login = async (response) => {
    axios
      .post('/api/user', {
        data: await jwtDecode(response.credential),
      })
      .then((response) => {setLoggedIn(true)})
      .catch((error) => {
        console.log(error)
      })
    
  }

  return (
    <div>
      <GoogleLogin
        onSuccess={login}
        onError={(error) => {
          console.log(error)
        }}
      />
    </div>
  )
}
