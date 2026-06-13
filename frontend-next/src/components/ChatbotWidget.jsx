'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, MessageCircle, Trash2, Sparkles, Zap, ChevronDown } from 'lucide-react';
import { api } from '../lib/api';

const supportTopics = [
  { id: 'shipping', title: 'Shipping', keywords: ['ship', 'shipping', 'delivery', 'deliver', 'courier', 'dispatch', 'eta', 'arrive', 'late'], answer: 'Standard shipping usually takes 5 to 7 business days after dispatch, while express shipping usually takes 2 to 4 business days. Delivery times can vary by location, weather, holidays, and customs screening.' },
  { id: 'tracking', title: 'Tracking', keywords: ['track', 'tracking', 'where is my order', 'parcel', 'shipment status', 'consignment', 'status'], answer: 'You can track an order from the Orders section once the package has been scanned by the shipping partner. Tracking updates often appear within 12 to 24 hours after dispatch.' },
  { id: 'returns', title: 'Returns', keywords: ['return', 'send back', 'exchange', 'replace', 'replacement', 'return policy'], answer: 'Most items can be returned within 30 days if they are unused, complete, and in their original packaging. If the item arrived damaged, incorrect, or incomplete, support can usually help faster with a replacement or refund path.' },
  { id: 'refunds', title: 'Refunds', keywords: ['refund', 'money back', 'reimburse', 'reversal', 'refund status'], answer: 'Refunds are typically processed after the return is reviewed and approved. Once approved, funds usually appear in the original payment method within 5 to 7 business days, depending on the bank or payment provider.' },
  { id: 'quality', title: 'Product Quality', keywords: ['quality', 'original', 'authentic', 'genuine', 'material', 'durable', 'fake', 'defect', 'defective'], answer: 'Product quality is expected to match the listing description, images, and condition details. If the delivered item does not match the listing or has a defect, you can request support for review, return, or replacement.' },
  { id: 'payment', title: 'Payments', keywords: ['pay', 'payment', 'card', 'visa', 'mastercard', 'checkout', 'transaction', 'bank', 'wallet'], answer: 'Available payment methods depend on the configured checkout options. If a payment fails, verify your billing details, available balance, and network connection, then retry once before attempting another method.' },
  { id: 'cancellation', title: 'Cancellations', keywords: ['cancel', 'cancellation', 'change order', 'modify order', 'wrong address', 'wrong order'], answer: 'Orders can usually be changed or cancelled only before they move into packing or shipment. If the order has already been dispatched, the fastest option is often to receive it and then request a return if needed.' },
  { id: 'availability', title: 'Availability', keywords: ['available', 'availability', 'in stock', 'out of stock', 'restock', 'stock'], answer: 'Product availability depends on current supplier stock. If an item is out of stock, the listing may update later when new inventory is added, but restock timing can vary by supplier and category.' },
  { id: 'bulk', title: 'Bulk Orders', keywords: ['bulk', 'wholesale', 'moq', 'minimum order', 'large order', 'supplier', 'quote'], answer: 'Bulk orders are best handled by confirming the product name, quantity, destination, and required delivery window. That makes it easier to estimate stock availability, shipping options, and supplier lead time.' },
  { id: 'warranty', title: 'Warranty', keywords: ['warranty', 'guarantee', 'repair', 'covered', 'claim'], answer: 'Warranty coverage varies by product and supplier. When a warranty applies, the exact coverage usually depends on the item type, defect reason, and whether the issue is from normal use or manufacturing error.' },
  { id: 'account', title: 'Account Help', keywords: ['account', 'login', 'password', 'profile', 'address', 'sign in'], answer: 'For account help, start by checking your saved profile details, login email, and delivery address. If checkout or access issues continue, refreshing the session and signing in again usually helps.' },
  { id: 'cart', title: 'Cart Help', keywords: ['cart', 'my cart', 'basket', 'add to cart', 'remove from cart', 'cart issue'], answer: 'You can add products from listing or details pages, review them in My cart, update quantities, and continue to checkout from there. If cart totals or quantities look wrong, refreshing the page and rechecking item quantities usually helps.' },
  { id: 'favorites', title: 'Favorites & Wishlist', keywords: ['favorite', 'wishlist', 'save item', 'saved items', 'heart icon'], answer: 'Use the heart icon on a product to save it to Favorites. You can open the Favorites page from the header to review saved items and remove any product you no longer want to keep there.' },
  { id: 'checkout', title: 'Checkout Help', keywords: ['checkout', 'place order', 'buy now', 'billing', 'shipping address', 'payment page'], answer: 'At checkout, review your products, delivery details, and payment information carefully before placing the order. If something is incorrect, go back to the cart or product page to update it before submitting payment.' },
  { id: 'orders', title: 'Orders', keywords: ['order', 'order number', 'purchase', 'placed order'], answer: 'If you are asking about an order, sharing the order number and a short description of the issue helps support the fastest. Common questions include status, delivery timing, address corrections, and return eligibility.' },
  { id: 'contact', title: 'Contact & Support', keywords: ['contact', 'support', 'help center', 'customer service', 'email support', 'call'], answer: 'You can reach support through the Help and Contact pages on the website. Those sections are the best place to submit questions related to orders, delivery, returns, account issues, and general store support.' },
];

const formatTime = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

const findBestTopic = (message) => {
  const lowered = message.toLowerCase();
  let bestTopic = null;
  let bestScore = 0;
  supportTopics.forEach((topic) => {
    const score = topic.keywords.reduce((total, keyword) => total + (lowered.includes(keyword) ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; bestTopic = topic; }
  });
  return bestScore > 0 ? bestTopic : null;
};

const findMatchingProduct = (message, products) => {
  const lowered = message.toLowerCase();
  return products.find((product) => {
    const name = product.name?.toLowerCase();
    return name && name.length > 3 && lowered.includes(name);
  });
};

const buildProductAnswer = (product) => {
  const stockMessage = Number(product.stock) > 0 ? `It currently appears to be in stock with ${product.stock} unit${product.stock === 1 ? '' : 's'} available.` : 'It currently appears to be out of stock.';
  return `${product.name} is listed in the ${product.category || 'product'} category for Rs. ${product.price}. ${stockMessage} You can open the product details page for images, description, ratings, and checkout options.`;
};

const buildOrderAnswer = (message) => {
  const match = message.match(/#\d+/);
  const orderLabel = match ? match[0] : 'your order';
  return `I can help with ${orderLabel}. For order-specific support, the most useful details are the order number, what happened, and whether the issue is about shipping, payment, address, damage, or return eligibility.`;
};

const buildFallbackAnswer = () => 'I can help with products, shipping, delivery timing, tracking, returns, refunds, cancellations, warranties, payment issues, website navigation, search, cart, favorites, checkout, account help, and contact support. Try asking a full question like "How do I find products on the website?" or "What is your return policy?"';

const GEMINI_KEY = typeof window !== 'undefined' ? (window.ENV?.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '') : '';

const quickTopics = [
  { label: 'Shipping times', icon: 'ðŸ“¦' },
  { label: 'Return policy', icon: 'â†©ï¸' },
  { label: 'Payment methods', icon: 'ðŸ’³' },
  { label: 'Track my order', icon: 'ðŸ”' },
  { label: 'Bulk order', icon: 'ðŸ“‹' },
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-primary/40"
          style={{
            animation: 'typingBounce 1.4s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickTopics, setShowQuickTopics] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    } else if (mounted) {
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const init = async () => {
      try {
        setLoadingProducts(true);
        const data = await api.products.getMinimal(200);
        if (!cancelled) setProducts(data || []);
      } catch { if (!cancelled) setProducts([]); }
      finally { if (!cancelled) setLoadingProducts(false); }
    };
    init();
    setMessages([
      { id: 'welcome-1', sender: 'bot', text: 'Hello! I am the Core Collective support chatbot. Ask me anything about products, shipping, returns, refunds, payments, warranties, stock, or order help.', time: 'Now', local: true },
      { id: 'welcome-2', sender: 'bot', text: 'Ask naturally about products, shipping, returns, orders, and more.', time: 'Now', local: true },
    ]);
    return () => { cancelled = true; };
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isTyping && isOpen) inputRef.current?.focus();
  }, [isTyping, isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (chatRef.current && !chatRef.current.contains(e.target) && !e.target.closest('[data-chat-toggle]')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateGeminiReply = async (message, history) => {
    if (!GEMINI_KEY) return null;
    const recent = history.slice(-10).map(m => ({ role: m.sender === 'user' ? 'user' : 'model', parts: [{ text: m.text || m.message }] }));
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [...recent, { role: 'user', parts: [{ text: message }] }],
          systemInstruction: { parts: [{ text: `You are a customer support assistant for Core Collective, a B2B marketplace. Keep responses concise (2-4 sentences). Be warm and professional. Store name: Core Collective. Contact: rehanilyas20196@gmail.com, +92 345 5900229. Address: Mellinium Karachi, Pakistan. Ships to 100+ countries. Currencies: PKR. For returns: 30-day window. For shipping: Standard free 5-7 business days, Express Rs. 999 2-3 days, Next Day Rs. 1,999 1 day. Payment: Visa, Mastercard, JazzCash (+92 345 5900229), EasyPaisa (+92 345 5900229), Direct Bank Transfer (Faysal Bank IBAN PK63FAYS0000123456789). Categories: Electronics, Clothing, Home, Sports, Pet Supplies, Tools.` }] },
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
        }),
      });
      const data = await res.json();
      if (data.error) return null;
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch { return null; }
  };

  const generateFallbackReply = (message) => {
    const productMatch = findMatchingProduct(message, products);
    if (productMatch) return buildProductAnswer(productMatch);
    if (message.includes('#')) return buildOrderAnswer(message);
    const topic = findBestTopic(message);
    if (topic) return topic.answer;
    return buildFallbackAnswer();
  };

  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const submitMessage = async (messageText) => {
    const cleaned = messageText.trim();
    if (!cleaned) return;
    setShowQuickTopics(false);
    const userMsg = { id: `user-${Date.now()}`, sender: 'user', text: cleaned, time: formatTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    const geminiText = await generateGeminiReply(cleaned, messagesRef.current);
    const botText = geminiText || generateFallbackReply(cleaned);
    const botMsg = { id: `bot-${Date.now() + 1}`, sender: 'bot', text: botText, time: formatTime() };
    setMessages((prev) => [...prev, botMsg]);
    setIsTyping(false);
    try { await api.messages.create('user', cleaned); } catch {}
    try { await api.messages.create('bot', botText); } catch {}
  };

  const handleSubmit = (e) => { e.preventDefault(); submitMessage(inputValue); };

  const handleClearChat = () => {
    setMessages([
      { id: 'welcome-1', sender: 'bot', text: 'Hello! I am the Core Collective support chatbot. Ask me anything about products, shipping, returns, refunds, payments, warranties, stock, or order help.', time: 'Now', local: true },
      { id: 'welcome-2', sender: 'bot', text: 'Ask naturally about products, shipping, returns, orders, and more.', time: 'Now', local: true },
    ]);
    setShowQuickTopics(true);
  };

  return (
    <>
      {/* Floating Button with Glow */}
      <button
        data-chat-toggle
        onClick={() => setIsOpen(!isOpen)}
        className="group fixed bottom-6 right-6 z-50"
        aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
      >
        <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping opacity-30" />
        <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary via-primary to-primary-700 text-gray-900 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-110 active:scale-95 transition-all duration-300">
          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-300 rotate-90 group-hover:rotate-180" />
          ) : (
            <MessageCircle className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
          )}
        </span>
      </button>

      {/* Chat Modal */}
      {(isOpen || mounted) && (
        <div
          ref={chatRef}
          className={`fixed bottom-24 right-0 sm:right-6 z-50 w-full sm:w-[380px] max-w-[calc(100vw-0rem)] sm:max-w-[calc(100vw-2rem)] origin-bottom-right transition-all duration-300 ease-out ${
            isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
          }`}
        >
          <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden">
            {/* Glass Header */}
            <div className="relative bg-gradient-to-r from-primary via-primary to-primary-700 overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
              <div className="relative px-4 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Bot className="w-5 h-5 text-gray-900" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-primary rounded-full" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900">Core Collective</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[11px] text-gray-900/70">
                        {isTyping ? 'Typing...' : loadingProducts ? 'Loading...' : 'Online'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleClearChat}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors group/btn"
                    title="Clear chat"
                  >
                    <Trash2 className="w-4 h-4 text-gray-900/60 group-hover/btn:text-gray-900 transition-colors" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors group/btn lg:hidden"
                    title="Close"
                  >
                    <ChevronDown className="w-4 h-4 text-gray-900/60 group-hover/btn:text-gray-900 transition-colors" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="h-[380px] overflow-y-auto px-4 py-4 space-y-3.5 bg-gradient-to-b from-gray-50 to-white scrollbar-thin" style={{ scrollBehavior: 'smooth' }}>
              {messages.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 transition-all duration-300 ${
                    msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                  style={{
                    animation: `msgIn 0.35s ease-out forwards`,
                    animationDelay: '0s',
                  }}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center shadow-md shadow-primary/20 shrink-0 mb-1">
                      <Bot className="w-4 h-4 text-gray-900" />
                    </div>
                  )}
                  <div
                    className={`relative max-w-[80%] px-3.5 py-2.5 ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-br from-primary to-primary-600 text-gray-900 rounded-2xl rounded-br-sm shadow-md shadow-primary/20'
                        : 'bg-white text-gray-800 rounded-2xl rounded-bl-sm shadow-md border border-gray-100'
                    } ${msg.local ? 'opacity-80' : ''}`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text || msg.message}</p>
                    <p className={`text-[10px] mt-1.5 font-medium ${
                      msg.sender === 'user' ? 'text-gray-900/50' : 'text-gray-600'
                    }`}>
                      {msg.time || 'Just now'}
                    </p>
                    {msg.sender === 'bot' && (
                      <div className="absolute -bottom-1 left-4 w-2 h-2 bg-white border-l border-b border-gray-100 rotate-[-45deg]" />
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-end gap-2.5 transition-all duration-300">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center shadow-md shadow-primary/20 shrink-0 mb-1">
                    <Bot className="w-4 h-4 text-gray-900" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-sm shadow-md border border-gray-100 px-4 py-3.5">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Topics */}
            {showQuickTopics && messages.length <= 2 && (
              <div className="px-4 py-3 bg-gradient-to-b from-gray-50 to-white border-t border-gray-100">
                <div className="flex items-center gap-2 mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Quick answers</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickTopics.map((topic) => (
                    <button
                      key={topic.label}
                      onClick={() => submitMessage(topic.label)}
                      className="group/btn inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 hover:border-primary hover:text-primary hover:bg-primary-50 hover:shadow-sm hover:shadow-primary/10 transition-all duration-200 active:scale-95"
                    >
                      <span className="text-sm leading-none">{topic.icon}</span>
                      <span className="font-medium">{topic.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-gray-100 px-4 py-3 bg-white">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all duration-200"
                    disabled={isTyping}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-700 hover:from-primary-600 hover:to-primary disabled:from-gray-200 disabled:to-gray-200 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shrink-0 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-95"
                >
                  <Send className="w-4 h-4 text-gray-900" />
                </button>
              </form>
              <p className="text-[10px] text-gray-600 mt-1.5 text-center font-medium">
                Powered by Gemini AI &mdash; Answers may be AI-generated
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
