import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, SparklesIcon } from './Icons';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled, placeholder }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative">
      <div className={`relative flex items-end bg-white border border-slate-200 rounded-xl shadow-sm focus-within:shadow-md focus-within:border-blue-400 transition-all duration-200 overflow-hidden ${disabled ? 'opacity-60 bg-slate-50' : ''}`}>
        
        <div className="pl-4 pb-3 text-slate-400">
            <SparklesIcon className="w-5 h-5" />
        </div>

        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder || "Pergunte qualquer coisa..."}
          className="w-full py-3 px-3 bg-transparent border-none focus:ring-0 resize-none text-slate-800 placeholder:text-slate-400 max-h-[150px] overflow-y-auto"
          style={{ minHeight: '48px' }}
        />

        <div className="pr-2 pb-2">
          <button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className={`p-2 rounded-lg transition-colors duration-200 flex items-center justify-center
              ${input.trim() && !disabled 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' 
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="text-center mt-2">
        <p className="text-[10px] text-slate-400">
          O Professor Geral pode cometer erros. Verifique informações importantes.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;