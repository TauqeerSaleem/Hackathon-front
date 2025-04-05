import { useState } from 'react';

export default function ChatFront() {
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newHistory = [...chatHistory, { sender: 'user', message: input }];
    setChatHistory(newHistory);
    setInput('');

    const res = await fetch('http://127.0.0.1:8000/chat/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: input }),
    });

    const data = await res.json();

    setChatHistory((prev) => [
      ...prev,
      { sender: 'bot', message: data.response },
    ]);
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-black text-white">
      <div className="flex-1 overflow-auto border border-gray-500 rounded-md p-4 bg-gray-800">
        {chatHistory.map((chat, index) => (
          <div key={index} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'} my-2`}>
            <div
              className={`p-2 rounded-md max-w-[70%] ${
                chat.sender === 'user' ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              {chat.message}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 border border-gray-600 rounded-l-md p-2 bg-gray-700 focus:outline-none text-white"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
}
