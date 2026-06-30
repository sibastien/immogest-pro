export type Role = 'admin' | 'coordinatrice' | 'agent_bureau' | 'agent_terrain' | 'client';

export type PropertyType = 'villa' | 'appartement' | 'maison' | 'commercial';
export type TransactionType = 'vente' | 'location';
export type PropertyStatus = 'disponible' | 'sous_compromis' | 'loue' | 'vendu';

export interface Property {
  id: string;
  ref: string;
  title: string;
  transaction: TransactionType;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  priceType: 'vente' | 'mois';
  surface: number;
  rooms?: number;
  bathrooms?: number;
  location: string;
  address: string;
  agentId: string;
  photos: string[];
  createdAt: string;
  description?: string;
  features?: string[];
  floor?: number;
  totalFloors?: number;
  parking?: boolean;
  furnished?: boolean;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  type: 'acheteur' | 'locataire' | 'proprietaire';
  budget?: { min: number; max: number };
  search?: string;
  agentId: string;
  status: 'actif' | 'a_relancer' | 'compromis' | 'cloture';
  lastContact: string;
  source: 'appel' | 'web' | 'email' | 'passage' | 'recommandation' | 'facebook' | 'instagram' | 'tiktok' | 'mubawab';
  notes?: string;
  createdAt: string;
  propertyPreferences?: {
    type?: PropertyType[];
    locations?: string[];
    minSurface?: number;
    rooms?: number;
  };
}

export interface Agent {
  id: string;
  initials: string;
  name: string;
  role: Role;
  phone: string;
  email: string;
  status: 'disponible' | 'en_visite' | 'bureau' | 'hors_ligne';
  location?: string;
  avatar?: string;
  accessCode?: string;
  stats: {
    activeProperties: number;
    visitsThisMonth: number;
    transactions: number;
    commission: number;
  };
}

export interface Visit {
  id: string;
  propertyId: string;
  clientId: string;
  agentId: string;
  date: string;
  time: string;
  status: 'planifie' | 'confirme' | 'en_cours' | 'effectue' | 'annule';
  crSubmitted: boolean;
  notes?: string;
}

export interface CompteRendu {
  id: string;
  visitId: string;
  agentId: string;
  clientInterest: 1 | 2 | 3 | 4 | 5;
  result: 'offre_probable' | 'a_revoir' | 'refus';
  notes: string;
  followUp: string[];
  photos: string[];
  submittedAt?: string;
  validatedAt?: string;
  status: 'brouillon' | 'soumis' | 'valide' | 'correction_demandee';
}

export interface Call {
  id: string;
  agentId: string;
  agentName?: string;
  clientId?: string;
  clientName: string;
  phone?: string;
  type: 'entrant' | 'sortant';
  outcome: 'joint' | 'non_repondu' | 'rappel';
  notes: string;
  date: string;
  time: string;
}

export interface Transaction {
  id: string;
  ref: string;
  propertyId: string;
  clientId: string;
  agentId: string;
  transaction: TransactionType;
  type: PropertyType;
  amount: number;
  commission: number;
  stage: 'prospection' | 'visite' | 'offre' | 'compromis' | 'acte' | 'cloture';
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  initials: string;
  role: Role;
  agentId?: string;
  clientId?: string;
  email: string;
}

export interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  type: 'visite' | 'signature' | 'appel' | 'reunion' | 'autre';
  clientId?: string;
  propertyId?: string;
  agentId: string;
  status: 'planifie' | 'confirme' | 'annule' | 'effectue';
  notes?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'mandat' | 'compromis' | 'acte' | 'identite' | 'fiscalite' | 'autre';
  transactionId?: string;
  clientId?: string;
  propertyId?: string;
  uploadedAt: string;
  uploadedBy: string;
  size: number;
  url?: string;
  status: 'en_attente' | 'valide' | 'expire';
}

export interface Notification {
  id: string;
  userId: string;
  type: 'visite' | 'cr' | 'offre' | 'relance' | 'systeme';
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}
