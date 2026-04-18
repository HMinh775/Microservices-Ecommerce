import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import './ChatAI.css';

const API_KEY = "AIzaSyAKJ5xwLuk8jWoLmJOAhnyiiNn5sh_F_4U";
const genAI = new GoogleGenerativeAI(API_KEY);
const API_GATEWAY = "http://localhost:8900";

const ChatAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Xin chào! Tôi là trợ lý ảo của LUXE. Tôi có thể giúp gì cho bạn hôm nay?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [products, setProducts] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Lấy dữ liệu sản phẩm thật từ Backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_GATEWAY}/product-catalog-service/products?size=50`);
        if (res.data && res.data.content) {
          setProducts(res.data.content);
        }
      } catch (error) {
        console.error("Lỗi lấy sản phẩm cho Bot:", error);
      }
    };
    fetchProducts();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

      // Chỉ lấy 2 tin nhắn gần nhất để tiết kiệm Token
      const recentHistory = messages
        .filter(msg => msg.role !== 'bot' || !msg.text.includes('Xin chào!'))
        .slice(-2)
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        }));

      const chat = model.startChat({ history: recentHistory });

      const result = await chat.sendMessage(input);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { role: 'bot', text }]);
    } catch (error) {
      console.error("Gemini Error Details:", error);
      setMessages(prev => [...prev, { role: 'bot', text: 'Dạ, có lẽ Google vẫn đang giới hạn tài khoản của bạn. Bạn hãy thử lại sau ít phút hoặc kiểm tra lại API Key nhé!' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-ai-container">
      {/* Nút bong bóng */}
      <div className="chat-bubble" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '✨'}
      </div>

      {/* Cửa sổ Chat */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="bot-avatar">💎</div>
            <div className="bot-info">
              <h3>LUXE Assistant</h3>
              <span>Online</span>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                {msg.text}
              </div>
            ))}
            {isTyping && <div className="message bot typing">Đang suy nghĩ...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              className="chat-input"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="send-btn" onClick={handleSend}>
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAI;
