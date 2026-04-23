import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatAI.css';

// Cấu hình URL Proxy qua Backend (Bảo mật tuyệt đối, không lộ Key ở Frontend)
const API_GATEWAY = "http://localhost:8900";
const CHAT_PROXY_URL = `${API_GATEWAY}/user-service/chat/ask`;
const GROQ_MODEL = "llama-3.1-8b-instant";

const ChatAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Chào mừng quý khách! Tôi là trợ lý ảo LUXE. Tôi đã chuyển sang hệ thống AI tốc độ cao để hỗ trợ bạn tốt nhất.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [products, setProducts] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_GATEWAY}/product-catalog-service/products?size=50`);
        const data = res.data.content || res.data || [];
        setProducts(data);
      } catch (error) { console.error("Lỗi lấy sản phẩm:", error); }
    };
    fetchProducts();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. Hiển thị tin nhắn User
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // 2. Tinh gọn dữ liệu sản phẩm
      const miniProducts = products.slice(0, 15).map(p => ({
        id: p.id,
        name: p.productName,
        price: p.variants?.[0]?.price || 0,
        variants: p.variants?.slice(0, 2).map(v => ({ id: v.id, s: v.size, c: v.color }))
      }));

      // 3. Chuẩn bị Payload cho Groq
      const systemPrompt = `Bạn là trợ lý bán hàng cao cấp LUXE. 
      SẢN PHẨM HIỆN CÓ: ${JSON.stringify(miniProducts)}
      NHIỆM VỤ: 
      1. Trả lời lịch sự, sang trọng bằng tiếng Việt.
      2. Tốc độ là ưu tiên, trả lời ngắn gọn.
      3. Khi khách chốt mua, trả về JSON này ở CUỐI tin nhắn:
      [ORDER_ACTION: {"variantId": ID, "quantity": 1, "productName": "Tên", "variantLabel": "Size/Màu", "price": Giá}]`;

      const groqMessages = [
        { role: "system", content: systemPrompt },
        ...messages.slice(-6).map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text
        })),
        { role: "user", content: input }
      ];

      const response = await axios.post(CHAT_PROXY_URL, {
        model: GROQ_MODEL,
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 1024
      });

      const text = response.data.choices[0].message.content;

      // 4. Xử lý Action Đặt hàng
      if (text.includes('[ORDER_ACTION:')) {
        const match = text.match(/\[ORDER_ACTION:\s*({.*?})\s*\]/);
        if (match) {
          const orderData = JSON.parse(match[1]);
          const cleanText = text.replace(/\[ORDER_ACTION:.*?\]/g, '').trim();
          setMessages(prev => [...prev, { role: 'bot', text: cleanText, action: 'CONFIRM_ORDER', data: orderData }]);
        } else {
          setMessages(prev => [...prev, { role: 'bot', text }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'bot', text }]);
      }

    } catch (error) {
      console.error("GROQ ERROR:", error.response?.data || error);
      setMessages(prev => [...prev, { role: 'bot', text: 'Hệ thống AI đang được bảo trì giây lát, bạn thử lại sau nhé!' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const executeOrder = async (orderData, shipping) => {
    const user = JSON.parse(localStorage.getItem('user') || '{"id": 1}');
    const payload = {
      userId: user.id,
      orderedDate: new Date().toISOString(),
      shippingAddress: `${shipping.address}, ${shipping.city}`,
      status: "PENDING",
      totalAmount: orderData.price * orderData.quantity,
      paymentMethod: "COD",
      orderItems: [{
        productName: orderData.productName,
        quantity: orderData.quantity,
        priceAtPurchase: orderData.price,
        subtotal: orderData.price * orderData.quantity,
        variantId: orderData.variantId,
        variantInfo: orderData.variantLabel
      }]
    };
    return await axios.post(`${API_GATEWAY}/order-service/orders`, payload);
  };

  return (
    <div className="chat-ai-container">
      <div className="chat-bubble" onClick={() => setIsOpen(!isOpen)}>{isOpen ? '✕' : '✨'}</div>
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="bot-avatar">💎</div>
            <div className="bot-info"><h3>Trợ lý LUXE</h3><span>Trực tuyến - Tốc độ cao</span></div>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className="message-group">
                <div className={`message ${msg.role}`}>{msg.text}</div>
                {msg.action === 'CONFIRM_ORDER' && (
                  <div className="order-confirm-card">
                    <div className="order-card-header">🛒 Xác nhận đơn hàng</div>
                    <div className="order-card-body">
                      <p><b>SP:</b> {msg.data.productName}</p>
                      <p><b>Loại:</b> {msg.data.variantLabel}</p>
                      <p><b>Giá:</b> {msg.data.price?.toLocaleString()}₫</p>
                      <div className="order-form-mini">
                        <input id={`addr-${i}`} placeholder="Địa chỉ giao hàng..." />
                        <select id={`city-${i}`}>
                          <option value="Hà Nội">Hà Nội</option>
                          <option value="TP.HCM">TP.HCM</option>
                          <option value="Đà Nẵng">Đà Nẵng</option>
                        </select>
                        <button className="btn-confirm-order-ai" onClick={async (e) => {
                          const btn = e.target;
                          const addr = document.getElementById(`addr-${i}`).value;
                          const city = document.getElementById(`city-${i}`).value;
                          if (!addr) return alert("Nhập địa chỉ!");
                          btn.disabled = true; btn.innerText = 'Đang xử lý...';
                          try {
                            const res = await executeOrder(msg.data, { address: addr, city });
                            setMessages(prev => [...prev, { role: 'bot', text: `Thành công! Đơn hàng #${res.data.id} đã được khởi tạo.` }]);
                          } catch (err) {
                            alert("Lỗi kết nối Server!");
                            btn.disabled = false; btn.innerText = 'Xác nhận đặt ngay';
                          }
                        }}>Xác nhận đặt ngay</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isTyping && <div className="message bot typing">Groq AI đang phản hồi...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              className="chat-input"
              placeholder="Hỏi về sản phẩm..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
            />
            <button className="send-btn" onClick={handleSend}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAI;