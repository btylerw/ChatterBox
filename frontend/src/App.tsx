import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import axios from 'axios'
import './App.css'

function App() {
  const [count, setCount] = useState(0);
  const [sender, setSender] = useState("Me!");
  const [recipient, setRecipient] =  useState("Not Me!");
  const [content, setContent] = useState("This is a message!");

  const API_BASE = "http://127.0.0.1:8000";

  interface MessagePayload {
    sender: string;
    recipient: string;
    content: string;
  }

  const sendMessage = async (payload: MessagePayload) => {
    try {
      const response = await axios.post(`${API_BASE}/chat/send-message`, payload, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      console.log(response.data);
      return response.data;
    } catch (err) {
      console.error(err);
      return;
    }
  }

  const payload = {
    sender: sender,
    recipient: recipient,
    content: content,
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <p className='text-3xl underline font-bold'>Hello, world!</p>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <button onClick={() => sendMessage(payload)}>Click Me!</button>
    </>
  )
}

export default App
