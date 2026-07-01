import React, { useEffect, useMemo, useState } from 'react';
import {
  Phone, PhoneIncoming, PhoneOutgoing, Plus, Clock, PhoneOff,
  CheckCircle2, MessageSquare, X, Search, ChevronLeft, ChevronRight, User,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { useCallsStore } from '../store/callsStore';
import { useClientsStore } from '../store/clientsStore';
import { useAuthStore } from '../store/authStore';
import type { Call } from '../types';
import { todayISO } from '../lib/today';

const OUTCOME = {
  joint:       { label: 'Joint',        Icon: CheckCircle2, color: 'text-success', bg: 'bg-success-light', variant: 'disponible' as const },
  non_repondu: { label: 'Sans réponse', Icon: PhoneOff,     color: 'text-danger',  bg: 'bg-danger-light',  variant: 'urgent' as const },
  rappel:      { label: 'À rappeler',   Icon: Clock,        color: 'text-warning', bg: 'bg-warning-light', variant: 'a_relancer' as const },
};

function addDays(iso: string, n: number) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  // Format from local components — toISOString() would shift the day in
  // non-UTC timezones (e.g. UTC+1), which made the day navigator misbehave.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dayLabel(iso: string) {
  const today = todayISO();
  if (iso === today) return "Aujourd'hui";
  if (iso === addDays(today, -1)) return 'Hier';
  return new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

function fmtShort(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export const CallsPanel: React.FC = () => {
  const { user } = useAuthStore();
  const { calls, load, addCall } = useCallsStore();
  const { clients, load: loadClients } = useClientsStore();

  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [search, setSearch] = useState('');

  // Create form
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [freeName, setFreeName] = useState('');
  const [freePhone, setFreePhone] = useState('');
  const [type, setType] = useState<Call['type']>('sortant');
  const [outcome, setOutcome] = useState<Call['outcome']>('joint');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { load(); loadClients(); }, [load, loadClients]);

  const searching = search.trim().length > 0;

  // When searching (by phone or name) we look across ALL days; otherwise the
  // selected day only — a fresh day starts empty and you page back to older days.
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return calls
      .filter((c) => (searching
        ? (c.phone?.toLowerCase().includes(q) || c.clientName.toLowerCase().includes(q))
        : c.date === selectedDate))
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
  }, [calls, search, searching, selectedDate]);

  const resetForm = () => {
    setClientId(''); setFreeName(''); setFreePhone('');
    setType('sortant'); setOutcome('joint'); setNotes(''); setError('');
  };

  const handleSave = () => {
    const client = clients.find((c) => c.id === clientId);
    const name = client?.name ?? freeName.trim();
    if (!name) { setError('Sélectionnez un client ou saisissez un nom.'); return; }
    if (!notes.trim()) { setError('Indiquez ce qui a été discuté.'); return; }

    const call: Call = {
      id: `call-${Date.now()}`,
      agentId: user?.agentId ?? user?.id ?? '',
      agentName: user?.name,
      clientId: client?.id,
      clientName: name,
      phone: client?.phone ?? (freePhone.trim() || undefined),
      type,
      outcome,
      notes: notes.trim(),
      date: todayISO(),
      time: new Date().toTimeString().slice(0, 5),
    };
    addCall(call);
    resetForm();
    setOpen(false);
    setSelectedDate(todayISO()); // jump to today so the new call is visible
  };

  const isToday = selectedDate === todayISO();

  return (
    <div className="space-y-4">
      {/* Toolbar: search + new call */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par numéro ou nom de client…"
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90"
          >
            <Plus size={15} /> Nouvel appel
          </button>
        )}
      </div>

      {/* Create form */}
      {open && (
        <Card padding="lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Nouvel appel</h3>
            <button onClick={() => { setOpen(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
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
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}
              </select>
            </div>

            {!clientId && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text" value={freeName}
                  onChange={(e) => { setFreeName(e.target.value); setError(''); }}
                  placeholder="Nom du contact"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="tel" value={freePhone}
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
                      key={v} type="button" onClick={() => setType(v)}
                      className={[
                        'flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                        type === v ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200',
                      ].join(' ')}
                    >{l}</button>
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
                  {Object.entries(OUTCOME).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
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

            <button onClick={handleSave} className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90">
              Enregistrer l'appel
            </button>
          </div>
        </Card>
      )}

      {/* Day navigator (hidden while searching) */}
      {!searching && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-2 py-1.5">
          <button
            onClick={() => setSelectedDate((d) => addDays(d, -1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-900 capitalize">{dayLabel(selectedDate)}</div>
            <div className="text-xs text-gray-400">{fmtShort(selectedDate)} · {visible.length} appel{visible.length !== 1 ? 's' : ''}</div>
          </div>
          <button
            onClick={() => setSelectedDate((d) => addDays(d, 1))}
            disabled={isToday}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {visible.map((call) => {
          const cfg = OUTCOME[call.outcome] ?? OUTCOME.joint;
          const Icon = cfg.Icon;
          const DirIcon = call.type === 'entrant' ? PhoneIncoming : PhoneOutgoing;
          return (
            <Card key={call.id} padding="none">
              <div className="flex items-start gap-3 px-4 py-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  <Icon size={16} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-semibold text-gray-900 truncate">{call.clientName}</span>
                    <Badge variant={cfg.variant} size="sm" label={cfg.label} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1"><DirIcon size={11} /> {call.type === 'entrant' ? 'Entrant' : 'Sortant'}</span>
                    {call.phone && <span className="font-mono">{call.phone}</span>}
                    <span className="flex items-center gap-1"><Clock size={10} /> {searching ? `${fmtShort(call.date)} · ` : ''}{call.time}</span>
                    {call.agentName && <span className="flex items-center gap-1"><User size={10} /> {call.agentName}</span>}
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

        {visible.length === 0 && (
          <div className="flex flex-col items-center py-14 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            <Phone size={26} className="mb-2 opacity-30" />
            <p className="text-sm">
              {searching ? 'Aucun appel trouvé' : `Aucun appel ${isToday ? "aujourd'hui" : 'ce jour-là'}`}
            </p>
            {!searching && isToday && <p className="text-xs mt-1">Touchez « Nouvel appel » ou consultez les jours précédents ‹</p>}
          </div>
        )}
      </div>
    </div>
  );
};
