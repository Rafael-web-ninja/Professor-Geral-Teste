import React, { useState, useEffect, useRef } from 'react';
import { startNewChat, sendMessageToGemini, extractWebSources } from './services/gemini';
import { Message, Sender, INITIAL_SUGGESTIONS, ChatSessionConfig } from './types';
import ChatInput from './components/ChatInput';
import MessageItem from './components/MessageItem';
import { BookOpenIcon, TrashIcon, SettingsIcon } from './components/Icons';
import SettingsModal from './components/SettingsModal';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamingText, setCurrentStreamingText] = useState('');
  const [chatConfig, setChatConfig] = useState<ChatSessionConfig>({
    useSearch: false,
    depthLevel: 'detailed'
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize chat on mount or config change
  useEffect(() => {
    startNewChat(chatConfig);
  }, [chatConfig]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamingText, isLoading]);

  const handleSend = async (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: Sender.User,
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);
    setCurrentStreamingText('');

    try {
      const { fullText, groundingMetadata } = await sendMessageToGemini(text, (chunk) => {
        setCurrentStreamingText((prev) => prev + chunk);
      });

      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: Sender.Professor,
        text: fullText,
        timestamp: new Date(),
        groundingMetadata: groundingMetadata ? { webSearchSources: extractWebSources(groundingMetadata) } : undefined
      };

      setMessages((prev) => [...prev, responseMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: Sender.Professor,
        text: "Desculpe, tive um problema ao processar sua solicitação. Por favor, tente novamente.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setCurrentStreamingText('');
    }
  };

  const clearChat = () => {
    if (window.confirm("Tem certeza que deseja apagar o histórico desta aula?")) {
      setMessages([]);
      startNewChat(chatConfig);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
                <BookOpenIcon className="text-white w-5 h-5" />
            </div>
            <h1 className="font-serif font-bold text-xl text-slate-900 tracking-tight">
              Professor Geral
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                title="Configurações"
            >
                <SettingsIcon className="w-5 h-5" />
            </button>
            {messages.length > 0 && (
              <button 
                onClick={clearChat}
                className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
                title="Limpar Conversa"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-6 pb-32 flex flex-col">
        
        {/* Welcome / Empty State */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <span className="text-4xl">🎓</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 text-center mb-3">
              O que vamos aprender hoje?
            </h2>
            <p className="text-slate-500 text-center max-w-md mb-8 text-lg">
              Sou seu professor particular de IA. Pergunte sobre história, ciências, artes ou qualquer curiosidade.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
              {INITIAL_SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(suggestion)}
                  className="text-left p-4 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md rounded-xl transition-all duration-200 group"
                >
                  <p className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                    {suggestion}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat List */}
        <div className="flex-1 flex flex-col">
          {messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} />
          ))}
          
          {/* Streaming Message Preview */}
          {isLoading && (
            <div className="flex w-full justify-start mb-6 animate-pulse">
               <div className="flex max-w-[80%] flex-row">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-1 bg-emerald-600 mr-3">
                    <BookOpenIcon className="text-white w-4 h-4" />
                  </div>
                  <div className="flex flex-col items-start">
                    <div className="relative px-5 py-4 rounded-2xl rounded-tl-none shadow-sm bg-white border border-slate-100 text-slate-800">
                        {currentStreamingText ? (
                            <div className="markdown-content text-sm md:text-base">
                                <p className="whitespace-pre-wrap">{currentStreamingText}</p>
                            </div>
                        ) : (
                            <div className="flex gap-1 items-center h-6">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        )}
                    </div>
                  </div>
               </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Fixed Input Area */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 p-4 z-30">
         <ChatInput onSend={handleSend} disabled={isLoading} />
      </footer>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        config={chatConfig}
        setConfig={setChatConfig}
      />

    </div>
  );
};

export default App;