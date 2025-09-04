import LoginPage from './pages/LoginPage'
import './App.css'

function App() {
  /*
  This is example code for use in later features

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


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    switch(e.target.name) {
      case 'sender':  setSender(e.target.value); break;
      case 'recipient':  setRecipient(e.target.value); break;
      case 'content':  setContent(e.target.value); break;
      default:  return "Incorrect value"
    }
  }
  */
  return (
    <>
      <LoginPage />
    </>
  )
}

export default App
