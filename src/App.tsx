import "./App.css";
import { useState } from "react";

interface Message {
  text: string;
  sender: string;
}

const functionUrl = "https://xxxxxxxxx.lambda-url.eu-west-2.on.aws/";

function App() {
  // 1. Start with empty messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentValue, updateValue] = useState("");

  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();

    // add user message
    const newUserMessage: Message = { sender: "user", text: currentValue };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      // 2. Call Lambda function
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentValue }),
      });

      const data = await response.json();
      console.log("data",data)
;
      // 3. Append AI response
      const aiMessage: Message = { sender: "ai", text: data.reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error calling function:", err);
    }

    // clear input
    updateValue("");
  };

  return (
    <main>
      <h1>Simple Pirate Chat Bot</h1>

      <div>
        {messages.map((msg, index) => (
          <p key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </p>
        ))}
      </div>

      <form className="vertical" onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Message"
          value={currentValue}
          onChange={(e) => updateValue(e.target.value)}
        />
        <input type="submit" value="Send" />
      </form>
    </main>
  );
}

export default App;
