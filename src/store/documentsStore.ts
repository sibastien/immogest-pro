import { create } from 'zustand';
import { api } from '../lib/api';

export type DocType = 'mandat_vente' | 'mandat_location' | 'compromis' | 'acte' | 'bail' | 'autre';
export type DocStatus = 'brouillon' | 'en_attente_signature' | 'signe' | 'expire';

export interface AppDocument {
  id: string;
  type: DocType;
  title: string;
  propertyId?: string;
  clientId?: string;
  status: DocStatus;
  createdAt: string;
  expiresAt?: string;
  signedAt?: string;
  size: string;
  url?: string;
}

export interface NewDocumentInput {
  title: string;
  type: DocType;
  status: DocStatus;
  propertyId?: string;
  clientId?: string;
  expiresAt?: string;
  file?: File | null;
}

interface DocumentsState {
  documents: AppDocument[];
  loaded: boolean;
  load: () => Promise<void>;
  addDocument: (input: NewDocumentInput) => Promise<void>;
  removeDocument: (id: string) => void;
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  documents: [],
  loaded: false,

  load: async () => {
    try {
      const documents = await api.get<AppDocument[]>('/documents');
      set({ documents, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  addDocument: async (input) => {
    const fd = new FormData();
    fd.append('title', input.title);
    fd.append('type', input.type);
    fd.append('status', input.status);
    if (input.propertyId) fd.append('propertyId', input.propertyId);
    if (input.clientId) fd.append('clientId', input.clientId);
    if (input.expiresAt) fd.append('expiresAt', input.expiresAt);
    if (input.file) fd.append('file', input.file);

    const saved = await api.upload<AppDocument>('/documents', fd);
    set((state) => ({ documents: [saved, ...state.documents] }));
  },

  removeDocument: (id) => {
    set((state) => ({ documents: state.documents.filter((d) => d.id !== id) }));
    api.del(`/documents/${id}`).catch(() => get().load());
  },
}));
