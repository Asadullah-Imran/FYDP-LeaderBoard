import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Axios Interceptor for automated fallback from Production URL to Localhost URL
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    // Check if we got a network error (no response) and have a config
    if (!error.response && config && config.url) {
      const prodUrl = import.meta.env.VITE_API_URL;
      const localUrlFallback = 'http://localhost:5050/api';

      if (prodUrl && config.url.startsWith(prodUrl) && prodUrl !== localUrlFallback) {
        const fallbackUrl = config.url.replace(prodUrl, localUrlFallback);
        console.warn(`Production API unreachable. Retrying request with local fallback: ${fallbackUrl}`);
        config.url = fallbackUrl;
        
        // Return a new axios request with the updated url
        return axios(config);
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
