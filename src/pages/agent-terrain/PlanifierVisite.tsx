import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CalendarPlus } from 'lucide-react';
import { useAgentsStore } from '../../store/agentsStore';
import { useClientsStore } from '../../store/clientsStore';
import { usePropertiesStore } from '../../store/propertiesStore';
import { useAuthStore } from '../../store/authStore';
import type { Visit } from '../../types';
import { todayISO } from '../../lib/today';

export const AgentTerrainPlanifierVisite: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuthStore();
  const { addVisit } = useAgentsStore();
  const { clients } = useClientsStore();
  const { properties } = usePropertiesStore();

  const myClients = clients.filter((c) => c.agentId === user?.agentId);

  const [clientId, setClientId] = useState(params.get('client') ?? '');
  const [propertyId, setPropertyId] = useState('');
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) { setError('Sélectionnez un client.'); return; }
    if (!propertyId) { setError('Sélectionnez un bien.'); return; }
    if (!date || !time) { setError('Indiquez la date et l\'heure.'); return; }

    const visit: Visit = {
      id: `visit-${Date.now()}`,
      propertyId,
      clientId,
      agentId: user!.agentId!,
      date,
      time,
      status: 'planifie',
      crSubmitted: false,
      notes: notes.trim() || undefined,
    };
    addVisit(visit);
    navigate('/agent-terrain');
  };

  const inputCls =
    'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={15} className="text-gray-500" />
        </button>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Planifier une visite</h2>
          <p className="text-sm text-gray-400">Nouveau rendez-vous terrain</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Client *</label>
          <select value={clientId} onChange={(e) => { setClientId(e.target.value); setError(''); }} className={inputCls}>
            <option value="">— Choisir un client —</option>
            {myClients.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}
          </select>
          {myClients.length === 0 && (
            <p className="text-xs text-gray-400 mt-1">
              Aucune fiche.{' '}
              <button type="button" onClick={() => navigate('/agent-terrain/nouvelle-fiche')} className="text-primary font-medium">
                Créer une fiche
              </button>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Bien à visiter *</label>
          <select value={propertyId} onChange={(e) => { setPropertyId(e.target.value); setError(''); }} className={inputCls}>
            <option value="">— Choisir un bien —</option>
            {properties.map((p) => <option key={p.id} value={p.id}>{p.title} · {p.location}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Date *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Heure *</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Précisions sur la visite…"
            rows={2}
            className={`${inputCls} resize-none`}
          />
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90"
        >
          <CalendarPlus size={16} /> Planifier la visite
        </button>
      </form>
    </div>
  );
};
