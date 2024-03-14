import '../../App.css'
import './SignUp.css'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useHistory } from 'react-router-dom'

export default function SignUp({ loggedIn, setLoggedIn }) {
  const history = useHistory()

  const login = async (response) => {
    axios
      .post('/api/user', {
        data: await jwtDecode(response.credential),
      })
      .then((response) => {
        setLoggedIn(true)
      })
      .catch((error) => {
        console.log(error)
      })

    toast.success('You have successfully logged in.', {
      position: 'bottom-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    })

    history.push('/')
  }

  return (
    <div className='sign-up-bg'>
      <div className='sign-up-border'>
        <h1 style={{ paddingBottom: '20px', fontSize: '60px' }}>BiteBrief</h1>
        <hr style={{ borderColor: 'white' }} />
        <h2 style={{ paddingTop: '20px' }}>Sign up</h2>
        <p style={{ paddingTop: '8px', paddingBottom: '25px' }}>
          Sign up to customize and recieve notifications on favorite dining hall
          foods
        </p>
        <GoogleLogin
          onSuccess={login}
          onError={(error) => {
            console.log(error)
          }}
        />
        <p style={{ paddingTop: '8px', fontSize: '12px' }}>
          By creating an account, you agree to our Terms & Privacy
        </p>
      </div>
    </div>
  )
}
