import { useState, useRef, useEffect } from "react";

function App() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom of the chat box whenever messages change
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const getResponse = async () => {
    setIsLoading(true);
    if (!value) {
      setError("Error: No message to send");
      return;
    }
    try {
      setChatHistory((oldChatHistory) => [
        ...oldChatHistory,
        {
          role: "user",
          parts: [{ text: value }],
        },
      ]);
      const options = {
        method: "POST",
        body: JSON.stringify({
          history: chatHistory,
          message: value,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      };
      const response = await fetch("http://localhost:8000/gemini", options);
      const data = await response.text();

      setChatHistory((oldChatHistory) => [
        ...oldChatHistory,
        {
          role: "model",
          parts: [{ text: data }],
        },
      ]);
      setValue("");
    } catch (error) {
      console.error("Error: ", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Lovia</h1>
      </div>
      <div className="chat-body" ref={chatBoxRef}>
        {chatHistory.map((chatItem, _index) => (
          <div
            key={_index}
            className={`message ${
              chatItem.role === "user" ? "sent" : "received"
            }`}
          >
            <p>{chatItem.parts[0].text}</p>
          </div>
        ))}
      </div>

      <form className="chat-input">
        <input
          value={isLoading ? "" : value}
          placeholder="Type a message..."
          onChange={(e) => setValue(e.target.value)}
        />
        <button onClick={getResponse} disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
}

export default App;
