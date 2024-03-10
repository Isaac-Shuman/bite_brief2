import '../../App.css'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from "js-cookie";

export default function SignUp() {
  const [user, setUser] = useState([])

  /*TODO: Update UI, Add cookies */

  const login = async (response) => {
    setUser(await jwtDecode(response.credential))

    axios
      .post('/api/signup', {
        data: await jwtDecode(response.credential),
      })
      .then((response) => {})
      .catch((error) => {
        console.log(error)
      })


    Cookies.set("email", user.email, {
      expires: 7,
    });
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
