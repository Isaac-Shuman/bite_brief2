import '../../App.css'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function SignUp({user, setUser}) {

  /*TODO: Update UI, Add cookies */

  const login = async (response, req) => {
    setUser(await jwtDecode(response.credential))

    axios
      .post('/api/signup', {
        data: await jwtDecode(response.credential),
      })
      .then(() => {})
      .catch((error) => {
        console.log(error)
      })
  }
  console.log(user.email)


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
