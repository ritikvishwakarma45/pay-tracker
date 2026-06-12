import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, AlertCircle } from 'lucide-react';
import { apiService } from '../services/apiService';

export default function AIChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      text: "Hello! I am your pay tracker AI. Ask me anything about your spending history, monthly budget, or request tips to manage your money.",
      sender: 'ai',
      createdAt: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (textToSend) => {
    const prompt = textToSend || input;
    if (!prompt.trim()) return;

    setErrorMsg(null);
    setInput('');
    setIsLoading(true);

    // Append user message
    const userMsg = {
      id: `user-${Date.now()}`,
      text: prompt,
      sender: 'user',
      createdAt: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const data = await apiService.chatWithAI(prompt);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        text: data.response,
        sender: 'ai',
        createdAt: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Could not reach AI Assistant.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "How much did I spend this month?",
    "Am I close to my budget limit?",
    "Give me tips to save money",
    "Show expense breakdown"
  ];

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 font-sans">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-[#006c49] hover:bg-[#005439] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 duration-200 transition-all group"
          title="Ask AI Assistant"
        >
          <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
          </span>
        </button>
      )}

      {/* Expandable Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[410px] h-[550px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
          
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 bg-[#f0f4f9] dark:bg-slate-800 border-b border-slate-200 dark:border-slate-750">
            <div className="flex items-center gap-3">
              {/* Badge */}
              <div className="w-10 h-10 rounded-full bg-[#4de2a6] dark:bg-[#006c49] flex items-center justify-center">
                <Sparkles className="w-5.5 h-5.5 text-[#006c49] dark:text-[#6ffbbe]" />
              </div>
              <div>
                <h4 className="font-bold text-[16px] text-[#006c49] dark:text-[#6ffbbe]">Pay Tracker AI</h4>
                <p className="text-[11.5px] text-slate-500 dark:text-slate-400">Financial Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-800 dark:text-slate-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white dark:bg-slate-900">
            {messages.map((m) => (
              <div key={m.id} className="space-y-1">
                <div className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4.5 py-3.5 text-[13px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                      m.sender === 'user'
                        ? 'bg-[#006c49] text-white rounded-tr-none'
                        : 'bg-[#eef3fc] dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-transparent'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
                <div className={`flex text-[10.5px] text-slate-400 dark:text-slate-500 px-1 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  Just now
                </div>
              </div>
            ))}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2 text-red-600 dark:text-red-400 text-xs">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#eef3fc] dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}

            {/* Suggested Actions Section inside message area */}
            {!isLoading && messages.length > 0 && messages[messages.length - 1].sender === 'ai' && (
              <div className="pt-2">
                <p className="text-[12.5px] font-bold text-slate-800 dark:text-slate-350 mb-2">Suggested Actions</p>
                <div className="flex gap-2 overflow-x-auto scrollbar-none whitespace-nowrap pb-1">
                  {quickPrompts.map((qp, index) => (
                    <button
                      key={index}
                      onClick={() => handleSend(qp)}
                      className="px-4 py-2.5 bg-white dark:bg-slate-850 hover:bg-slate-55 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[12.5px] font-semibold text-[#006c49] dark:text-[#6ffbbe] rounded-full transition-all active:scale-95 flex-shrink-0"
                    >
                      {qp}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div className="p-4 bg-[#f8fafd] dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex flex-col">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="w-full bg-[#eef3fc] dark:bg-slate-800 rounded-[16px] flex items-center pl-4 pr-2 py-1.5 focus-within:ring-2 focus-within:ring-[#006c49]/20"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask PayTracker AI..."
                disabled={isLoading}
                className="flex-1 bg-transparent border-none text-[13.5px] focus:outline-none dark:text-white disabled:opacity-50 placeholder-slate-450 dark:placeholder-slate-400 py-2"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 bg-[#006c49] hover:bg-[#005439] disabled:opacity-40 disabled:hover:bg-[#006c49] text-white rounded-xl flex items-center justify-center transition-colors active:scale-95"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-2.5">
              AI can make mistakes. Check important financial info.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
