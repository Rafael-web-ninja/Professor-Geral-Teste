import React from 'react';
import { ChatSessionConfig } from '../types';

interface SettingsModalProps {
  config: ChatSessionConfig;
  setConfig: (config: ChatSessionConfig) => void;
  onClose: () => void;
  isOpen: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ config, setConfig, onClose, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-serif font-bold text-slate-800 mb-4">Configurações da Aula</h2>
        
        <div className="space-y-6">
          {/* Depth Setting */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Profundidade da Explicação</label>
            <div className="grid grid-cols-3 gap-2">
              {(['concise', 'detailed', 'academic'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setConfig({ ...config, depthLevel: level })}
                  className={`py-2 px-3 text-sm rounded-lg border transition-all ${
                    config.depthLevel === level
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {level === 'concise' && 'Resumido'}
                  {level === 'detailed' && 'Detalhado'}
                  {level === 'academic' && 'Acadêmico'}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
                {config.depthLevel === 'concise' && 'Respostas rápidas e direto ao ponto.'}
                {config.depthLevel === 'detailed' && 'Explicações completas com exemplos e contexto.'}
                {config.depthLevel === 'academic' && 'Linguagem formal e definições técnicas precisas.'}
            </p>
          </div>

          {/* Web Search Toggle */}
          <div>
             <label className="flex items-center space-x-3 cursor-pointer">
                <div className="relative">
                    <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={config.useSearch}
                        onChange={(e) => setConfig({...config, useSearch: e.target.checked})}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${config.useSearch ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config.useSearch ? 'translate-x-4' : ''}`}></div>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700">Pesquisa na Web (Grounding)</span>
                    <span className="text-xs text-slate-500">Permite ao Professor acessar fatos atualizados.</span>
                </div>
            </label>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;