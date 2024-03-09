import '../../App.css'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function SignUp() {
  const [user, setUser] = useState([])

  /*TODO: Update UI, Add cookies */

  const login = (response) => {
    setUser(jwtDecode(response.credential))

    axios
      .post('/api/signup', {
        data: user,
      })
      .then((response) => {})
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
