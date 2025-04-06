import { useState, useEffect } from 'react';

export default function ChatFront() {
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const intro = "Hi! I'm Ismail, your academic advisor AI. I'm here to help you with course selection, prerequisites, scheduling, and degree planning.";
    const askName = "May I know your name?";
    setChatHistory([
      { sender: 'bot', message: intro },
      { sender: 'bot', message: askName },
    ]);
    setStep(1);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { sender: 'user', message: input };
    setChatHistory(prev => [...prev, userMsg]);

    if (step === 1) {
      setName(input);
      setChatHistory(prev => [
        ...prev,
        { sender: 'bot', message: `Nice to meet you, ${input}! Are you an undergraduate or graduate student?` }
      ]);
      setOptions(['Undergrad', 'Grad']);
      setShowOptions(true);
      setStep(2);
    } else if (step === 7) {
      setCareerGoal(input);
      setChatHistory(prev => [
        ...prev,
        { sender: 'bot', message: `Awesome! I'll use this information to guide your course planning.` }
      ]);
      setStep(8);
    } else if (step >= 8) {
      // Send chat + context to backend
      const res = await fetch("http://127.0.0.1:8000/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: input,
          name,
          level,
          major,
          year,
          careerGoal,
          history: chatHistory.map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.message
          }))
        })
      });

      const data = await res.json();
      setChatHistory(prev => [...prev, { sender: 'bot', message: data.response }]);
    }
    setInput('');
  };

  const handleOptionClick = (option) => {
    const userMsg = { sender: 'user', message: option };
    setChatHistory(prev => [...prev, userMsg]);

    if (step === 2) {
      setLevel(option);
      const majorListUndergrad = [
        'Data Science', 'Cyber Security and Global Policy', 'Computer Science', 'Informatics', 'Intelligent Systems Engineering'
      ];
      const majorListGrad = [
        'Bioinformatics', 'Computer Science', 'Data Science - Residential', 'Data Science - Online',
        'Dual MS in Stats and Data Science', 'Dual MS in Applied Stats and Data Science', 'Human-Computer Interaction',
        'Informatics', 'Information Science', 'Intelligient Systems Engineering', 'Library Science', 'Secure Computing'
      ];
      setChatHistory(prev => [
        ...prev,
        { sender: 'bot', message: `Awesome. What is your major at Luddy?` }
      ]);
      setOptions(option === 'Undergrad' ? majorListUndergrad : majorListGrad);
      setShowOptions(true);
      setStep(3);
    } else if (step === 3) {
      setMajor(option);
      setChatHistory(prev => [
        ...prev,
        { sender: 'bot', message: `Great! What semester are we planning for?` }
      ]);
      if (level === 'Undergrad') {
        setOptions(['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']);
      } else {
        setOptions(['1st', '2nd', '3rd', '4th']);
      }
      setShowOptions(true);
      setStep(4);
    } else if (step === 4) {
      setYear(option);
      setChatHistory(prev => [
        ...prev,
        { sender: 'bot', message: `Thanks for letting me know! Lastly, what is your career goal?` }
      ]);
      setShowOptions(false);
      setStep(7);
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-black text-white">
      <div className="flex-1 overflow-auto border border-gray-500 rounded-md p-4 bg-gray-800">
        {chatHistory.map((chat, index) => (
          <div key={index} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'} my-2`}>
            <div className={`p-2 rounded-md max-w-[70%] ${chat.sender === 'user' ? 'bg-blue-600' : 'bg-gray-600'}`}>
              {chat.message}
            </div>
          </div>
        ))}

        {showOptions && (
          <div className="flex gap-4 my-2 flex-wrap">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="mt-4 flex">
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