export enum Sender {
  User = 'user',
  Professor = 'model',
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: Date;
  isError?: boolean;
  groundingMetadata?: GroundingMetadata;
}

export interface GroundingMetadata {
  webSearchSources?: {
    uri: string;
    title: string;
  }[];
}

export interface ChatSessionConfig {
  useSearch: boolean;
  depthLevel: 'concise' | 'detailed' | 'academic';
}

export const INITIAL_SUGGESTIONS = [
  "Como funciona a mecânica quântica?",
  "Resuma a Revolução Francesa",
  "Dicas para estudar melhor",
  "Explique a Teoria da Relatividade",
];