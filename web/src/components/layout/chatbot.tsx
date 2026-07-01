'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Message {
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

export function Chatbot() {
  const t = useTranslations('chatbot');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Xin chào! Tôi là Trợ lý ảo của F&B Shop. Cửa hàng hiện đang bận pha chế nước, tôi có thể hỗ trợ gì cho bạn? (Gõ "khuyến mãi", "menu", "phí ship" hoặc "thanh toán" để tôi trả lời nhanh nhé!)',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: userMsg, timestamp: new Date() },
    ]);
    setInputText('');
    setIsTyping(true);

    // Simulate smart bot response based on keywords
    setTimeout(() => {
      let reply = '';
      const textLower = userMsg.toLowerCase();

      if (textLower.includes('khuyến mãi') || textLower.includes('voucher') || textLower.includes('giảm giá') || textLower.includes('code')) {
        reply = '🎁 F&B Shop đang có các mã giảm giá siêu hot:\n- **GIAM20**: Giảm 20% đơn từ 40K\n- **GIAM50K**: Giảm thẳng 50K cho đơn từ 150K\n- **FBFREE**: Giảm 15K phí vận chuyển cho đơn từ 30K.\nHãy nhập mã tại trang Thanh toán nhé!';
      } else if (textLower.includes('ship') || textLower.includes('phí') || textLower.includes('giao')) {
        reply = '🛵 Phí giao hàng tại shop đồng giá chỉ **15.000đ** cho mọi khu vực trong bán kính 5km. Shop cam kết giao nhanh nóng hổi trong vòng 30 phút!';
      } else if (textLower.includes('món') || textLower.includes('ngon') || textLower.includes('bán chạy') || textLower.includes('menu') || textLower.includes('gợi ý')) {
        reply = '🥤 Gợi ý các món Best Seller của quán:\n1. Trà sữa trân châu đường đen (35k)\n2. Trà đào cam sả hoàng gia (38k)\n3. Bạc Xỉu đá cốt dừa (29k)\n4. Cà phê Muối xứ Huế (32k)\n5. Nem chua rán Hà Nội giòn rụm (32k).\nBạn vào phần "Thực đơn" để đặt ngay nhé!';
      } else if (textLower.includes('thanh toán') || textLower.includes('vietqr') || textLower.includes('sepay') || textLower.includes('chuyển khoản')) {
        reply = '💵 Bạn có thể chọn thanh toán khi nhận hàng (COD) hoặc Chuyển khoản VietQR tự động qua cổng SePay. Khi chọn VietQR, hệ thống sẽ hiển thị mã QR kèm số tiền và nội dung chuyển khoản được cấu hình tự động, giúp kích hoạt đơn hàng tức thì!';
      } else if (textLower.includes('chào') || textLower.includes('hello') || textLower.includes('hi') || textLower.includes('hey')) {
        reply = '👋 Xin chào bạn! Rất vui được hỗ trợ bạn. Bạn muốn tìm hiểu thông tin về "thực đơn", "mã giảm giá" hay "phí giao hàng" nào?';
      } else {
        reply = '🤖 Cảm ơn bạn đã nhắn tin. Hiện tại nhân viên đang bận phục vụ khách hàng trực tiếp. Tôi là trợ lý ảo F&B, bạn có thể hỏi tôi các câu hỏi như "khuyến mãi", "phí ship", "món ngon bán chạy" hoặc "cách thanh toán" nhé!';
      }

      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: reply, timestamp: new Date() },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 flex h-[450px] w-[360px] flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/70 shadow-2xl backdrop-blur-2xl transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-extrabold text-sm font-[family-name:var(--font-heading)]">Trợ lý ảo F&B</p>
                <span className="text-[10px] text-orange-100 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping" />
                  Đang hoạt động tự động
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 hover:bg-white/10 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-zinc-50/50">
            {messages.map((msg, index) => {
              const isBot = msg.sender === 'bot';
              return (
                <div key={index} className={`flex gap-2.5 max-w-[85%] ${isBot ? '' : 'ml-auto flex-row-reverse'}`}>
                  <div
                    className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full text-white shadow-sm
                      ${isBot ? 'bg-orange-500' : 'bg-zinc-800'}
                    `}
                  >
                    {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-xs shadow-sm leading-relaxed border whitespace-pre-line
                      ${
                        isBot
                          ? 'bg-white border-zinc-100 text-zinc-800 rounded-tl-none'
                          : 'bg-orange-600 border-orange-700 text-white rounded-tr-none'
                      }
                    `}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex gap-2.5 max-w-[80%]">
                <div className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-orange-500 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl bg-white border border-zinc-100 px-4 py-3 shadow-sm rounded-tl-none">
                  <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                  <span className="text-[10px] text-zinc-400 font-semibold">Trợ lý đang soạn...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="border-t border-zinc-100 p-3 bg-white flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Hỏi về khuyến mãi, phí ship, món ngon..."
              className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none focus:border-orange-500 focus:bg-white transition"
            />
            <button
              type="submit"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition shadow cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Bubble Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/20 hover:scale-105 transition cursor-pointer hover:shadow-orange-500/35 relative"
        title="Trợ lý ảo hỗ trợ khách hàng"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 text-[8px] font-black items-center justify-center text-white">AI</span>
          </span>
        )}
      </button>
    </div>
  );
}
