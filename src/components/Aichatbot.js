import React, { useState, useRef, useEffect, useCallback } from 'react';

const BACKEND_URL = 'https://innovative-project-health-tracker-backend.onrender.com'; 
const AI_BACKEND_URL = `${BACKEND_URL}/api/ai/chat`; 

function AiChatbot({ userProfile, userId }) { 
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [foodLogs, setFoodLogs] = useState([]);
  
  const { name, weight, height, goal } = userProfile || {};

  const fetchFoodLogs = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/foodlog/${userId}`);
      const data = await response.json();
      if (response.ok && data.data) {
        setFoodLogs(data.data);
      }
    } catch (error) {
      console.error('Error fetching logs for chatbot:', error);
    }
  }, [userId]); 

  useEffect(() => {
    fetchFoodLogs(); 
    
    const initialGreeting = name
        ? `Hello, ${name}! Your goal is: ${goal || 'N/A'}. How can I help you with your fitness journey or review your nutrition log today?`
        : "Hello! I'm your health assistant AI. Please log in to get personalized advice.";

    setMessages([
        { sender: 'AI', text: initialGreeting, timestamp: new Date() }
    ]);
  }, [fetchFoodLogs, name, goal]); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || !userId) return;

    const userMessage = input.trim();
    const newUserMessage = { sender: 'User', text: userMessage, timestamp: new Date() };

    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInput('');
    setLoading(true);

    const aiContext = {
      message: userMessage,
      userId: userId,
      userProfile: { name, weight, height, goal },
      recentFoodLogs: foodLogs.slice(0, 5)
    };

    try {
      const response = await fetch(AI_BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiContext), 
      });

      const data = await response.json();
      
      let aiResponseText;

      if (response.ok && data.response) {
        aiResponseText = data.response;
      } else {
        aiResponseText = `AI connection failed. (Query: "${userMessage}"). Check the backend logs.`;
      }
      
      const newAiMessage = { sender: 'AI', text: aiResponseText, timestamp: new Date() };
      setMessages(prevMessages => [...prevMessages, newAiMessage]);

    } catch (error) {
      console.error('AI chat network error:', error);
      const errorMessage = { sender: 'AI', text: "Network error! Cannot reach the AI server (port 5000).", timestamp: new Date() };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const ChatMessage = ({ message }) => (
    <div style={{
      ...chatStyles.messageRow,
      justifyContent: message.sender === 'User' ? 'flex-end' : 'flex-start',
    }}>
      <div style={{
        ...chatStyles.messageBubble,
        backgroundColor: message.sender === 'User' ? '#007bff' : '#ecf0f1',
        color: message.sender === 'User' ? 'white' : '#2c3e50',
      }}>
        <p style={{ margin: 0 }}>{message.text}</p>
        <span style={chatStyles.timestamp}>
          {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );

  return (
    <div style={chatStyles.container}>
      <h2 style={chatStyles.header}>Health AI Chat Assistant</h2>
      <div style={chatStyles.chatBox}>
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {loading && (
          <div style={{ ...chatStyles.messageRow, justifyContent: 'flex-start' }}>
             <div style={{ ...chatStyles.messageBubble, backgroundColor: '#bdc3c7', color: 'white' }}>
                <p style={{ margin: 0 }}>AI is typing...</p>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} style={chatStyles.inputForm}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={loading ? "Waiting for AI..." : "Type your question..."}
          disabled={loading}
          style={chatStyles.inputField}
        />
        <button type="submit" style={chatStyles.sendButton} disabled={loading}>
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

const chatStyles = {
  container: {
    padding: '30px',
    maxWidth: '700px',
    margin: '40px auto',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    color: '#2c3e50',
    marginBottom: '20px',
    textAlign: 'center',
    borderBottom: '2px solid #ddd',
    paddingBottom: '10px',
  },
  chatBox: {
    height: '400px',
    overflowY: 'auto',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '10px',
    marginBottom: '15px',
    backgroundColor: '#f9f9f9',
  },
  messageRow: {
    display: 'flex',
    marginBottom: '10px',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '10px 15px',
    borderRadius: '18px',
    lineHeight: '1.4',
    fontSize: '15px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    wordWrap: 'break-word',
  },
  timestamp: {
    display: 'block',
    fontSize: '10px',
    opacity: 0.7,
    marginTop: '5px',
    textAlign: 'right',
  },
  inputForm: {
    display: 'flex',
  },
  inputField: {
    flexGrow: 1,
    padding: '10px 15px',
    fontSize: '16px',
    border: '1px solid #3498db',
    borderRadius: '25px 0 0 25px',
    outline: 'none',
  },
  sendButton: {
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '0 25px 25px 0',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  }
};


export default AiChatbot;
