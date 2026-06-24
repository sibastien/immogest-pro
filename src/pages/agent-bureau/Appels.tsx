import React, { useState } from 'react';
import {
  Phone, PhoneIncoming, PhoneMissed, PhoneOff, Clock,
  CheckCircle2, UserPlus, MessageSquare,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';

type CallStatus = 'recu' | 'manque' | 'rappel';
type CallType   = 'entrant' | 'sortant';

interface Call {
  id: string;
  name: string;
  phone: string;
  time: string;
  date: string;
  duration?: number;
  status: CallStatus;
  type: CallType;
  note?: string;
  ficheCreee: boolean;
}

const MOCK_CALLS: Call[] = [
  { id: 'c1', name: 'Mohamed Karim',  phone: '+216 98 123 456', time: '09:15', date: '2024-12-23', duration: 4,  status: 'recu',   type: 'entrant',  note: 'Cherche S+3 La Marsa, budget 450k', ficheCreee: false },
  { id: 'c2', name: 'Inconnu',        phone: '+216 21 987 654', time: '09:52', date: '2024-12-23', duration: 0,  status: 'manque', type: 'entrant',  ficheCreee: false },
  { id: 'c3', name: 'Leila Ben Said', phone: '+216 55 741 852', time: '10:30', date: '2024-12-23', duration: 7,  status: 'recu',   type: 'sortant',  note: 'Relance villa Gammarth — intéressée, rappel jeudi', ficheCreee: true },
  { id: 'c4', name: 'Kamel Trabelsi', phone: '+216 22 369 147', time: '11:05', date: '2024-12-23', duration: 0,  status: 'manque', type: 'entrant',  ficheCreee: false },
  { id: 'c5', name: 'Sonia Miled',    phone: '+216 94 258 369', time: '11:45', date: '2024-12-23', duration: 12, status: 'recu',   type: 'entrant',  note: 'Propriétaire mandat vente appartement Ennasr', ficheCreee: false },
  { id: 'c6', name: 'Rafik Jendoubi', phone: '+216 25 147 369', time: '14:00', date: '2024-12-23', duration: 0,  status: 'rappel', type: 'entrant',  note: 'À rappeler avant 17h', ficheCreee: false },
  { id: 'c7', name: 'Amira Chaari',   phone: '+216 97 654 321', time: '14:30', date: '2024-12-23', duration: 3,  status: 'recu',   type: 'entrant',  ficheCreee: true },
  { id: 'c8', name: 'Omar Belhaj',    phone: '+216 50 321 654', time: '15:15', date: '2024-12-23', duration: 0,  status: 'manque', type: 'entrant',  ficheCreee: false },
];

const STATUS_CONFIG = {
  recu:   { label: 'Reçu',         Icon: PhoneIncoming, color: 'text-success', bg: 'bg-success-light' },
  manque: { label: 'Manqué',       Icon: PhoneMissed,   color: 'text-danger',  bg: 'bg-danger-light' },
  rappel: { label: 'À rappeler',   Icon: PhoneOff,      color: 'text-warning', bg: 'bg-warning-light' },
};

export const AgentBureauAppels: React.FC = () => {
  const navigate = useNavigate();
  const [calls, setCalls] = useState<Call[]>(MOCK_CALLS);
  const [filter, setFilter] = useState<CallStatus | ''>('');
  const [note, setNote] = useState<Record<string, string>>({});
  const [noteOpen, setNoteOpen] = useState<string | null>(null);

  const filtered = filter ? calls.filter((c) => c.status === filter) : calls;

  const manqués = calls.filter((c) => c.status === 'manque' && !c.ficheCreee).length;
  const rappels = calls.filter((c) => c.status === 'rappel').length;

  const markCreated = (id: string) => setCalls((prev) => prev.map((c) => c.id === id ? { ...c, ficheCreee: true } : c));
  const markCalled  = (id: string) => setCalls((prev) => prev.map((c) => c.id === id ? { ...c, status: 'recu' } : c));

  const saveNote = (id: string) => {
    if (!note[id]?.trim()) return;
    setCalls((prev) => prev.map((c) => c.id === id ? { ...c, note: note[id] } : c));
    setNoteOpen(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Journal des appels</h2>
          <p className="text-sm text-gray-400">{calls.length} appels aujourd'hui</p>
        </div>
        <div className="flex gap-2">
          {manqués > 0 && <Badge variant="urgent" label={`${manqués} manqué${manqués > 1 ? 's' : ''}`} />}
          {rappels > 0 && <Badge variant="a_relancer" label={`${rappels} rappel${rappels > 1 ? 's' : ''}`} />}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5">
        {([
          { id: '', label: `Tous (${calls.length})` },
          { id: 'recu',   label: `Reçus (${calls.filter((c) => c.status === 'recu').length})` },
          { id: 'manque', label: `Manqués (${calls.filter((c) => c.status === 'manque').length})` },
          { id: 'rappel', label: `Rappels (${rappels})` },
        ] as const).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={[
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              filter === id ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Call list */}
      <div className="space-y-2">
        {filtered.map((call) => {
          const cfg = STATUS_CONFIG[call.status];
          const Icon = cfg.Icon;
          return (
            <Card key={call.id} padding="none">
              <div className="flex items-start gap-3 px-4 py-3">
                {/* Icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  <Icon size={16} className={cfg.color} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-gray-900">{call.name}</span>
                    {call.ficheCreee && <Badge variant="disponible" size="sm" label="Fiche créée" />}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="font-mono">{call.phone}</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {call.time}</span>
                    {(call.duration ?? 0) > 0 && <span>{call.duration} min</span>}
                  </div>
                  {call.note && (
                    <div className="mt-1.5 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded italic">{call.note}</div>
                  )}
                  {noteOpen === call.id && (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={note[call.id] ?? ''}
                        onChange={(e) => setNote((n) => ({ ...n, [call.id]: e.target.value }))}
                        placeholder="Ajouter une note…"
                        className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && saveNote(call.id)}
                      />
                      <button onClick={() => saveNote(call.id)} className="px-2.5 py-1.5 bg-primary text-white text-xs rounded-lg hover:bg-primary/90">OK</button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {call.status === 'manque' && (
                    <button
                      onClick={() => markCalled(call.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90"
                    >
                      <Phone size={12} /> Rappeler
                    </button>
                  )}
                  {call.status === 'rappel' && (
                    <button
                      onClick={() => markCalled(call.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-warning text-white rounded-lg text-xs font-medium"
                    >
                      <CheckCircle2 size={12} /> Traité
                    </button>
                  )}
                  {!call.ficheCreee && call.name !== 'Inconnu' && (
                    <button
                      onClick={() => { markCreated(call.id); navigate('/agent-bureau/nouvelle-fiche'); }}
                      className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50"
                    >
                      <UserPlus size={12} /> Fiche
                    </button>
                  )}
                  <button
                    onClick={() => setNoteOpen(noteOpen === call.id ? null : call.id)}
                    className="w-7 h-7 flex items-center justify-center border border-gray-200 text-gray-400 rounded-lg hover:bg-gray-50"
                  >
                    <MessageSquare size={13} />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
