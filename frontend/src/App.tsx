import { useState } from 'react';
import LoginPage from './pages/LoginPage'
import './App.css'
import CreateAccount from './pages/CreateAccount';

function App() {
  const [showCreate, setShowCreate] = useState<boolean>(false);
  const handleClick = () => {
    setShowCreate(!showCreate);
  }

  return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        {!showCreate ? (
          <>
            <LoginPage />
            <button className="w-80" onClick={handleClick}>Create Account</button>
          </>
        ) : (
          <>
            <CreateAccount />
            <button className="w-80" onClick={handleClick}>Log In</button>
          </>
        )
        }
      </div>
  )
}

export default App
