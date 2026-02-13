
export enum AppView {
  CHAT = 'CHAT',
  LIVE = 'LIVE'
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface LegalSpecialty {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const LEGAL_SPECIALTIES: LegalSpecialty[] = [
  { id: 'penal', name: 'Derecho Penal', description: 'Consultas sobre delitos y penas.', icon: '⚖️' },
  { id: 'civil', name: 'Derecho Civil', description: 'Contratos, herencias y propiedad.', icon: '🏠' },
  { id: 'familia', name: 'Derecho de Familia', description: 'Divorcios, pensiones y custodia.', icon: '👪' },
  { id: 'laboral', name: 'Derecho Laboral', description: 'Despidos, contratos y seguridad social.', icon: '💼' },
  { id: 'mercantil', name: 'Derecho Mercantil', description: 'Asesoría para empresas y comercio.', icon: '🏢' },
  { id: 'constitucional', name: 'Derecho Constitucional', description: 'Garantías y derechos fundamentales.', icon: '📜' },
  { id: 'administrativo', name: 'Derecho Administrativo', description: 'Trámites ante el sector público.', icon: '🏛️' }
];
