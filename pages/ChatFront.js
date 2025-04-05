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

    // Call backend API
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
    <div className="flex flex-col h-screen p-4 bg-gray-50">
      <div className="flex-1 overflow-auto border border-gray-300 rounded-md p-4 bg-white">
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`my-2 p-2 rounded ${
              chat.sender === 'user'
                ? 'bg-blue-500 text-white self-end'
                : 'bg-gray-200 text-gray-800 self-start'
            } inline-block max-w-[75%]`}
          >
            {chat.message}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 border border-gray-300 rounded-l-md p-2 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 rounded-r-md hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>
  );
}
