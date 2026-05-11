import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { Leaf, Send, Sparkles } from 'lucide-react';
import { sendMessage, ChatMessage } from './lib/gemini';

const INITIAL_MESSAGE: ChatMessage = {
  id: '0',
  role: 'model',
  text: `¡Hola, hermanitos! 🌟 Estoy aquí descansando un poco bajo este hermoso árbol después de trabajar las tierras 🌳🚜. ¡Qué ilusión tan grande me da conocer a niños del futuro! 🕰️✨

¿De qué os gustaría que habláramos el día de hoy, vuestras mercedes?`
};

const OPTIONS = [
  "¡Mis amigos los ángeles! 😇",
  "¡El pozo mágico! 💦",
  "¿Cómo era Madrid hace mil años? 🏰"
];

const FLORA_EMOJIS = ["🌻", "🌷", "🌹", "🌼", "🌸", "🪴", "🌳", "🌱", "🌾", "🌿"];

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [plants, setPlants] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      let responseText = await sendMessage(messages, text.trim());
      
      // Handle the "Huerto de Palabras Bonitas" logic
      if (responseText.includes('[SEMILLA_BUENA]')) {
        responseText = responseText.replace(/\[SEMILLA_BUENA\]/g, '');
        const newPlant = FLORA_EMOJIS[Math.floor(Math.random() * FLORA_EMOJIS.length)];
        setPlants(prev => [...prev, newPlant]);
      } else if (responseText.includes('[SEMILLA_MALA]')) {
        responseText = responseText.replace(/\[SEMILLA_MALA\]/g, '');
      }

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText.trim(),
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionClick = (option: string) => {
    handleSend(option);
  };

  return (
    <div className="min-h-screen bg-[#F0F7F4] flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 font-sans">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col h-[90vh] md:h-[800px] border border-green-100 relative">
        
        {/* Header and Garden */}
        <div className="bg-green-600 text-white p-4 flex flex-col items-center justify-center gap-2 relative z-10 shadow-md">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <h1 className="text-xl md:text-2xl font-bold tracking-wide">San Isidro Labrador</h1>
            <Leaf className="w-5 h-5 text-green-200" />
          </div>
          
          {/* Garden Area */}
          <div className="w-full flex flex-col items-center mt-2 px-2">
            <div className={`text-sm font-medium text-green-100 mb-1 transition-opacity duration-500 ${plants.length > 0 ? 'opacity-100' : 'opacity-50'}`}>
              Huerto de Palabras Bonitas 🪴
            </div>
            <div className="flex flex-wrap justify-center min-h-[40px] items-end gap-1 p-2 bg-green-700/50 rounded-xl w-full max-w-lg border border-green-500/30">
              {plants.length === 0 && (
                <span className="text-green-300 text-sm italic">¡Aún no hay plantas! Di algo bonito para sembrar. 🌱</span>
              )}
              <AnimatePresence>
                {plants.map((plant, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="text-2xl select-none"
                    title="¡Una buena palabra ha hecho crecer esta planta!"
                  >
                    {plant}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-green-500 text-white rounded-tr-sm shadow-md' 
                      : 'bg-[#FFFDF5] text-gray-800 rounded-tl-sm shadow-md border border-yellow-100'
                  }`}
                >
                  <div className={`prose prose-sm md:prose-base ${msg.role === 'user' ? 'prose-invert' : ''} max-w-none break-words`}>
                    <Markdown>{msg.text}</Markdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Quick Options for the very first interaction */}
          {messages.length === 1 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-3 items-start pl-2 pt-2"
            >
              {OPTIONS.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium px-4 py-3 rounded-xl shadow-sm border border-yellow-300 transition-all text-left flex items-center transform hover:scale-[1.02] active:scale-95"
                >
                  {option}
                </button>
              ))}
            </motion.div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex justify-start"
            >
              <div className="bg-[#FFFDF5] p-4 rounded-2xl rounded-tl-sm shadow-md border border-yellow-100 flex gap-2 items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-green-100 relative z-10">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputText);
            }} 
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe tu mensaje a Isidro..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all shadow-inner text-gray-800 placeholder-gray-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl shadow-md transition-all flex items-center justify-center transform active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
}

