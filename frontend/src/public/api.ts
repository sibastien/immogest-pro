import type { Property } from '../types';

const BASE = '/api/public';

export async function fetchPublicProperties(): Promise<Property[]> {
  const res = await fetch(`${BASE}/properties`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchPublicProperty(id: string): Promise<Property | null> {
  const res = await fetch(`${BASE}/properties/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export interface InquiryPayload {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  propertyId?: string;
  propertyRef?: string;
}

export async function submitInquiry(payload: InquiryPayload): Promise<boolean> {
  const res = await fetch(`${BASE}/inquiry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.ok;
}
