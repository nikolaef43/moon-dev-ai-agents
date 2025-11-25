import React from 'react';
import { ChatMessage, Source } from '../types';
import { VortigenOSLogo } from './icons';

const DeprecatedSourceLinks: React.FC<{ sources: Source[] }> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="mt-3 border-t border-gray-600 pt-3">
      <h4 className="text-xs font-semibold text-gray-400 mb-2">Sources:</h4>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, index) => (
          <a
            key={index}
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-gray-700 hover:bg-gray-600 text-blue-300 px-2 py-1 rounded-md transition-colors duration-200 truncate max-w-xs"
            title={source.title}
          >
            {index + 1}. {source.title}
          </a>
        ))}
      </div>
    </div>
  );
};


export const DeprecatedAIMessage: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isModel = message.role === 'model';
  return (
    <div className="flex items-start gap-3 my-4">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isModel ? 'bg-blue-900/50' : 'bg-gray-700'}`}>
        {isModel ? <VortigenOSLogo className="w-5 h-5 text-blue-400" /> : <span className="text-sm font-bold text-gray-300">U</span>}
      </div>
      <div className={`w-full p-4 rounded-lg shadow-md ${isModel ? 'bg-gray-800 text-gray-200' : 'bg-blue-600 text-white'}`}>
        <p className="whitespace-pre-wrap">{message.text}</p>
        {message.sources && <DeprecatedSourceLinks sources={message.sources} />}
      </div>
    </div>
  );
};