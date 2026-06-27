import React, { useState } from 'react';
import { useClientsStore } from '../../store/clientsStore';
import { useAgentsStore } from '../../store/agentsStore';
import type { Client, PropertyType } from '../../types';

const TYPE_OPTIONS: { value: Client['type']; label: string }[] = [
  { value: 'acheteur', label: 'Acheteur' },
  { value: 'locataire', label: 'Locataire' },
  { value: 'proprietaire', label: 'Propriétaire' },
];

const SOURCE_OPTIONS: { value: Client['source']; label: string }[] = [
  { value: 'appel', label: 'Appel entrant' },
  { value: 'web', label: 'Site web' },
  { value: 'email', label: 'Email' },
  { value: 'passage', label: 'Passage agence' },
  { value: 'recommandation', label: 'Recommandation' },
];

const STATUS_OPTIONS: { value: Client['status']; label: string }[] = [
  { value: 'actif', label: 'Actif' },
  { value: 'a_relancer', label: 'À relancer' },
  { value: 'compromis', label: 'Compromis' },
  { value: 'cloture', label: 'Clôturé' },
];

const PROPERTY_TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: 'vente_residentielle', label: 'Vente résidentielle' },
  { value: 'location_residentielle', label: 'Location' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'terrain', label: 'Terrain' },
];

const LOCATIONS = ['La Marsa', 'Gammarth', 'La Soukra', 'Ennasr', 'Menzah',
  'Ain Zaghouan', 'Centre-ville', 'Les Berges du Lac', 'Ariana'];

type FormData = Omit<Client, 'id' | 'createdAt'>;

interface ClientFormProps {
  client?: Client;
  defaultAgentId?: string;
  onSuccess: (id: string) => void;
  onCancel: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({ client, defaultAgentId, onSuccess, onCancel }) => {
  const isEdit = !!client;
  const { addClient, updateClient } = useClientsStore();
  const { agents } = useAgentsStore();

  const fieldAgents = agents.filter((a) => ['agent_terrain', 'agent_bureau'].includes(a.role));

  const [form, setForm] = useState<FormData>({
    name:        client?.name        ?? '',
    phone:       client?.phone       ?? '',
    email:       client?.email       ?? '',
    type:        client?.type        ?? 'acheteur',
    status:      client?.status      ?? 'actif',
    source:      client?.source      ?? 'appel',
    agentId:     client?.agentId     ?? defaultAgentId ?? (fieldAgents[0]?.id ?? ''),
    lastContact: client?.lastContact ?? new Date().toISOString().split('T')[0],
    budget:      client?.budget,
    search:      client?.search      ?? '',
    notes:       client?.notes       ?? '',
    propertyPreferences: client?.propertyPreferences ?? {},
  });

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key as string]) setErrors((e) => { const n = { ...e }; delete n[key as string]; return n; });
  };

  const togglePrefType = (t: PropertyType) => {
    const current = form.propertyPreferences?.type ?? [];
    set('propertyPreferences', {
      ...form.propertyPreferences,
      type: current.includes(t) ? current.filter((x) => x !== t) : [...current, t],
    });
  };

  const togglePrefLocation = (l: string) => {
    const current = form.propertyPreferences?.locations ?? [];
    set('propertyPreferences', {
      ...form.propertyPreferences,
      locations: current.includes(l) ? current.filter((x) => x !== l) : [...current, l],
    });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())  e.name  = 'Le nom est obligatoire';
    if (!form.phone.trim()) e.phone = 'Le téléphone est obligatoire';
    if (!form.agentId)      e.agentId = 'Sélectionnez un agent';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit && client) {
      updateClient(client.id, form);
      onSuccess(client.id);
    } else {
      const newId = `client-${Date.now()}`;
      addClient({ id: newId, createdAt: new Date().toISOString().split('T')[0], ...form });
      onSuccess(newId);
    }
  };

  const showBudget = form.type === 'acheteur' || form.type === 'locataire';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identité */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Identité</legend>
        <FormField label="Nom complet *" error={errors.name}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Prénom Nom"
            className={cls(!!errors.name)}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Téléphone *" error={errors.phone}>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+216 xx xxx xxx"
              className={cls(!!errors.phone)}
            />
          </FormField>
          <FormField label="Email">
            <input
              type="email"
              value={form.email ?? ''}
              onChange={(e) => set('email', e.target.value)}
              placeholder="email@exemple.tn"
              className={cls()}
            />
          </FormField>
        </div>
      </fieldset>

      {/* Classification */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Classification</legend>
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Type">
            <select value={form.type} onChange={(e) => set('type', e.target.value as Client['type'])} className={cls()}>
              {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </FormField>
          <FormField label="Statut">
            <select value={form.status} onChange={(e) => set('status', e.target.value as Client['status'])} className={cls()}>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </FormField>
          <FormField label="Source">
            <select value={form.source} onChange={(e) => set('source', e.target.value as Client['source'])} className={cls()}>
              {SOURCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Agent référent *" error={errors.agentId}>
            <select value={form.agentId} onChange={(e) => set('agentId', e.target.value)} className={cls(!!errors.agentId)}>
              <option value="">— Choisir —</option>
              {fieldAgents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </FormField>
          <FormField label="Dernier contact">
            <input
              type="date"
              value={form.lastContact}
              onChange={(e) => set('lastContact', e.target.value)}
              className={cls()}
            />
          </FormField>
        </div>
      </fieldset>

      {/* Budget */}
      {showBudget && (
        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget</legend>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Budget minimum (DT)">
              <input
                type="number"
                value={form.budget?.min ?? ''}
                onChange={(e) => set('budget', { min: Number(e.target.value), max: form.budget?.max ?? 0 })}
                placeholder="0"
                min={0}
                className={cls()}
              />
            </FormField>
            <FormField label="Budget maximum (DT)">
              <input
                type="number"
                value={form.budget?.max ?? ''}
                onChange={(e) => set('budget', { min: form.budget?.min ?? 0, max: Number(e.target.value) })}
                placeholder="0"
                min={0}
                className={cls()}
              />
            </FormField>
          </div>
        </fieldset>
      )}

      {/* Préférences */}
      {showBudget && (
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Préférences de recherche</legend>

          <FormField label="Description de la recherche">
            <textarea
              value={form.search ?? ''}
              onChange={(e) => set('search', e.target.value)}
              placeholder="Ex: Appartement T3 minimum, proche mer, parking…"
              rows={2}
              className={`${cls()} resize-none`}
            />
          </FormField>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Types de biens souhaités</label>
            <div className="flex flex-wrap gap-1.5">
              {PROPERTY_TYPE_OPTIONS.map((o) => {
                const selected = form.propertyPreferences?.type?.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => togglePrefType(o.value)}
                    className={[
                      'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                      selected ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50',
                    ].join(' ')}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Quartiers / Villes souhaitées</label>
            <div className="flex flex-wrap gap-1.5">
              {LOCATIONS.map((l) => {
                const selected = form.propertyPreferences?.locations?.includes(l);
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => togglePrefLocation(l)}
                    className={[
                      'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                      selected ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50',
                    ].join(' ')}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Surface minimum (m²)">
              <input
                type="number"
                value={form.propertyPreferences?.minSurface ?? ''}
                onChange={(e) => set('propertyPreferences', { ...form.propertyPreferences, minSurface: Number(e.target.value) || undefined })}
                placeholder="—"
                min={0}
                className={cls()}
              />
            </FormField>
            <FormField label="Nb. de pièces minimum">
              <input
                type="number"
                value={form.propertyPreferences?.rooms ?? ''}
                onChange={(e) => set('propertyPreferences', { ...form.propertyPreferences, rooms: Number(e.target.value) || undefined })}
                placeholder="—"
                min={1}
                className={cls()}
              />
            </FormField>
          </div>
        </fieldset>
      )}

      {/* Notes */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes internes</legend>
        <textarea
          value={form.notes ?? ''}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Informations complémentaires, contexte…"
          rows={3}
          className={`${cls()} resize-none`}
        />
      </fieldset>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="flex-1 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          {isEdit ? 'Enregistrer les modifications' : 'Créer le client'}
        </button>
      </div>
    </form>
  );
};

function cls(hasError = false) {
  return [
    'w-full px-3 py-2 border rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 transition-colors',
    hasError ? 'border-danger focus:ring-danger/30 focus:border-danger' : 'border-gray-200 focus:ring-primary/30 focus:border-primary',
  ].join(' ');
}

const FormField: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({ label, error, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
    {children}
    {error && <p className="text-xs text-danger mt-1">{error}</p>}
  </div>
);
