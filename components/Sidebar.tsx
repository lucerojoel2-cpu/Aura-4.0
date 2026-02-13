
import React from 'react';
import { LEGAL_SPECIALTIES } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSchedule: () => void;
  onSpecialtyClick: (name: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, onReset, onSchedule, onSpecialtyClick }) => {
  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-blue-800 tracking-tight">IURYNEX</h1>
            <button onClick={onToggle} className="md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">
            "El Derecho que piensa contigo"
          </p>
        </div>

        {/* Aura Avatar Section */}
        <div className="p-6 flex flex-col items-center border-b border-gray-100 bg-gradient-to-b from-white to-blue-50">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-100 shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200" 
                alt="Aura" 
                className="w-full h-full object-cover grayscale brightness-110 sepia-[.2] hue-rotate-[180deg]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://picsum.photos/200/200?blur=2';
                }}
              />
            </div>
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <h2 className="text-lg font-bold text-gray-800">Aura</h2>
          <p className="text-xs text-gray-500 text-center px-4">Asistente Jurídica Inteligente 24/7</p>
        </div>

        {/* Legal Specialties List */}
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 px-2">Especialidades</h3>
          <div className="space-y-1">
            {LEGAL_SPECIALTIES.map((spec) => (
              <button
                key={spec.id}
                onClick={() => onSpecialtyClick(spec.name)}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors group text-left"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">{spec.icon}</span>
                <span className="font-medium">{spec.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 space-y-2 border-t border-gray-200">
          <button 
            onClick={onReset}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span>Reiniciar Chat</span>
          </button>
          <button 
            onClick={onSchedule}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span>Agendar Cita</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
