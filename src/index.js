import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { GoogleOAuthProvider } from '@react-oauth/google'

ReactDOM.render(
  <GoogleOAuthProvider clientId='680142103979-ahonidcp8bvl73hc5ncghsj0v5igt52b.apps.googleusercontent.com'>
    <App />
  </GoogleOAuthProvider>,
  document.getElementById('root')
)
