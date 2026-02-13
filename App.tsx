
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import LiveInterface from './components/LiveInterface';
import { AppView, Message } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.CHAT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: '¡Hola! Soy Aura, tu asistente jurídica de IURYNEX. ¿En qué puedo orientarte hoy respecto a las leyes de Ecuador?',
      timestamp: new Date()
    }
  ]);

  const handleResetChat = useCallback(() => {
    setMessages([
      {
        role: 'model',
        content: 'Chat reiniciado. Hola, soy Aura. ¿Cómo puedo ayudarte con tus consultas legales hoy?',
        timestamp: new Date()
      }
    ]);
  }, []);

  const handleSpecialtyClick = useCallback((specialtyName: string) => {
    const newUserMessage: Message = {
      role: 'user',
      content: `Hola Aura, necesito asesoría sobre ${specialtyName}.`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setView(AppView.CHAT); // Switch to chat view if in live
  }, []);

  const handleScheduleClick = () => {
    window.open('https://iurynex.com/agendar', '_blank');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onReset={handleResetChat}
        onSchedule={handleScheduleClick}
        onSpecialtyClick={handleSpecialtyClick}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Navigation Tabs - Top Center */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex p-1 bg-white border border-gray-200 rounded-full shadow-lg">
          <button
            onClick={() => setView(AppView.CHAT)}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              view === AppView.CHAT 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setView(AppView.LIVE)}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              view === AppView.LIVE 
                ? 'bg-red-600 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Chat en Vivo 🎙️
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 mt-20 p-4 md:p-6 overflow-hidden">
          {view === AppView.CHAT ? (
            <ChatInterface messages={messages} setMessages={setMessages} />
          ) : (
            <LiveInterface />
          )}
        </div>

        {/* Mobile Sidebar Toggle (Visible only when sidebar is closed on mobile) */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="fixed bottom-6 left-6 md:hidden bg-blue-600 text-white p-3 rounded-full shadow-2xl z-20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        )}
      </main>
    </div>
  );
};

export default App;
