import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, User, Phone } from 'lucide-react';
import { useAgentsStore } from '../../store/agentsStore';
import { usePropertiesStore } from '../../store/propertiesStore';
import { useClientsStore } from '../../store/clientsStore';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Drawer } from '../../components/ui/Drawer';
import { PhoneReveal } from '../../components/shared/PhoneReveal';
import { BonDeVisiteButton } from '../../components/shared/BonDeVisiteButton';
import type { Appointment } from '../../types';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const TYPE_CONFIG: Record<Appointment['type'], { label: string; color: string; bg: string }> = {
  visite:   { label: 'Visite',    color: 'text-primary',  bg: 'bg-primary-light border-primary/20' },
  signature:{ label: 'Signature', color: 'text-success',  bg: 'bg-success-light border-success/20' },
  appel:    { label: 'Appel',     color: 'text-warning',  bg: 'bg-warning-light border-warning/20' },
  reunion:  { label: 'Réunion',   color: 'text-purple',   bg: 'bg-purple-light border-purple/20' },
  autre:    { label: 'Autre',     color: 'text-gray-600', bg: 'bg-gray-100 border-gray-200' },
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // Mon=0
}

function fmt(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export const AdminAgenda: React.FC = () => {
  const { appointments, addAppointment, addVisit, visits, agents } = useAgentsStore();
  const { properties } = usePropertiesStore();
  const { clients }    = useClientsStore();
  const [formError, setFormError] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const [viewDate, setViewDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState<string>(new Date().toISOString().slice(0, 10));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newAppt, setNewAppt] = useState({ title: '', time: '10:00', type: 'visite' as Appointment['type'], agentId: '', clientId: '', propertyId: '', notes: '' });

  // Opened from a bien/client ("Planifier une visite/RDV"): prefill + open the form.
  useEffect(() => {
    const property = searchParams.get('property');
    const client = searchParams.get('client');
    if (!property && !client && searchParams.get('open') !== '1') return;
    const prop = property ? properties.find((p) => p.id === property) : undefined;
    const cli  = client ? clients.find((c) => c.id === client) : undefined;
    setNewAppt((p) => ({
      ...p,
      type: 'visite',
      propertyId: property || '',
      clientId: client || '',
      agentId: prop?.agentId || cli?.agentId || p.agentId,
      title: prop ? `Visite — ${prop.title}` : cli ? `RDV — ${cli.name}` : p.title,
    }));
    setDrawerOpen(true);
    setSearchParams({}, { replace: true }); // consume the params so it won't reopen
  }, [searchParams, properties, clients, setSearchParams]);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth  = getDaysInMonth(year, month);
  const firstDay     = getFirstDayOfMonth(year, month);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  // appointments + visits on selected date
  const dayAppts = appointments
    .filter((a) => a.date === selected)
    .sort((a, b) => a.time.localeCompare(b.time));
  const dayVisits = visits
    .filter((v) => v.date === selected)
    .sort((a, b) => a.time.localeCompare(b.time));
  const dayCount = dayAppts.length + dayVisits.length;

  // count per day for dots (RDV + visites)
  const countByDate = new Map<string, number>();
  appointments.forEach((a) => countByDate.set(a.date, (countByDate.get(a.date) ?? 0) + 1));
  visits.forEach((v) => countByDate.set(v.date, (countByDate.get(v.date) ?? 0) + 1));

  const handleCreate = () => {
    if (!newAppt.title.trim()) { setFormError('Le titre est obligatoire.'); return; }

    // A "visite" becomes a real persisted Visit so the assigned agent sees it in
    // their app (journal / plan de visite). Other types stay as local RDV.
    if (newAppt.type === 'visite') {
      if (!newAppt.agentId || !newAppt.clientId || !newAppt.propertyId) {
        setFormError('Pour une visite : sélectionnez un agent, un client et un bien.');
        return;
      }
      addVisit({
        id:          `visit-${Date.now()}`,
        propertyId:  newAppt.propertyId,
        clientId:    newAppt.clientId,
        agentId:     newAppt.agentId,
        date:        selected,
        time:        newAppt.time,
        status:      'planifie',
        crSubmitted: false,
        notes:       newAppt.notes || undefined,
      });
    } else {
      addAppointment({
        id:       `appt-${Date.now()}`,
        title:    newAppt.title,
        date:     selected,
        time:     newAppt.time,
        duration: 60,
        type:       newAppt.type,
        agentId:    newAppt.agentId || agents[0]?.id || '',
        clientId:   newAppt.clientId || undefined,
        propertyId: newAppt.propertyId || undefined,
        status:     'planifie',
        notes:      newAppt.notes || undefined,
      });
    }
    setDrawerOpen(false);
    setFormError('');
    setNewAppt({ title: '', time: '10:00', type: 'visite', agentId: '', clientId: '', propertyId: '', notes: '' });
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Agenda</h2>
              <p className="text-sm text-gray-400">{appointments.length} rendez-vous planifiés</p>
            </div>
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus size={15} /> Nouveau RDV
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Month nav */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50">
                <ChevronLeft size={15} className="text-gray-500" />
              </button>
              <span className="text-sm font-semibold text-gray-900">{MONTHS[month]} {year}</span>
              <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50">
                <ChevronRight size={15} className="text-gray-500" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-gray-100">
              {DAYS.map((d) => (
                <div key={d} className="py-2 text-center text-xs font-medium text-gray-400">{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="h-16 border-r border-b border-gray-100" />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day     = i + 1;
                const dateStr = fmt(year, month, day);
                const count   = countByDate.get(dateStr) ?? 0;
                const isSelected = dateStr === selected;
                const isToday    = dateStr === new Date().toISOString().slice(0, 10);
                const colIdx  = (firstDay + i) % 7;
                return (
                  <div
                    key={day}
                    onClick={() => setSelected(dateStr)}
                    className={[
                      'h-16 border-r border-b border-gray-100 p-1.5 cursor-pointer transition-colors',
                      colIdx === 6 ? 'border-r-0' : '',
                      isSelected ? 'bg-primary-light' : 'hover:bg-gray-50',
                    ].join(' ')}
                  >
                    <div className={[
                      'w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mx-auto',
                      isSelected ? 'bg-primary text-white' : isToday ? 'bg-gray-100 text-primary font-bold' : 'text-gray-700',
                    ].join(' ')}>
                      {day}
                    </div>
                    {count > 0 && (
                      <div className="flex justify-center mt-0.5 gap-0.5">
                        {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                          <div key={j} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-primary/60' : 'bg-primary'}`} />
                        ))}
                        {count > 3 && <span className="text-xs text-gray-400">+{count - 3}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Day detail */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">
              {new Date(selected).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            <span className="text-xs text-gray-400">{dayCount} RDV</span>
          </div>

          <div className="space-y-2">
            {/* Visites (persistées — vues par l'agent) */}
            {dayVisits.map((visit) => {
              const agent  = agents.find((a) => a.id === visit.agentId);
              const client = visit.clientId ? clients.find((c) => c.id === visit.clientId) : undefined;
              const prop   = visit.propertyId ? properties.find((p) => p.id === visit.propertyId) : undefined;
              return (
                <div key={visit.id} className="bg-white rounded-xl border p-3 bg-primary-light border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-gray-700">{visit.time}</span>
                    <Badge variant={visit.status === 'effectue' ? 'gray' : 'info'} size="sm" dot />
                    <span className="text-xs font-medium text-primary">Visite</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">{prop?.title ?? 'Bien'}</div>
                  {prop && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <MapPin size={11} /> {prop.location}
                    </div>
                  )}
                  {client && (
                    <div className="flex items-center gap-2">
                      <User size={11} className="text-gray-400" />
                      <span className="text-xs text-gray-600">{client.name}</span>
                      <PhoneReveal phone={client.phone} name={client.name} className="ml-auto">
                        <Phone size={12} className="text-primary" />
                      </PhoneReveal>
                    </div>
                  )}
                  {agent && (
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-primary/10">
                      <Avatar initials={agent.initials} size="xs" />
                      <span className="text-xs text-gray-500">{agent.name}</span>
                    </div>
                  )}
                  <BonDeVisiteButton
                    clientName={client?.name}
                    visitDate={visit.date}
                    propertyRef={prop?.ref}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 border border-primary/30 text-primary rounded-lg text-xs font-medium hover:bg-primary/5 transition-colors"
                  />
                </div>
              );
            })}

            {dayAppts.map((appt) => {
              const cfg     = TYPE_CONFIG[appt.type];
              const agent   = agents.find((a) => a.id === appt.agentId);
              const client  = appt.clientId ? clients.find((c) => c.id === appt.clientId) : undefined;
              const prop    = appt.propertyId ? properties.find((p) => p.id === appt.propertyId) : undefined;

              return (
                <div key={appt.id} className={`bg-white rounded-xl border p-3 ${cfg.bg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-gray-700">{appt.time}</span>
                    <Badge variant={appt.status === 'confirme' ? 'disponible' : appt.status === 'annule' ? 'gray' : 'info'} size="sm" dot />
                    <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">{appt.title}</div>
                  {prop && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <MapPin size={11} /> {prop.location}
                    </div>
                  )}
                  {client && (
                    <div className="flex items-center gap-2">
                      <User size={11} className="text-gray-400" />
                      <span className="text-xs text-gray-600">{client.name}</span>
                      <PhoneReveal phone={client.phone} name={client.name} className="ml-auto">
                        <Phone size={12} className="text-primary" />
                      </PhoneReveal>
                    </div>
                  )}
                  {agent && (
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
                      <Avatar initials={agent.initials} size="xs" />
                      <span className="text-xs text-gray-500">{agent.name}</span>
                    </div>
                  )}
                  {appt.notes && (
                    <p className="text-xs text-gray-400 italic mt-1 border-t border-gray-100 pt-1">{appt.notes}</p>
                  )}
                </div>
              );
            })}

            {dayCount === 0 && (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                <Clock size={24} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">Aucun RDV ce jour</p>
                <button onClick={() => setDrawerOpen(true)} className="mt-2 text-xs text-primary hover:underline">
                  + Ajouter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer nouveau RDV */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Nouveau rendez-vous" subtitle={selected} width="md">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Titre *</label>
            <input
              type="text"
              value={newAppt.title}
              onChange={(e) => setNewAppt((p) => ({ ...p, title: e.target.value }))}
              placeholder="Visite appartement Marsa…"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Date</label>
              <input
                type="date"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Heure</label>
              <input
                type="time"
                value={newAppt.time}
                onChange={(e) => setNewAppt((p) => ({ ...p, time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Type</label>
            <select
              value={newAppt.type}
              onChange={(e) => setNewAppt((p) => ({ ...p, type: e.target.value as Appointment['type'] }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Agent</label>
            <select
              value={newAppt.agentId}
              onChange={(e) => setNewAppt((p) => ({ ...p, agentId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">— Choisir —</option>
              {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Client (optionnel)</label>
            <select
              value={newAppt.clientId}
              onChange={(e) => setNewAppt((p) => ({ ...p, clientId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">— Aucun —</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Bien (optionnel)</label>
            <select
              value={newAppt.propertyId}
              onChange={(e) => setNewAppt((p) => ({ ...p, propertyId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">— Aucun —</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.ref} · {p.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Notes</label>
            <textarea
              value={newAppt.notes}
              onChange={(e) => setNewAppt((p) => ({ ...p, notes: e.target.value }))}
              rows={3}
              placeholder="Informations complémentaires…"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
          {newAppt.type === 'visite' && (
            <p className="text-xs text-gray-400">Une visite est envoyée à l'agent : agent, client et bien sont requis.</p>
          )}
          {formError && <p className="text-xs text-danger">{formError}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setDrawerOpen(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
            <button onClick={handleCreate} className="flex-1 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90">Créer le RDV</button>
          </div>
        </div>
      </Drawer>
    </>
  );
};
