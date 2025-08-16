import "./App.css";
import { useState } from "react";

interface Message {
  text: string;
  sender: string;
}
function App() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "ai", text: "Yer wishes be me commands. What be yer query?" },
    { sender: "user", text: "Why did the pirate cross the road?" },
    { sender: "ai", text: "To get his buried treasure, arr!" },
  ]);
  const [currentValue, updateValue] = useState("");
  const onSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    setMessages([...messages, { sender: "user", text: currentValue }]);
  };

  return (
    <main>
      <h1> Simle Pirate Chat Bot</h1>
      <div>
        {messages.map((msg, index) => (
          <p key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </p>
        ))}
      </div>
      <form className="vertical" onSubmit={onSubmit}>
        <input type="text" placeholder="Message" />
        <input
          type="submit"
          value={currentValue}
          onChange={(e) => updateValue(e.target.value)}
        />
      </form>
      …{" "}
    </main>
  );
}

export default App;
