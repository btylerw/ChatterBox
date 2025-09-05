import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { UserProvider } from './contexts/UserContext.tsx'
import './index.css'
import App from './App.tsx'
import HomePage from './pages/HomePage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />}/>
          <Route path="/home" element={<HomePage />}/>
        </Routes>
      </Router>
    </UserProvider>
  </StrictMode>,
)
