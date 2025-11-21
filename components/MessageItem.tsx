import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, Sender } from '../types';
import { GraduationCapIcon, GlobeIcon, CopyIcon, CheckIcon } from './Icons';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.sender === Sender.User;
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (isUser) return;

    // Don't trigger copy if user is selecting text
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;

    try {
      await navigator.clipboard.writeText(message.text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] lg:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-1 ${
          isUser ? 'bg-blue-600 ml-3' : 'bg-emerald-600 mr-3'
        }`}>
          {isUser ? (
            <span className="text-white text-xs font-bold">VC</span>
          ) : (
            <GraduationCapIcon className="text-white w-5 h-5" />
          )}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div 
            onClick={handleCopy}
            className={`relative px-5 py-4 rounded-2xl shadow-sm group ${
            isUser 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none cursor-pointer hover:bg-slate-50 transition-colors'
          }`}
            title={!isUser ? "Clique para copiar" : undefined}
          >
            
            {/* Copy Indicator */}
            {!isUser && (
              <div className={`absolute top-2 right-2 p-1 rounded-full bg-white/80 backdrop-blur-sm border border-slate-100 shadow-sm transition-all duration-200 ${
                isCopied 
                  ? 'opacity-100 scale-100 text-emerald-600' 
                  : 'opacity-0 scale-90 group-hover:opacity-100 text-slate-400'
              }`}>
                {isCopied ? <CheckIcon className="w-3.5 h-3.5" /> : <CopyIcon className="w-3.5 h-3.5" />}
              </div>
            )}

            {/* Message Text */}
            <div className={`markdown-content text-sm md:text-base ${isUser ? 'text-white' : 'text-slate-800'}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.text}
              </ReactMarkdown>
            </div>
          </div>

          {/* Sources / Grounding */}
          {!isUser && message.groundingMetadata?.webSearchSources && message.groundingMetadata.webSearchSources.length > 0 && (
            <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg w-full max-w-xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                <GlobeIcon className="w-3 h-3" />
                Fontes consultadas
              </div>
              <div className="flex flex-wrap gap-2">
                {message.groundingMetadata.webSearchSources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-white border border-slate-200 hover:border-blue-300 text-blue-600 px-2 py-1 rounded-md transition-colors truncate max-w-[200px]"
                  >
                    {source.title || new URL(source.uri).hostname}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp/Status */}
          <span className="text-[10px] text-slate-400 mt-1 px-1">
            {message.sender === Sender.Professor ? 'Professor Geral' : 'Você'} • {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            {message.isError && <span className="text-red-500 ml-2 font-bold">Falha ao enviar</span>}
          </span>
        </div>

      </div>
    </div>
  );
};

export default MessageItem;