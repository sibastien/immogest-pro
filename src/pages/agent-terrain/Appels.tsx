import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Phone, PhoneIncoming, PhoneOutgoing, Plus, Clock,
  CheckCircle2, PhoneOff, MessageSquare, X,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useCallsStore } from '../../store/callsStore';
import { useClientsStore } from '../../store/clientsStore';
import { useAuthStore } from '../../store/authStore';
import type { Call } from '../../types';
import { todayISO } from '../../lib/today';

const OUTCOME_CONFIG = {
  joint:       { label: 'Joint',       Icon: CheckCircle2, color: 'text-success', bg: 'bg-success-light' },
  non_repondu: { label: 'Sans réponse', Icon: PhoneOff,    color: 'text-danger',  bg: 'bg-danger-light' },
  rappel:      { label: 'À rappeler',  Icon: Clock,        color: 'text-warning', bg: 'bg-warning-light' },
} as const;

function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

export const AgentTerrainAppels: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const { user } = useAuthStore();
  const { getCallsByAgent, addCall } = useCallsStore();
  const { clients, updateClient } = useClientsStore();

  const myClients = clients.filter((c) => c.agentId === user?.agentId);
  const calls = user?.agentId ? getCallsByAgent(user.agentId) : [];

  const initialClient = params.get('client') ?? '';
  const [open, setOpen] = useState(!!initialClient);
  const [clientId, setClientId] = useState(initialClient);
  const [freeName, setFreeName] = useState('');
  const [freePhone, setFreePhone] = useState('');
  const [type, setType] = useState<Call['type']>('sortant');
  const [outcome, setOutcome] = useState<Call['outcome']>('joint');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const resetForm = () => {
    setClientId(''); setFreeName(''); setFreePhone('');
    setType('sortant'); setOutcome('joint'); setNotes(''); setError('');
  };

  const closeForm = () => {
    setOpen(false);
    resetForm();
    if (params.get('client')) { params.delete('client'); setParams(params, { replace: true }); }
  };

  const handleSave = () => {
    const client = myClients.find((c) => c.id === clientId);
    const name = client?.name ?? freeName.trim();
    if (!name) { setError('Sélectionnez un client ou saisissez un nom.'); return; }
    if (!notes.trim()) { setError('Indiquez ce qui a été discuté.'); return; }

    const call: Call = {
      id: `call-${Date.now()}`,
      agentId: user!.agentId!,
      clientId: client?.id,
      clientName: name,
      phone: client?.phone ?? (freePhone.trim() || undefined),
      type,
      outcome,
      notes: notes.trim(),
      date: todayISO(),
      time: nowTime(),
    };
    addCall(call);
    if (client) updateClient(client.id, { lastContact: todayISO() });
    closeForm();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Mes appels</h2>
          <p className="text-sm text-gray-400">{calls.length} appel{calls.length !== 1 ? 's' : ''} enregistré{calls.length !== 1 ? 's' : ''}</p>
        </div>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90"
          >
            <Plus size={15} /> Appel
          </button>
        )}
      </div>

      {/* New call form */}
      {open && (
        <Card padding="lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Nouvel appel</h3>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Client (depuis une fiche)</label>
              <select
                value={clientId}
                onChange={(e) => { setClientId(e.target.value); setError(''); }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">— Client hors fiche —</option>
                {myClients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>
                ))}
              </select>
            </div>

            {!clientId && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={freeName}
                  onChange={(e) => { setFreeName(e.target.value); setError(''); }}
                  placeholder="Nom du contact"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="tel"
                  value={freePhone}
                  onChange={(e) => setFreePhone(e.target.value)}
                  placeholder="Téléphone"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Sens</label>
                <div className="flex gap-1.5">
                  {([['sortant', 'Sortant'], ['entrant', 'Entrant']] as const).map(([v, l]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setType(v)}
                      className={[
                        'flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                        type === v ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200',
                      ].join(' ')}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Résultat</label>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value as Call['outcome'])}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {Object.entries(OUTCOME_CONFIG).map(([v, c]) => (
                    <option key={v} value={v}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Ce qui a été discuté *</label>
              <textarea
                value={notes}
                onChange={(e) => { setNotes(e.target.value); setError(''); }}
                placeholder="Résumé de l'échange avec le client…"
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {error && <p className="text-xs text-danger">{error}</p>}

            <button
              onClick={handleSave}
              className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90"
            >
              Enregistrer l'appel
            </button>
          </div>
        </Card>
      )}

      {/* Call log */}
      <div className="space-y-2">
        {calls.map((call) => {
          const cfg = OUTCOME_CONFIG[call.outcome];
          const Icon = cfg.Icon;
          const DirIcon = call.type === 'entrant' ? PhoneIncoming : PhoneOutgoing;
          return (
            <Card key={call.id} padding="none">
              <div className="flex items-start gap-3 px-4 py-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  <Icon size={16} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-gray-900 truncate">{call.clientName}</span>
                    <Badge variant="gray" size="sm" label={cfg.label} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><DirIcon size={11} /> {call.type === 'entrant' ? 'Entrant' : 'Sortant'}</span>
                    {call.phone && <span className="font-mono">{call.phone}</span>}
                    <span className="flex items-center gap-1"><Clock size={10} /> {call.time}</span>
                  </div>
                  <div className="mt-1.5 text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded flex gap-1.5">
                    <MessageSquare size={12} className="text-gray-400 flex-shrink-0 mt-0.5" />
                    <span>{call.notes}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {calls.length === 0 && !open && (
          <div className="flex flex-col items-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            <Phone size={28} className="mb-2 opacity-30" />
            <p className="text-sm">Aucun appel enregistré</p>
            <p className="text-xs mt-1">Touchez « Appel » pour en ajouter un</p>
          </div>
        )}
      </div>
    </div>
  );
};
