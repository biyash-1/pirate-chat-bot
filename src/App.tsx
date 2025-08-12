

import './App.css'
import { useState } from 'react'


interface Message {
  text:string
  sender:string;

}
function App() {
  const [messages, setMessages] = useState<Message[]>([
      { sender: 'ai', text: 'Yer wishes be me commands. What be yer query?' },
  { sender: 'user', text: 'Why did the pirate cross the road?' },
    { sender: 'ai', text: 'To get his buried treasure, arr!' }
                ]);

  return (
    <>
      <div>

        <h1>
          AI powered chat bot
        </h1>
       </div>
    </>
  )
}

export default App
