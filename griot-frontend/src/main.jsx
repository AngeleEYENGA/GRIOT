import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext'
import { GoogleOAuthProvider } from '@react-oauth/google'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
const application = googleClientId
  ? <GoogleOAuthProvider clientId={googleClientId}><App /></GoogleOAuthProvider>
  : <App />

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>{application}</ThemeProvider>
  </StrictMode>,
)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch((error) => {
    console.error('Impossible d’activer le mode installable de GRIOT.', error);
  });
}
